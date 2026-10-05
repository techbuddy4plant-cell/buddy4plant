import { Order, StoreSettings } from '../types';

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const money = (n: number) => (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const longDate = (ms: number) => new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

/** A4 invoice for one order, as a complete HTML page. */
export function buildInvoiceHtml(order: Order, settings?: Partial<StoreSettings>): string {
  const s = (settings || {}) as Partial<StoreSettings> & { gstin?: string };
  const origin = window.location.origin;
  const a = order.shippingAddress || ({} as Order['shippingAddress']);
  const gstin = (s.gstin || '').trim();
  const paidOnline = order.paymentMethod === 'razorpay';
  const invoiceNo = order.orderNumber.replace(/^([A-Za-z0-9]+)-/, '$1-INV-');
  const site = window.location.hostname.includes('localhost') ? 'buddy4plant.in' : window.location.hostname;

  const addr = [
    esc(a.fullName || order.customerName),
    esc(a.street),
    a.landmark ? esc(a.landmark) : '',
    esc([a.city, a.state].filter(Boolean).join(', ')) + (a.pincode ? ` - ${esc(a.pincode)}` : ''),
    `Phone: ${esc(a.phone || order.customerPhone)}`,
  ]
    .filter(Boolean)
    .join('<br>');

  const rows = order.items
    .map((it, i) => {
      const variant = [it.selectedSize, it.selectedWeight, it.selectedPotColor].filter(Boolean).join(' · ');
      return `<tr>
        <td class="c">${i + 1}</td>
        <td>${esc(it.name)}${variant ? `<span class="v">${esc(variant)}</span>` : ''}</td>
        <td class="c sku">${esc(it.sku || '-')}</td>
        <td class="c">${it.quantity}</td>
        <td class="r">${money(it.price)}</td>
        <td class="r">${money(it.price * it.quantity)}</td>
      </tr>`;
    })
    .join('');

  const line = (label: string, value: string) => `<tr><td>${label}</td><td class="r">${value}</td></tr>`;
  const totals = [
    line('Subtotal', `₹${money(order.subtotal)}`),
    order.discount > 0 ? line(`Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ''}`, `- ₹${money(order.discount)}`) : '',
    line('Shipping', order.shippingCharge > 0 ? `₹${money(order.shippingCharge)}` : 'FREE'),
    order.tax > 0 ? line('Tax', `₹${money(order.tax)}`) : '',
  ].join('');

  const payment = paidOnline
    ? `Paid online via Razorpay${order.razorpayPaymentId ? ` (Payment ID: ${esc(order.razorpayPaymentId)})` : ''}`
    : order.paymentStatus === 'paid'
    ? 'Cash on Delivery - paid'
    : `Cash on Delivery - ₹${money(order.total)} to be paid on delivery`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Invoice ${esc(invoiceNo)} - Buddy4Plant</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c231d; font-size: 12.5px; line-height: 1.5; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { position: relative; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 15mm 14mm; background: #fbfaf5; overflow: hidden; }
  .wm { position: absolute; left: 50%; top: 52%; width: 120mm; transform: translate(-50%, -50%); opacity: 0.07; pointer-events: none; }
  .content { position: relative; }
  h1 { margin: 0 0 6mm; text-align: center; font-size: 27px; letter-spacing: 0.06em; color: #1f5a37; font-weight: 800; }
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
  table.items th { background: #dfe9d6; color: #1c231d; font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; padding: 3mm 2.5mm; border: 1px solid #b9c4b2; }
  table.items td { padding: 3mm 2.5mm; border: 1px solid #c9d1c4; vertical-align: top; background: rgba(255,255,255,0.55); }
  tr { page-break-inside: avoid; }
  .c { text-align: center; } .r { text-align: right; white-space: nowrap; }
  .sku { font-size: 11px; word-break: break-all; }
  .v { display: block; font-size: 11px; color: #5a6457; }
  .totals { margin: 5mm 0 0 auto; width: 78mm; border-collapse: collapse; }
  .totals td { padding: 1.8mm 2mm; border-bottom: 1px solid #d5dbd0; }
  .totals td:first-child { text-align: right; font-weight: 600; }
  .totals tr.grand td { border-top: 1.5px solid #1c231d; border-bottom: 1.5px solid #1c231d; font-size: 14.5px; font-weight: 800; padding: 2.6mm 2mm; }
  .notes { margin-top: 8mm; }
  .notes p { margin: 0 0 1.5mm; }
  .thanks { margin-top: 12mm; text-align: center; font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 21px; color: #1f5a37; }
  .foot { margin-top: 4mm; text-align: center; font-size: 10.5px; color: #6b7468; }
  @media screen { body { background: #e9e6dd; padding: 8mm 0; } .page { box-shadow: 0 6px 30px rgba(0,0,0,0.15); } }
</style></head>
<body><div class="page">
  <img class="wm" src="${origin}/logo.png" alt="">
  <div class="content">
    <h1>${gstin ? 'TAX INVOICE' : 'INVOICE'}</h1>
    <div class="head">
      <div class="co">
        <img class="logo" src="${origin}/logo.png" alt="Buddy4Plant">
        <b>BUDDY4PLANT</b>
        <i>Plants, pots and garden services</i>
        ${esc(s.storeAddress || 'Lucknow, Uttar Pradesh, India')}<br>
        Phone: ${esc(s.contactPhone || '+91 80048 81668')} (WhatsApp support)<br>
        Email: ${esc(s.contactEmail || 'contactus@buddy4plant.in')}<br>
        Website: ${esc(site)}
        ${gstin ? `<br>GSTIN: ${esc(gstin)}` : ''}
      </div>
      <div class="meta">
        <div><b>INVOICE NO:</b> ${esc(invoiceNo)}</div>
        <div><b>DATE:</b> ${longDate(order.createdAt)}</div>
        <div><b>ORDER ID:</b> ${esc(order.orderNumber)}</div>
      </div>
    </div>

    <div class="parties">
      <div><div class="lbl">BILL TO:</div>${addr}${order.customerEmail ? `<br>${esc(order.customerEmail)}` : ''}</div>
      <div><div class="lbl">SHIP TO:</div>${addr}${order.estimatedDeliveryDate ? `<br>(Estimated arrival: ${esc(order.estimatedDeliveryDate)})` : ''}</div>
    </div>

    <table class="items">
      <thead><tr>
        <th style="width:11mm">S.No.</th><th>Item description</th><th style="width:30mm">SKU</th>
        <th style="width:13mm">Qty</th><th style="width:25mm">Unit price (₹)</th><th style="width:27mm">Amount (₹)</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals">
      ${totals}
      <tr class="grand"><td>Total${gstin ? ' (GST incl.)' : ''}:</td><td class="r">₹${money(order.total)}</td></tr>
    </table>

    <div class="notes">
      <p><b>PAYMENT INFO:</b> ${payment}</p>
      <p><b>ORDER STATUS:</b> ${esc(order.orderStatus)}</p>
      ${order.notes ? `<p><b>ORDER NOTES:</b> ${esc(order.notes)}</p>` : ''}
    </div>

    <div class="thanks">Thank you for bringing green home!</div>
    <div class="foot">This is a computer-generated invoice and does not need a signature.</div>
  </div>
</div></body></html>`;
}

/** Opens the print dialog with the invoice (choose "Save as PDF" to download it). */
export function printInvoice(order: Order, settings?: Partial<StoreSettings>) {
  const old = document.getElementById('b4p-invoice-frame');
  if (old) old.remove();
  const frame = document.createElement('iframe');
  frame.id = 'b4p-invoice-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(frame);
  const doc = frame.contentWindow!.document;
  doc.open();
  doc.write(buildInvoiceHtml(order, settings));
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
