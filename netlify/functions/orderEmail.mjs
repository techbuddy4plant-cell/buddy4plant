// "You got a new order!" email to the shop, sent with Cloudflare Email Routing (free).
//
// Setup (once): Cloudflare > buddy4plant.in > Email > Email Routing: turn it on and add + verify the address
// that should receive the alerts. Then in wrangler.jsonc the "send_email" binding ORDER_EMAIL is enabled and
// these variables are set (Workers > buddy4plant > Settings > Variables):
//   ORDER_EMAIL_TO    - where alerts go (a verified Email Routing destination; several: comma-separated)
//   ORDER_EMAIL_FROM  - optional, default orders@buddy4plant.in (must be on the domain)
// The worker passes the binding in as globalThis.B4P_ORDER_EMAIL (+ the EmailMessage class) - see worker/index.mjs.

const env = (name) => String((typeof process !== 'undefined' && process.env && process.env[name]) || '').trim();
const SITE = 'https://buddy4plant.in';

const recipients = () => env('ORDER_EMAIL_TO').split(/[,\s;]+/).map((x) => x.trim().toLowerCase()).filter((x) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(x)).slice(0, 5);
export const emailReady = () => !!(globalThis.B4P_ORDER_EMAIL && globalThis.B4P_EmailMessage && recipients().length);

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupees = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const b64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/.{1,76}/g, '$&\r\n');
};
const header = (str) => `=?UTF-8?B?${b64(str).replace(/\r\n/g, '')}?=`;
const istTime = (ms) => new Date(Number(ms) || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

export function buildOrderEmail(o) {
  const a = o.shippingAddress || {};
  const payment = o.paymentMethod === 'cod' ? 'Cash on Delivery' : `Paid online${o.razorpayPaymentId ? ` (${o.razorpayPaymentId})` : ''}`;
  const items = (o.items || []).map((it) => {
    const variant = [it.selectedSize, it.selectedWeight, it.selectedPotColor].filter(Boolean).join(' / ');
    const qty = Math.max(1, Number(it.quantity) || 1);
    return { name: `${it.name}${variant ? ` (${variant})` : ''}`, qty, price: Number(it.price) || 0 };
  });
  const subject = `🌿 New order ${o.invoiceNumber || o.orderNumber} - ${rupees(o.total)} (${o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid online'})`;
  const addr = [a.fullName || o.customerName, a.street, a.landmark, [a.city, a.state].filter(Boolean).join(', ') + (a.pincode ? ` - ${a.pincode}` : '')].filter(Boolean);
  const phone = a.phone || o.customerPhone || '';

  const text = [
    `New order on buddy4plant.in`,
    ``,
    `Order: ${o.orderNumber}${o.invoiceNumber ? `   Invoice: ${o.invoiceNumber}` : ''}`,
    `Placed: ${istTime(o.createdAt)}`,
    `Payment: ${payment}`,
    ``,
    `Customer: ${o.customerName || a.fullName || ''}`,
    `Phone: ${phone}`,
    `Email: ${o.customerEmail || '-'}`,
    `Deliver to: ${addr.join(', ')}`,
    ``,
    `Items:`,
    ...items.map((it) => `  ${it.qty} x ${it.name} - ${rupees(it.price * it.qty)}`),
    ``,
    `Subtotal: ${rupees(o.subtotal)}`,
    ...(Number(o.discount) > 0 ? [`Discount${o.couponCode ? ` (${o.couponCode})` : ''}: -${rupees(o.discount)}`] : []),
    `Shipping: ${Number(o.shippingCharge) > 0 ? rupees(o.shippingCharge) : 'FREE'}`,
    `TOTAL: ${rupees(o.total)}`,
    ...(o.notes ? [``, `Notes: ${o.notes}`] : []),
    ``,
    `Open in Admin: ${SITE}/b4padmin`,
  ].join('\r\n');

  const row = (k, v) => `<tr><td style="padding:4px 12px 4px 0;color:#5a6457;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:4px 0;color:#1c231d">${v}</td></tr>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#1c231d">
<div style="max-width:560px;margin:0 auto;padding:20px">
 <div style="background:#13301b;color:#fff;border-radius:14px 14px 0 0;padding:18px 22px">
  <div style="font-size:12px;letter-spacing:.12em;opacity:.8">BUDDY4PLANT</div>
  <div style="font-size:20px;font-weight:700;margin-top:4px">🌿 You got a new order!</div>
 </div>
 <div style="background:#fff;border-radius:0 0 14px 14px;padding:20px 22px">
  <table style="border-collapse:collapse;width:100%">
   ${row('Order', `<b>${esc(o.orderNumber)}</b>${o.invoiceNumber ? ` &nbsp;·&nbsp; Invoice ${esc(o.invoiceNumber)}` : ''}`)}
   ${row('Placed', esc(istTime(o.createdAt)))}
   ${row('Payment', esc(payment))}
   ${row('Customer', esc(o.customerName || a.fullName || ''))}
   ${row('Phone', phone ? `<a href="tel:${esc(phone)}" style="color:#1f6b3a">${esc(phone)}</a> &nbsp; <a href="https://wa.me/91${esc(String(phone).replace(/\D/g, '').slice(-10))}" style="color:#1f6b3a">WhatsApp</a>` : '-')}
   ${row('Email', esc(o.customerEmail || '-'))}
   ${row('Deliver to', addr.map(esc).join('<br>'))}
  </table>
  <table style="border-collapse:collapse;width:100%;margin-top:16px">
   <tr style="background:#eef3ea"><th align="left" style="padding:8px">Item</th><th style="padding:8px">Qty</th><th align="right" style="padding:8px">Amount</th></tr>
   ${items.map((it) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${esc(it.name)}</td><td align="center" style="padding:8px;border-bottom:1px solid #eee">${it.qty}</td><td align="right" style="padding:8px;border-bottom:1px solid #eee">${rupees(it.price * it.qty)}</td></tr>`).join('')}
   <tr><td colspan="2" align="right" style="padding:6px 8px;color:#5a6457">Subtotal</td><td align="right" style="padding:6px 8px">${rupees(o.subtotal)}</td></tr>
   ${Number(o.discount) > 0 ? `<tr><td colspan="2" align="right" style="padding:6px 8px;color:#5a6457">Discount${o.couponCode ? ` (${esc(o.couponCode)})` : ''}</td><td align="right" style="padding:6px 8px">-${rupees(o.discount)}</td></tr>` : ''}
   <tr><td colspan="2" align="right" style="padding:6px 8px;color:#5a6457">Shipping</td><td align="right" style="padding:6px 8px">${Number(o.shippingCharge) > 0 ? rupees(o.shippingCharge) : 'FREE'}</td></tr>
   <tr><td colspan="2" align="right" style="padding:10px 8px;font-weight:700;border-top:2px solid #13301b">TOTAL</td><td align="right" style="padding:10px 8px;font-weight:700;border-top:2px solid #13301b">${rupees(o.total)}</td></tr>
  </table>
  ${o.notes ? `<p style="margin:14px 0 0;color:#5a6457"><b>Notes:</b> ${esc(o.notes)}</p>` : ''}
  <p style="margin:22px 0 4px;text-align:center"><a href="${SITE}/b4padmin" style="display:inline-block;background:#1f6b3a;color:#fff;text-decoration:none;padding:12px 26px;border-radius:999px;font-weight:700">Open in Admin</a></p>
 </div>
 <p style="text-align:center;color:#8a8f86;font-size:11px;margin-top:12px">Sent automatically by buddy4plant.in</p>
</div></body></html>`;
  return { subject, text, html };
}

function mime(from, to, { subject, text, html }) {
  const boundary = `b4p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const id = `<${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}@buddy4plant.in>`;
  return [
    `From: Buddy4Plant Orders <${from}>`,
    `To: <${to}>`,
    `Subject: ${header(subject)}`,
    `Message-ID: ${id}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(html),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

/** Sends the alert to every ORDER_EMAIL_TO address. Returns { ok, sent, error? }. */
export async function sendOrderEmail(order) {
  if (!emailReady()) return { ok: false, skipped: 'Email not set up' };
  const from = (env('ORDER_EMAIL_FROM') || 'orders@buddy4plant.in').toLowerCase();
  const msg = buildOrderEmail(order);
  let sent = 0;
  const errors = [];
  for (const to of recipients()) {
    try {
      const m = new globalThis.B4P_EmailMessage(from, to, mime(from, to, msg));
      await globalThis.B4P_ORDER_EMAIL.send(m);
      sent++;
    } catch (e) {
      errors.push(`${to}: ${String(e && e.message || e).slice(0, 120)}`);
    }
  }
  if (errors.length) console.error('order email', errors.join('; '));
  return { ok: sent > 0, sent, ...(errors.length ? { error: errors.join('; ') } : {}) };
}
