// Invoice numbers: B4P/26-27/0001, B4P/26-27/0002 ... one series per Indian financial year (April-March),
// with no gaps and no repeats. The number is given by the server when the order is processed, and saved on
// the order (invoiceNumber, invoiceDate) so it never changes. The counter lives at counters/invoice-<YY-YY>.
// Both writes happen in one atomic database commit, so two orders at the same moment never share a number.

import { readDoc, fsFetch, toFs, FIREBASE_PROJECT } from './firebaseServer.mjs';

const DOC_ROOT = `projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

export function financialYear(ms) {
  const d = new Date((Number(ms) || Date.now()) + 5.5 * 3600000); // India time
  const y = d.getUTCFullYear();
  const start = d.getUTCMonth() >= 3 ? y : y - 1;
  return `${String(start).slice(-2)}-${String(start + 1).slice(-2)}`;
}

export const formatInvoiceNumber = (prefix, fy, n) =>
  `${String(prefix || 'B4P').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'B4P'}/${fy}/${String(n).padStart(4, '0')}`;

/** Orders that get an invoice: Cash on Delivery, or paid online; not cancelled. */
export const needsInvoice = (o) =>
  !!o && !o.invoiceNumber && !['Cancelled', 'Refunded'].includes(o.orderStatus) &&
  (o.paymentMethod === 'cod' || o.paymentStatus === 'paid');

/** Gives the order its invoice number (if it doesn't have one yet). Returns the number, or '' when not needed. */
export async function assignInvoiceNumber(orderId) {
  if (!/^[\w-]{3,80}$/.test(String(orderId || ''))) return '';
  for (let attempt = 0; attempt < 5; attempt++) {
    const od = await readDoc(`orders/${encodeURIComponent(orderId)}`);
    if (!od) return '';
    const o = od.data;
    if (o.invoiceNumber) return o.invoiceNumber;
    if (!needsInvoice(o)) return '';

    const fy = financialYear(o.createdAt);
    const settings = (await readDoc('settings/invoice'))?.data || {};
    const counterPath = `counters/invoice-${fy}`;
    const c = await readDoc(counterPath);
    const n = c ? Number(c.data.next) || 1 : Math.max(1, Math.floor(Number(settings.startNumber) || 1));
    const number = formatInvoiceNumber(settings.prefix, fy, n);
    const now = Date.now();

    const r = await fsFetch(':commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        writes: [
          {
            update: { name: `${DOC_ROOT}/${counterPath}`, fields: { next: toFs(n + 1), fy: toFs(fy), updatedAt: toFs(now) } },
            currentDocument: c ? { updateTime: c.updateTime } : { exists: false },
          },
          {
            update: { name: `${DOC_ROOT}/orders/${orderId}`, fields: { invoiceNumber: toFs(number), invoiceDate: toFs(Number(o.createdAt) || now) } },
            updateMask: { fieldPaths: ['invoiceNumber', 'invoiceDate'] },
            currentDocument: { updateTime: od.updateTime },
          },
        ],
      }),
    });
    if (r.ok) return number;
    // someone else changed the counter or the order at the same moment - read again and retry
    const txt = await r.text();
    if (!/FAILED_PRECONDITION|ABORTED|ALREADY_EXISTS|NOT_FOUND/i.test(txt)) {
      console.error('invoice number failed', r.status, txt.slice(0, 200));
      return '';
    }
    await new Promise((res) => setTimeout(res, 150 + Math.random() * 300));
  }
  return '';
}
