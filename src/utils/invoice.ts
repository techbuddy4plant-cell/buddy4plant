import { Order, StoreSettings } from '../types';
import { InvoiceSettings, getInvoiceSettings, getInvoiceSettingsNow } from '../services/invoiceSettingsService';

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const money = (n: number) => (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const longDate = (ms: number) => new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
const round2 = (n: number) => Math.round(n * 100) / 100;
const safeColor = (c: string) => (/^#[0-9a-f]{3,8}$/i.test(c || '') ? c : '#1f5a37');
const safeUrl = (u: string, origin: string) => {
  const s = String(u || '').trim();
  if (!s) return '';
  if (s.startsWith('/')) return origin + s;
  return /^https:\/\//i.test(s) || /^data:image\//i.test(s) ? s : '';
};

/** "Rupees Five Hundred Ninety Eight Only" (Indian numbering) */
export function amountInWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (n: number) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`);
  const three = (n: number) => `${n >= 100 ? ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' : '') : ''}${n % 100 ? two(n % 100) : ''}`;
  const words = (n: number): string => {
    if (n === 0) return 'Zero';
    const parts: string[] = [];
    const crore = Math.floor(n / 1e7);
    const lakh = Math.floor((n % 1e7) / 1e5);
    const thousand = Math.floor((n % 1e5) / 1e3);
    const rest = n % 1e3;
    if (crore) parts.push(`${words(crore)} Crore`);
    if (lakh) parts.push(`${two(lakh)} Lakh`);
    if (thousand) parts.push(`${two(thousand)} Thousand`);
    if (rest) parts.push(three(rest));
    return parts.join(' ');
  };
  const rupees = Math.floor(Math.abs(amount) + 1e-9);
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  return `Rupees ${words(rupees)}${paise ? ` and ${two(paise)} Paise` : ''} Only`;
}

/** Invoice number of an order: the one given by the server, or (older orders) made from the order number. */
export const invoiceNumberOf = (order: Order) =>
  order.invoiceNumber || order.orderNumber.replace(/^([A-Za-z0-9]+)-/, '$1-INV-');

interface TaxLine {
  name: string;
  variant: string;
  sku: string;
  hsn: string;
  qty: number;
  unit: number;
  amount: number; // after its share of the discount, GST included
  rate: number;
  taxable: number;
  tax: number;
}

/** GST inside the (GST-inclusive) prices: per line, discount shared out in proportion, shipping as its own line. */
function gstLines(order: Order, inv: InvoiceSettings) {
  const subtotal = order.items.reduce((s, it) => s + it.price * it.quantity, 0) || 1;
  const discount = Math.min(Number(order.discount) || 0, subtotal);
  const lines: TaxLine[] = order.items.map((it) => {
    const ct = (it.category && inv.categoryTax[it.category]) || null;
    const rate = Number(ct?.rate ?? inv.defaultGstRate) || 0;
    const gross = it.price * it.quantity;
    const amount = gross - (discount * gross) / subtotal;
    const taxable = amount / (1 + rate / 100);
    return {
      name: it.name,
      variant: [it.selectedSize, it.selectedWeight, it.selectedPotColor].filter(Boolean).join(' · '),
      sku: it.sku || '',
      hsn: ct?.hsn || inv.defaultHsn || '',
      qty: it.quantity,
      unit: it.price,
      amount,
      rate,
      taxable,
      tax: amount - taxable,
    };
  });
  const ship = Number(order.shippingCharge) || 0;
  if (ship > 0) {
    const rate = Number(inv.shippingGstRate) || 0;
    const taxable = ship / (1 + rate / 100);
    lines.push({ name: 'Shipping & handling', variant: '', sku: '', hsn: '9965', qty: 1, unit: ship, amount: ship, rate, taxable, tax: ship - taxable });
  }
  return lines;
}

/** Same state as the shop (CGST + SGST) or another state (IGST)? */
const intraState = (order: Order, inv: InvoiceSettings) => {
  const st = String(order.shippingAddress?.state || '').trim().toLowerCase();
  return !st || st === String(inv.stateName || '').trim().toLowerCase();
};

/** A4 invoice for one order, as a complete HTML page. */
export function buildInvoiceHtml(order: Order, settings?: Partial<StoreSettings>, invoiceSettings?: InvoiceSettings): string {
  const s = (settings || {}) as Partial<StoreSettings>;
  const inv = invoiceSettings || getInvoiceSettingsNow();
  const origin = window.location.origin;
  const a = order.shippingAddress || ({} as Order['shippingAddress']);
  const gstin = (inv.gstin || '').trim().toUpperCase();
  const accent = safeColor(inv.accentColor);
  const logo = safeUrl(inv.logoUrl || '/logo.png', origin) || `${origin}/logo.png`;
  const signature = safeUrl(inv.signatureUrl, origin);
  const paidOnline = order.paymentMethod === 'razorpay';
  const invoiceNo = invoiceNumberOf(order);
  const site = inv.website || (window.location.hostname.includes('localhost') ? 'buddy4plant.in' : window.location.hostname);
  const title = inv.title && inv.title !== 'auto' ? inv.title : gstin ? 'TAX INVOICE' : 'INVOICE';
  const cancelled = order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded';
  const breakdown = !!gstin && inv.showGstBreakdown;
  const intra = intraState(order, inv);

  const addr = [
    esc(a.fullName || order.customerName),
    esc(a.street),
    a.landmark ? esc(a.landmark) : '',
    esc([a.city, a.state].filter(Boolean).join(', ')) + (a.pincode ? ` - ${esc(a.pincode)}` : ''),
    `Phone: ${esc(a.phone || order.customerPhone)}`,
  ]
    .filter(Boolean)
    .join('<br>');

  let head = '';
  let rows = '';
  let totals = '';
  if (breakdown) {
    const lines = gstLines(order, inv);
    head = `<th style="width:9mm">S.No.</th><th>Item description</th><th style="width:16mm">HSN</th><th style="width:10mm">Qty</th>
      <th style="width:21mm">Rate (₹)</th><th style="width:24mm">Taxable (₹)</th><th style="width:13mm">GST</th><th style="width:24mm">Amount (₹)</th>`;
    rows = lines
      .map(
        (l, i) => `<tr>
        <td class="c">${i + 1}</td>
        <td>${esc(l.name)}${l.variant ? `<span class="v">${esc(l.variant)}</span>` : ''}${inv.showSku && l.sku ? `<span class="v">SKU: ${esc(l.sku)}</span>` : ''}</td>
        <td class="c sku">${esc(l.hsn || '-')}</td>
        <td class="c">${l.qty}</td>
        <td class="r">${money(l.unit)}</td>
        <td class="r">${money(round2(l.taxable))}</td>
        <td class="c">${l.rate}%</td>
        <td class="r">${money(round2(l.amount))}</td>
      </tr>`
      )
      .join('');
    const taxable = lines.reduce((t, l) => t + l.taxable, 0);
    const tax = lines.reduce((t, l) => t + l.tax, 0);
    totals = [
      line('Taxable value', `₹${money(round2(taxable))}`),
      intra
        ? line('CGST', `₹${money(round2(tax / 2))}`) + line('SGST', `₹${money(round2(tax - round2(tax / 2)))}`)
        : line('IGST', `₹${money(round2(tax))}`),
      order.discount > 0 ? line(`Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ''} - already taken off the amounts above`, `- ₹${money(order.discount)}`) : '',
    ].join('');
  } else {
    head = `<th style="width:11mm">S.No.</th><th>Item description</th>${inv.showSku ? '<th style="width:30mm">SKU</th>' : ''}
      <th style="width:13mm">Qty</th><th style="width:25mm">Unit price (₹)</th><th style="width:27mm">Amount (₹)</th>`;
    rows = order.items
      .map((it, i) => {
        const variant = [it.selectedSize, it.selectedWeight, it.selectedPotColor].filter(Boolean).join(' · ');
        return `<tr>
        <td class="c">${i + 1}</td>
        <td>${esc(it.name)}${variant ? `<span class="v">${esc(variant)}</span>` : ''}</td>
        ${inv.showSku ? `<td class="c sku">${esc(it.sku || '-')}</td>` : ''}
        <td class="c">${it.quantity}</td>
        <td class="r">${money(it.price)}</td>
        <td class="r">${money(it.price * it.quantity)}</td>
      </tr>`;
      })
      .join('');
    totals = [
      line('Subtotal', `₹${money(order.subtotal)}`),
      order.discount > 0 ? line(`Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ''}`, `- ₹${money(order.discount)}`) : '',
      line('Shipping', order.shippingCharge > 0 ? `₹${money(order.shippingCharge)}` : 'FREE'),
      order.tax > 0 ? line('Tax', `₹${money(order.tax)}`) : '',
    ].join('');
  }

  const payment = paidOnline
    ? `Paid online via Razorpay${inv.showPaymentId && order.razorpayPaymentId ? ` (Payment ID: ${esc(order.razorpayPaymentId)})` : ''}`
    : order.paymentStatus === 'paid'
    ? 'Cash on Delivery - paid'
    : `Cash on Delivery - ₹${money(order.total)} to be paid on delivery`;

  const taxIds = [gstin ? `GSTIN: ${esc(gstin)}` : '', inv.pan ? `PAN: ${esc(inv.pan)}` : '', gstin && inv.stateName ? `State: ${esc(inv.stateName)}${inv.stateCode ? ` (${esc(inv.stateCode)})` : ''}` : '']
    .filter(Boolean)
    .join('<br>');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Invoice ${esc(invoiceNo)} - ${esc(inv.businessName || 'Buddy4Plant')}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c231d; font-size: 12.5px; line-height: 1.5; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { position: relative; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 15mm 14mm; background: #fbfaf5; overflow: hidden; }
  .wm { position: absolute; left: 50%; top: 52%; width: 120mm; transform: translate(-50%, -50%); opacity: 0.07; pointer-events: none; }
  .stamp { position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%) rotate(-18deg); font-size: 64px; font-weight: 900; letter-spacing: .12em; color: rgba(190,30,45,.18); border: 6px solid rgba(190,30,45,.18); padding: 4mm 10mm; border-radius: 6mm; }
  .content { position: relative; }
  h1 { margin: 0 0 6mm; text-align: center; font-size: 27px; letter-spacing: 0.06em; color: ${accent}; font-weight: 800; }
  .head { display: flex; justify-content: space-between; gap: 10mm; padding-bottom: 6mm; border-bottom: 1px solid #cfd6cc; }
  .logo { height: 24mm; display: block; margin-bottom: 2mm; }
  .co b { font-size: 15px; letter-spacing: 0.02em; }
  .co i { display: block; color: #55604f; margin-bottom: 1.5mm; }
  .meta { text-align: right; white-space: nowrap; align-self: center; }
  .meta div { margin-bottom: 1mm; }
  .meta b { letter-spacing: 0.03em; }
  .parties { display: flex; gap: 10mm; padding: 6mm 0; }
  .parties > div { flex: 1; }
  .lbl { font-weight: 700; letter-spacing: 0.04em; margin-bottom: 1mm; }
  table.items { width: 100%; border-collapse: collapse; }
  table.items th { background: ${accent}22; color: #1c231d; font-size: 10.5px; letter-spacing: 0.04em; text-transform: uppercase; padding: 3mm 2mm; border: 1px solid #b9c4b2; }
  table.items td { padding: 3mm 2mm; border: 1px solid #c9d1c4; vertical-align: top; background: rgba(255,255,255,0.55); }
  tr { page-break-inside: avoid; }
  .c { text-align: center; } .r { text-align: right; white-space: nowrap; }
  .sku { font-size: 11px; word-break: break-all; }
  .v { display: block; font-size: 11px; color: #5a6457; }
  .totals { margin: 5mm 0 0 auto; width: 86mm; border-collapse: collapse; }
  .totals td { padding: 1.8mm 2mm; border-bottom: 1px solid #d5dbd0; }
  .totals td:first-child { text-align: right; font-weight: 600; }
  .totals tr.grand td { border-top: 1.5px solid #1c231d; border-bottom: 1.5px solid #1c231d; font-size: 14.5px; font-weight: 800; padding: 2.6mm 2mm; }
  .words { margin-top: 3mm; text-align: right; font-size: 11.5px; color: #3c463b; }
  .notes { margin-top: 8mm; }
  .notes p { margin: 0 0 1.5mm; }
  .terms { margin-top: 4mm; font-size: 11px; color: #4b5449; white-space: pre-line; }
  .sign { margin-top: 10mm; display: flex; justify-content: flex-end; }
  .sign div { text-align: center; min-width: 55mm; }
  .sign img { max-height: 18mm; max-width: 55mm; display: block; margin: 0 auto 1mm; }
  .sign span { display: block; border-top: 1px solid #8a9386; padding-top: 1mm; font-size: 11px; }
  .thanks { margin-top: 10mm; text-align: center; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 21px; color: ${accent}; }
  .foot { margin-top: 4mm; text-align: center; font-size: 10.5px; color: #6b7468; }
  @media screen { body { background: #e9e6dd; padding: 8mm 0; } .page { box-shadow: 0 6px 30px rgba(0,0,0,0.15); } }
</style></head>
<body><div class="page">
  ${inv.showWatermark ? `<img class="wm" src="${esc(logo)}" alt="">` : ''}
  ${cancelled ? '<div class="stamp">CANCELLED</div>' : ''}
  <div class="content">
    <h1>${esc(title)}</h1>
    <div class="head">
      <div class="co">
        <img class="logo" src="${esc(logo)}" alt="${esc(inv.businessName || 'Buddy4Plant')}">
        <b>${esc(inv.businessName || 'BUDDY4PLANT')}</b>
        ${inv.tagline ? `<i>${esc(inv.tagline)}</i>` : ''}
        ${esc(inv.address || s.storeAddress || 'Lucknow, Uttar Pradesh, India')}<br>
        Phone: ${esc(inv.phone || s.contactPhone || '+91 80048 81668')}<br>
        Email: ${esc(inv.email || s.contactEmail || 'contactus@buddy4plant.in')}<br>
        Website: ${esc(site)}
        ${taxIds ? `<br>${taxIds}` : ''}
      </div>
      <div class="meta">
        <div><b>INVOICE NO:</b> ${esc(invoiceNo)}</div>
        <div><b>DATE:</b> ${longDate(order.invoiceDate || order.createdAt)}</div>
        <div><b>ORDER ID:</b> ${esc(order.orderNumber)}</div>
        ${gstin ? `<div><b>PLACE OF SUPPLY:</b> ${esc(a.state || inv.stateName || '-')}</div>` : ''}
      </div>
    </div>

    <div class="parties">
      <div><div class="lbl">BILL TO:</div>${addr}${order.customerEmail ? `<br>${esc(order.customerEmail)}` : ''}</div>
      <div><div class="lbl">SHIP TO:</div>${addr}${inv.showEta && order.estimatedDeliveryDate ? `<br>(Estimated arrival: ${esc(order.estimatedDeliveryDate)})` : ''}</div>
    </div>

    <table class="items">
      <thead><tr>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals">
      ${totals}
      <tr class="grand"><td>Total${gstin ? ' (GST incl.)' : ''}:</td><td class="r">₹${money(order.total)}</td></tr>
    </table>
    ${gstin ? `<div class="words">${esc(amountInWords(order.total))}</div>` : ''}

    <div class="notes">
      <p><b>PAYMENT INFO:</b> ${payment}</p>
      <p><b>ORDER STATUS:</b> ${esc(order.orderStatus)}</p>
      ${inv.showNotes && order.notes ? `<p><b>ORDER NOTES:</b> ${esc(order.notes)}</p>` : ''}
      ${inv.terms ? `<div class="terms"><b>Terms:</b> ${esc(inv.terms)}</div>` : ''}
    </div>

    ${signature ? `<div class="sign"><div>${`<img src="${esc(signature)}" alt="">`}<span>For ${esc(inv.businessName || 'BUDDY4PLANT')}<br>${esc(inv.signatoryLabel || 'Authorised Signatory')}</span></div></div>` : ''}

    ${inv.thanksText ? `<div class="thanks">${esc(inv.thanksText)}</div>` : ''}
    ${inv.footerNote ? `<div class="foot">${esc(inv.footerNote)}</div>` : ''}
  </div>
</div></body></html>`;
}

function line(label: string, value: string) {
  return `<tr><td>${label}</td><td class="r">${value}</td></tr>`;
}

/**
 * Opens the print dialog with the invoice (choose "Save as PDF" to download it).
 * A very new order may still be waiting for its invoice number - it is fetched first.
 */
export async function printInvoice(order: Order, settings?: Partial<StoreSettings>) {
  const inv = await getInvoiceSettings();
  let o = order;
  if (!o.invoiceNumber && Date.now() - o.createdAt < 3 * 86400000) {
    try {
      const { getOrderById } = await import('../services/orderService');
      const fresh = await getOrderById(o.id);
      if (fresh?.invoiceNumber) o = { ...o, ...fresh };
    } catch {
      /* print with what we have */
    }
  }
  const old = document.getElementById('b4p-invoice-frame');
  if (old) old.remove();
  const frame = document.createElement('iframe');
  frame.id = 'b4p-invoice-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(frame);
  const doc = frame.contentWindow!.document;
  doc.open();
  doc.write(buildInvoiceHtml(o, settings, inv));
  doc.close();
  const go = () => {
    try {
      frame.contentWindow!.focus();
      frame.contentWindow!.print();
    } catch {
      /* ignore */
    }
  };
  // wait for the logo so it is on the printed page
  const imgs = Array.from(doc.images);
  let left = imgs.filter((im) => !im.complete).length;
  if (!left) return void setTimeout(go, 150);
  const done = () => { if (--left <= 0) setTimeout(go, 100); };
  imgs.forEach((im) => { if (!im.complete) { im.onload = done; im.onerror = done; } });
  setTimeout(() => { if (left > 0) { left = 0; go(); } }, 2500);
}
