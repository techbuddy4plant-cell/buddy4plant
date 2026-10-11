// Customer messages on WhatsApp (Meta WhatsApp Cloud API) and SMS (Fast2SMS, DLT route).
//
//  1. Order placed  -> the customer gets the order details; the store number gets a "new order" alert.
//     The website calls POST /api/notify/order {id} right after an order is saved; the 30-minute cron
//     sends any that were missed. The order is always read from the database (never trusted from the browser)
//     and each order is messaged only once.
//  2. Reminder      -> a signed-in customer who added something to the cart (or looked at products) and did
//     not order gets ONE reminder a few hours later (only 9am-9pm IST, at most one every 3 days).
//
// Environment variables (Cloudflare > Workers > buddy4plant > Settings > Variables and secrets):
//   WHATSAPP_TOKEN            - permanent access token of a Meta "system user" (secret)
//   WHATSAPP_PHONE_NUMBER_ID  - "Phone number ID" from Meta > WhatsApp > API Setup
//   WHATSAPP_LANG             - template language code (default en)
//   WA_TEMPLATE_ORDER         - default order_confirmation   (Utility, 6 body variables, see NOTIFICATIONS-SETUP.md)
//   WA_TEMPLATE_ADMIN         - default new_order_alert      (Utility, 6 body variables)
//   WA_TEMPLATE_REMINDER      - default cart_reminder        (Marketing, 3 body variables)
//   FAST2SMS_API_KEY          - Fast2SMS > Dev API (secret)
//   FAST2SMS_SENDER_ID        - DLT-approved 6-letter sender ID
//   FAST2SMS_ORDER_MSG_ID     - Fast2SMS message ID of the approved order template   (3 variables)
//   FAST2SMS_ADMIN_MSG_ID     - optional, new-order alert template                  (4 variables)
//   FAST2SMS_REMINDER_MSG_ID  - optional, reminder template                         (2 variables)
//   ORDER_ALERT_PHONE         - store mobile number for new-order alerts (10 digits)
//   REMINDER_AFTER_HOURS      - default 3
// Anything not set is simply skipped, so WhatsApp can go live before SMS (or the other way round).

const SITE = 'https://buddy4plant.in';
const FIREBASE_PROJECT = 'buddy4plant-24f6f';
const FS_DOCS = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;
const GRAPH = 'https://graph.facebook.com/v21.0';

const env = (name) => {
  let v = '';
  try { v = (globalThis.Netlify && globalThis.Netlify.env.get(name)) || ''; } catch { v = ''; }
  if (!v) v = process.env[name] || '';
  return String(v).trim().replace(/^['"]+|['"]+$/g, '').trim();
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const _fetch = globalThis.fetch;
const fetch = (url, init = {}) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 12000);
  return _fetch(url, { ...init, signal: c.signal }).finally(() => clearTimeout(t));
};

const waReady = () => Boolean(env('WHATSAPP_TOKEN') && env('WHATSAPP_PHONE_NUMBER_ID'));
const smsReady = () => Boolean(env('FAST2SMS_API_KEY') && env('FAST2SMS_SENDER_ID'));

// ---------- helpers ----------
const mobile10 = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  const m = d.length > 10 ? d.slice(-10) : d;
  return /^[6-9]\d{9}$/.test(m) ? m : '';
};
// WhatsApp variables may not contain new lines, tabs or 4+ spaces; SMS variables may not contain "|"
const v = (x, max = 120) => String(x == null ? '' : x).replace(/[\r\n\t|]+/g, ' ').replace(/ {2,}/g, ' ').trim().slice(0, max) || '-';
const rupees = (n) => 'Rs ' + Math.round(Number(n) || 0).toLocaleString('en-IN');
const firstName = (n) => v(String(n || 'there').split(' ')[0], 30);
const istHour = () => new Date(Date.now() + 5.5 * 3600000).getUTCHours();

const fsValue = (x) => {
  if (!x || typeof x !== 'object') return undefined;
  if ('stringValue' in x) return x.stringValue;
  if ('integerValue' in x) return Number(x.integerValue);
  if ('doubleValue' in x) return Number(x.doubleValue);
  if ('booleanValue' in x) return x.booleanValue;
  if ('nullValue' in x) return null;
  if ('timestampValue' in x) return Date.parse(x.timestampValue);
  if ('mapValue' in x) return fsObject(x.mapValue.fields || {});
  if ('arrayValue' in x) return (x.arrayValue.values || []).map(fsValue);
  return undefined;
};
const fsObject = (fields) => Object.fromEntries(Object.entries(fields).map(([k, x]) => [k, fsValue(x)]));
const toFs = (x) => {
  if (x === null || x === undefined) return { nullValue: null };
  if (typeof x === 'boolean') return { booleanValue: x };
  if (typeof x === 'number') return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(toFs) } };
  if (typeof x === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, y]) => [k, toFs(y)])) } };
  return { stringValue: String(x) };
};

async function readDoc(path) {
  const r = await fetch(`${FS_DOCS}/${path}`);
  if (!r.ok) return null;
  const d = await r.json();
  return { data: fsObject(d.fields || {}), updateTime: d.updateTime };
}
/** Writes fields; with updateTime it only succeeds if nobody changed the document meanwhile (so a message is never sent twice). */
async function patchDoc(path, fields, updateTime) {
  const keys = Object.keys(fields);
  const q = keys.map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`);
  if (updateTime) q.push(`currentDocument.updateTime=${encodeURIComponent(updateTime)}`);
  const r = await fetch(`${FS_DOCS}/${path}?${q.join('&')}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(keys.map((k) => [k, toFs(fields[k])])) }),
  });
  return r.ok;
}
/** Documents whose numeric `field` is between min and max (inclusive). */
async function query(collectionId, field, min, max, limit = 300) {
  const f = (op, n) => ({ fieldFilter: { field: { fieldPath: field }, op, value: { integerValue: String(Math.round(n)) } } });
  const r = await fetch(`${FS_DOCS}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: { compositeFilter: { op: 'AND', filters: [f('GREATER_THAN_OR_EQUAL', min), f('LESS_THAN_OR_EQUAL', max)] } },
        orderBy: [{ field: { fieldPath: field }, direction: 'DESCENDING' }],
        limit,
      },
    }),
  });
  if (!r.ok) throw new Error(`Could not read ${collectionId} (${r.status})`);
  const rows = await r.json();
  return rows.filter((x) => x.document).map((x) => ({
    ...fsObject(x.document.fields || {}),
    _id: x.document.name.split('/').pop(),
    _updateTime: x.document.updateTime,
  }));
}

// ---------- senders ----------
async function sendWhatsApp(phone10, template, params) {
  if (!waReady()) return { ok: false, skipped: 'WhatsApp not set up' };
  const r = await fetch(`${GRAPH}/${env('WHATSAPP_PHONE_NUMBER_ID')}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('WHATSAPP_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: '91' + phone10,
      type: 'template',
      template: {
        name: template,
        language: { code: env('WHATSAPP_LANG') || 'en' },
        components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text: v(text, 400) })) }],
      },
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = (d.error && (d.error.error_data?.details || d.error.message)) || `HTTP ${r.status}`;
    console.error('WhatsApp send failed', template, err);
    return { ok: false, error: String(err).slice(0, 200) };
  }
  return { ok: true, id: d.messages && d.messages[0] && d.messages[0].id };
}

async function sendSms(phone10, messageId, vars) {
  if (!smsReady() || !messageId) return { ok: false, skipped: 'SMS not set up' };
  const r = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: { authorization: env('FAST2SMS_API_KEY'), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      route: 'dlt',
      sender_id: env('FAST2SMS_SENDER_ID'),
      message: messageId,
      variables_values: vars.map((x) => v(x, 30)).join('|'),
      flash: 0,
      numbers: phone10,
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.return === false) {
    const err = (Array.isArray(d.message) ? d.message.join(' ') : d.message) || `HTTP ${r.status}`;
    console.error('SMS send failed', err);
    return { ok: false, error: String(err).slice(0, 200) };
  }
  return { ok: true, id: d.request_id };
}

// ---------- 1. order messages ----------
const itemsText = (items) => {
  const list = (items || []).map((it) => `${it.name} x${Math.max(1, Number(it.quantity) || 1)}`);
  const s = list.slice(0, 6).join(', ') + (list.length > 6 ? ` +${list.length - 6} more` : '');
  return v(s, 600);
};

function orderEligible(o) {
  if (!o || !o.orderNumber) return 'not found';
  if (o.notifiedAt) return 'already sent';
  if (o.orderStatus === 'Cancelled' || o.orderStatus === 'Refunded') return 'cancelled';
  if (o.paymentMethod !== 'cod' && o.paymentStatus !== 'paid') return 'not paid yet';
  if (!o.createdAt || Date.now() - Number(o.createdAt) > 6 * 3600000) return 'too old';
  return '';
}

export async function notifyOrder(id) {
  if (!/^[\w-]{3,80}$/.test(String(id || ''))) return { ok: false, error: 'Invalid order' };
  if (!waReady() && !smsReady()) return { ok: false, error: 'Messaging is not set up' };
  const doc = await readDoc(`orders/${encodeURIComponent(id)}`);
  const o = doc && doc.data;
  const why = orderEligible(o);
  if (why) return { ok: why === 'already sent', skipped: why };
  // claim the order first, so two calls at the same moment can't both send
  if (!(await patchDoc(`orders/${encodeURIComponent(id)}`, { notifiedAt: Date.now() }, doc.updateTime))) {
    return { ok: true, skipped: 'already being sent' };
  }

  const a = o.shippingAddress || {};
  const phone = mobile10(a.phone || o.customerPhone);
  const name = firstName(a.fullName || o.customerName);
  const payment = o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid online';
  const address = v([a.street, a.city, a.pincode].filter(Boolean).join(', '), 200);
  const track = `${SITE}/track-order?id=${encodeURIComponent(o.orderNumber)}`;
  const result = { orderNumber: o.orderNumber };

  if (phone) {
    // {{1}} name {{2}} order no {{3}} items {{4}} total {{5}} payment {{6}} address + tracking link
    result.customerWhatsApp = await sendWhatsApp(phone, env('WA_TEMPLATE_ORDER') || 'order_confirmation', [
      name, o.orderNumber, itemsText(o.items), rupees(o.total), payment, `${address}. Track: ${track}`,
    ]);
    // DLT (3 variables; the tracking link is written in the approved template itself): name | order no | amount
    result.customerSms = await sendSms(phone, env('FAST2SMS_ORDER_MSG_ID'), [name, o.orderNumber, rupees(o.total)]);
  } else {
    result.customer = 'no valid mobile number';
  }

  const shop = mobile10(env('ORDER_ALERT_PHONE'));
  if (shop) {
    // {{1}} order no {{2}} customer + phone {{3}} items {{4}} total {{5}} payment {{6}} city
    result.storeWhatsApp = await sendWhatsApp(shop, env('WA_TEMPLATE_ADMIN') || 'new_order_alert', [
      o.orderNumber, `${v(a.fullName || o.customerName, 60)} (${phone || 'no phone'})`, itemsText(o.items), rupees(o.total), payment, v(`${a.city || ''} ${a.pincode || ''}`, 60),
    ]);
    if (env('FAST2SMS_ADMIN_MSG_ID')) {
      result.storeSms = await sendSms(shop, env('FAST2SMS_ADMIN_MSG_ID'), [o.orderNumber, rupees(o.total), payment, phone || '-']);
    }
  }
  await patchDoc(`orders/${encodeURIComponent(id)}`, { notifyResult: JSON.stringify(result).slice(0, 1500) });
  return { ok: true, result };
}

// ---------- 2. reminders ----------
async function remindOne(row) {
  const now = Date.now();
  const updatedAt = Number(row.updatedAt) || 0;
  const cart = Array.isArray(row.cart) ? row.cart : [];
  const viewed = Array.isArray(row.viewed) ? row.viewed : [];
  if (!cart.length && !viewed.length) return null;
  if (row.optOut) return null;
  if (now - updatedAt > 48 * 3600000) return null; // too long ago
  if (Number(row.remindedAt) >= updatedAt) return null; // already reminded about this
  if (Number(row.remindedAt) > now - 3 * 86400000) return null; // max one every 3 days
  if (Number(row.orderedAt) >= updatedAt) return null; // ordered since
  const phone = mobile10(row.phone);
  if (!phone) return null;

  if (!(await patchDoc(`cartActivity/${encodeURIComponent(row._id)}`, { remindedAt: now }, row._updateTime))) return null;

  const fromCart = cart.length > 0;
  const names = (fromCart ? cart : viewed).map((x) => x.name).filter(Boolean);
  const what = names.length > 2 ? `${names.slice(0, 2).join(', ')} and ${names.length - 2} more` : names.join(' and ');
  const link = fromCart ? `${SITE}/checkout` : `${SITE}/product/${encodeURIComponent(viewed[0].slug || '')}`;
  const name = firstName(row.name);
  // {{1}} name {{2}} products {{3}} link
  const wa = await sendWhatsApp(phone, env('WA_TEMPLATE_REMINDER') || 'cart_reminder', [name, v(what, 200), link]);
  // DLT (2 variables; the website link is written in the approved template itself): name | products
  const sms = await sendSms(phone, env('FAST2SMS_REMINDER_MSG_ID'), [name, v(names[0] + (names.length > 1 ? ' & more' : ''), 30)]);
  return { uid: row._id, wa: wa.ok, sms: sms.ok };
}

/** Run from the cron: missed order messages + due reminders. */
export async function notifyAll() {
  const report = { orders: [], reminders: [], errors: [] };
  if (!waReady() && !smsReady()) return { ...report, errors: ['Messaging is not set up'] };
  try {
    const orders = await query('orders', 'createdAt', Date.now() - 6 * 3600000, Date.now());
    for (const o of orders) {
      if (orderEligible(o)) continue;
      // give the website's own call a couple of minutes first
      if (Date.now() - Number(o.createdAt) < 3 * 60000) continue;
      const r = await notifyOrder(o._id);
      report.orders.push({ id: o._id, ok: r.ok });
    }
  } catch (e) { report.errors.push(String(e.message || e)); }

  const h = istHour();
  if (h >= 9 && h < 21) {
    try {
      const after = (Number(env('REMINDER_AFTER_HOURS')) || 3) * 3600000;
      const rows = await query('cartActivity', 'updatedAt', Date.now() - 48 * 3600000, Date.now() - after);
      let sent = 0;
      for (const row of rows) {
        if (sent >= 40) break;
        const r = await remindOne(row);
        if (r) { report.reminders.push(r); sent++; }
      }
    } catch (e) { report.errors.push(String(e.message || e)); }
  }
  return report;
}

// at most one test message every 10 minutes (shared Cloudflare cache)
async function testAllowed() {
  const c = globalThis.caches && globalThis.caches.default;
  if (!c) return true;
  const key = new Request('https://b4p-cache.internal/notify-test');
  if (await c.match(key)) return false;
  await c.put(key, new Response('1', { headers: { 'Cache-Control': 'max-age=600' } }));
  return true;
}

// ---------- HTTP ----------
export default async (req) => {
  const { pathname, searchParams } = new URL(req.url);
  const action = pathname.split('/').filter(Boolean).pop();
  try {
    if (action === 'config') {
      const r = { whatsapp: waReady(), sms: smsReady(), orderSms: Boolean(env('FAST2SMS_ORDER_MSG_ID')), reminderSms: Boolean(env('FAST2SMS_REMINDER_MSG_ID')), storeAlerts: Boolean(mobile10(env('ORDER_ALERT_PHONE'))) };
      // ?test=1 sends one "new order" style test to the store number, so the setup can be checked
      if (searchParams.get('test') === '1' && mobile10(env('ORDER_ALERT_PHONE')) && (await testAllowed())) {
        const shop = mobile10(env('ORDER_ALERT_PHONE'));
        r.testWhatsApp = await sendWhatsApp(shop, env('WA_TEMPLATE_ADMIN') || 'new_order_alert', ['TEST-000', 'Test customer', 'Test plant x1', 'Rs 1', 'Test', 'Lucknow']);
      }
      return json(r);
    }
    if (action === 'order' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      return json(await notifyOrder(body.id));
    }
    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error('notify error', e);
    return json({ ok: false, error: 'Could not send the message' }, 500);
  }
};

export const config = { path: '/api/notify/*' };
