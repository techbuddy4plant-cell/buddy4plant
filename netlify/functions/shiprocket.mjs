// Shiprocket endpoints (used by the Netlify site, and by server.ts on a local computer).
// Environment variables:
//   SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD  - the API user from Shiprocket > Settings > API > Add New API User
//   SHIPROCKET_PICKUP_LOCATION              - pickup location nickname exactly as in Shiprocket (default "Primary")
//   SHIPROCKET_BOX_CM                       - optional default box "length,breadth,height" (default 25,25,35)
//   SHIPROCKET_WEIGHT_PER_ITEM_KG           - optional (default 0.5)
// Online orders need a confirmed Razorpay payment; COD orders are checked against the saved order,
// so nobody can create fake shipments. syncAll() keeps the website and Shiprocket in step.

const API = 'https://apiv2.shiprocket.in/v1/external';

const env = (name) => {
  let v = '';
  try { v = (globalThis.Netlify && globalThis.Netlify.env.get(name)) || ''; } catch { v = ''; }
  if (!v) v = process.env[name] || '';
  return String(v).trim().replace(/^['"]+|['"]+$/g, '').trim();
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Never let a slow Shiprocket response hang the website: give up after 12 seconds
const _fetch = globalThis.fetch;
const fetch = (url, init = {}) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 12000);
  return _fetch(url, { ...init, signal: c.signal }).finally(() => clearTimeout(t));
};

const configured = () => Boolean(env('SHIPROCKET_EMAIL') && env('SHIPROCKET_PASSWORD'));

// ---- Login handling ----
// Shiprocket blocks an API user after a few failed logins, so:
//  1. one token is shared by every server instance (Cloudflare cache) and reused for 8 days
//  2. after a failed login, no new login is tried for 30 minutes with the same email+password
//     (changing the password in the dashboard lifts the pause straight away)
const TOKEN_DAYS = 8;
const FAIL_PAUSE_MIN = 30;
let cached = { token: '', at: 0, key: '' };
const memFail = new Map(); // backup for the failed-login pause when the shared cache is not available
const sha = async (text) => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(b)].slice(0, 12).map((x) => x.toString(16).padStart(2, '0')).join('');
};
const edgeCache = () => (globalThis.caches && globalThis.caches.default) || null;
const cacheGet = async (key) => {
  try {
    const c = edgeCache();
    const r = c && (await c.match(`https://b4p-internal.cache/${key}`));
    return r ? await r.json() : null;
  } catch { return null; }
};
const cachePut = async (key, value, seconds) => {
  try {
    const c = edgeCache();
    if (c) await c.put(`https://b4p-internal.cache/${key}`, new Response(JSON.stringify(value), { headers: { 'Cache-Control': `max-age=${seconds}` } }));
  } catch { /* ignore */ }
};
const cacheDelete = async (key) => {
  try { const c = edgeCache(); if (c) await c.delete(`https://b4p-internal.cache/${key}`); } catch { /* ignore */ }
};

async function token(force = false) {
  const userKey = await sha('u:' + env('SHIPROCKET_EMAIL'));
  const credKey = await sha('c:' + env('SHIPROCKET_EMAIL') + ':' + env('SHIPROCKET_PASSWORD'));
  const fresh = (t) => t && t.token && Date.now() - t.at < TOKEN_DAYS * 86400000;
  if (!force) {
    if (cached.key === userKey && fresh(cached)) return cached.token;
    const shared = await cacheGet(`sr-token-${userKey}`);
    if (fresh(shared)) { cached = { ...shared, key: userKey }; return shared.token; }
  }
  const failed = (await cacheGet(`sr-fail-${credKey}`)) || memFail.get(credKey);
  if (failed && Date.now() - failed.at < FAIL_PAUSE_MIN * 60000) {
    throw new Error(`Shiprocket login paused after a failed attempt (${failed.message}). It is tried again ${Math.ceil((FAIL_PAUSE_MIN * 60000 - (Date.now() - failed.at)) / 60000)} min from now, or straight away once the password is changed.`);
  }
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env('SHIPROCKET_EMAIL'), password: env('SHIPROCKET_PASSWORD') }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.token) {
    const message = String(d.message || `login failed (${r.status})`).slice(0, 160);
    // wrong password / blocked user: pause; Shiprocket being down (5xx): don't
    if (r.status < 500) {
      memFail.set(credKey, { at: Date.now(), message });
      await cachePut(`sr-fail-${credKey}`, { at: Date.now(), message }, FAIL_PAUSE_MIN * 60);
    }
    throw new Error(`Shiprocket login failed: ${message}`);
  }
  cached = { token: d.token, at: Date.now(), key: userKey };
  memFail.delete(credKey);
  await cacheDelete(`sr-fail-${credKey}`);
  await cachePut(`sr-token-${userKey}`, { token: d.token, at: cached.at }, TOKEN_DAYS * 86400);
  return d.token;
}
async function sr(path, init = {}, retry = true) {
  const t = await token();
  const r = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}`, ...(init.headers || {}) } });
  if (r.status === 401 && retry) {
    await token(true);
    return sr(path, init, false);
  }
  const d = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data: d };
}

const rzpAuth = () => 'Basic ' + Buffer.from(`${env('RAZORPAY_KEY_ID')}:${env('RAZORPAY_KEY_SECRET')}`).toString('base64');

/** Confirms with Razorpay that this order number was really paid, for this amount. */
async function paidOnRazorpay(order) {
  const pid = String(order.razorpayPaymentId || '');
  const oid = String(order.razorpayOrderId || '');
  if (!/^pay_\w+$/.test(pid) || !/^order_\w+$/.test(oid)) return 'Missing payment details';
  const again = async (u) => {
    let r;
    for (let i = 0; i < 4; i++) {
      r = await fetch(u, { headers: { Authorization: rzpAuth() } });
      if (r.status !== 429 && r.status < 500) return r;
      if (i < 3) await new Promise((res) => setTimeout(res, 500 * (i + 1)));
    }
    return r;
  };
  const [pr, or] = await Promise.all([
    again(`https://api.razorpay.com/v1/payments/${pid}`),
    again(`https://api.razorpay.com/v1/orders/${oid}`),
  ]);
  if (!pr.ok || !or.ok) return 'Could not confirm the payment with Razorpay';
  const p = await pr.json();
  const o = await or.json();
  if (p.order_id !== oid) return 'Payment does not belong to this order';
  if (p.status !== 'captured' && p.status !== 'authorized') return 'Payment is not completed';
  if (o.receipt !== order.orderNumber) return 'Payment is for a different order number';
  if (p.amount !== Math.round(Number(order.total) * 100)) return 'Paid amount does not match the order total';
  return '';
}

// ---- Cash on Delivery: read the order straight from the store database (never trust the browser's copy) ----
const FIREBASE_PROJECT = 'buddy4plant-24f6f';
const fsValue = (v) => {
  if (!v || typeof v !== 'object') return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return Date.parse(v.timestampValue);
  if ('mapValue' in v) return fsObject(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fsValue);
  return undefined;
};
const fsObject = (fields) => Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fsValue(v)]));

async function codOrderFromDatabase(id) {
  if (!/^[\w-]{3,80}$/.test(String(id || ''))) return { error: 'Invalid order' };
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/orders/${encodeURIComponent(id)}`);
  if (!r.ok) return { error: 'Order not found' };
  const doc = await r.json();
  const order = fsObject(doc.fields || {});
  if (order.paymentMethod !== 'cod') return { error: 'Not a Cash on Delivery order' };
  if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Refunded') return { error: 'Order is cancelled' };
  if (!order.createdAt || Date.now() - Number(order.createdAt) > 7 * 86400000) return { error: 'Order is too old to send automatically' };
  order.id = id;
  return { order };
}

function codSanity(o) {
  const a = o.shippingAddress || {};
  if (!/^[A-Za-z0-9]+-\d{4,10}$/.test(String(o.orderNumber || ''))) return 'Invalid order number';
  if (!o.createdAt || Math.abs(Date.now() - Number(o.createdAt)) > 6 * 3600000) return 'Order is too old to send automatically';
  if (o.orderStatus === 'Cancelled' || o.orderStatus === 'Refunded') return 'Order is cancelled';
  if (String(a.phone || o.customerPhone || '').replace(/\D/g, '').slice(-10).length !== 10) return 'Invalid phone number';
  if (!/^[1-9]\d{5}$/.test(String(a.pincode || ''))) return 'Invalid pincode';
  if (!Array.isArray(o.items) || o.items.length < 1 || o.items.length > 30) return 'Invalid items';
  const total = Number(o.total);
  if (!Number.isFinite(total) || total < 1 || total > 50000) return 'Order amount not allowed for Cash on Delivery';
  return '';
}

const pad = (n) => String(n).padStart(2, '0');
const istDate = (ms) => {
  const d = new Date((Number(ms) || Date.now()) + 5.5 * 3600000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
const clean = (v, max = 190) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);

function buildShiprocketOrder(order) {
  const a = order.shippingAddress || {};
  const name = clean(a.fullName || order.customerName, 80);
  const [first, ...rest] = name.split(' ');
  const items = (order.items || []).map((it, i) => {
    const variant = [it.selectedSize, it.selectedWeight, it.selectedPotColor].filter(Boolean).join(' / ');
    return {
      name: clean(variant ? `${it.name} (${variant})` : it.name, 150),
      sku: clean(`${it.sku || it.productId || 'ITEM'}${variant ? '-' + variant.replace(/[^A-Za-z0-9]+/g, '') : ''}`, 45) || `ITEM-${i + 1}`,
      units: Math.max(1, Math.round(Number(it.quantity) || 1)),
      selling_price: Number(it.price) || 0,
    };
  });
  const units = items.reduce((s, it) => s + it.units, 0);
  const [L, B, H] = (env('SHIPROCKET_BOX_CM') || '25,25,35').split(',').map((n) => Number(n) || 25);
  const perItem = Number(env('SHIPROCKET_WEIGHT_PER_ITEM_KG')) || 0.5;
  return {
    order_id: clean(order.orderNumber, 45),
    order_date: istDate(order.createdAt),
    pickup_location: env('SHIPROCKET_PICKUP_LOCATION') || 'Primary',
    comment: clean(order.notes, 180),
    billing_customer_name: first || 'Customer',
    billing_last_name: rest.join(' '),
    billing_address: clean(a.street, 180),
    billing_address_2: clean(a.landmark, 180),
    billing_city: clean(a.city, 60),
    billing_pincode: clean(a.pincode, 6),
    billing_state: clean(a.state, 60),
    billing_country: 'India',
    billing_email: clean(a.email || order.customerEmail, 100),
    billing_phone: String(a.phone || order.customerPhone || '').replace(/\D/g, '').slice(-10),
    shipping_is_billing: true,
    order_items: items,
    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    shipping_charges: Number(order.shippingCharge) || 0,
    total_discount: Number(order.discount) || 0,
    sub_total: Number(order.subtotal) || items.reduce((s, it) => s + it.selling_price * it.units, 0),
    length: L,
    breadth: B,
    height: H,
    weight: Math.max(0.5, Math.round(units * perItem * 100) / 100),
  };
}


/** Creates the order on Shiprocket. Returns { success, shiprocketOrderId, shipmentId, status } or { success:false, error }. */
async function createInShiprocket(order) {
  const r = await sr('/orders/create/adhoc', { method: 'POST', body: JSON.stringify(buildShiprocketOrder(order)) });
  const d = r.data || {};
  if (!r.ok || !d.order_id) {
    console.error('Shiprocket create failed', r.status, JSON.stringify(d).slice(0, 800));
    const msg = d.message || (d.errors && Object.values(d.errors).flat().join(' ')) || 'Shiprocket did not accept the order';
    return { success: false, error: String(msg).slice(0, 300) };
  }
  return { success: true, shiprocketOrderId: String(d.order_id), shipmentId: String(d.shipment_id || ''), status: d.status || 'NEW' };
}

/** Live shipping details: status, AWB, courier, expected delivery, tracking link and courier scans. */
async function trackShiprocket(orderId, shipmentId) {
  const out = { success: true, status: '', awb: '', courier: '', etd: '', location: '', trackUrl: '', activities: [] };

  if (orderId) {
    const o = await sr(`/orders/show/${orderId}`);
    const d = o.data?.data || {};
    const sh = Array.isArray(d.shipments) ? d.shipments[0] || {} : d.shipments || {};
    out.status = clean(d.status, 60);
    out.awb = clean(sh.awb || d.awb_data?.awb, 40);
    out.courier = clean(sh.courier || sh.sr_courier_name, 80);
    out.etd = clean(sh.etd || d.etd_date || '', 40);
  }
  if (shipmentId && (out.awb || !orderId)) {
    const t = await sr(`/courier/track/shipment/${shipmentId}`);
    const td = t.data?.tracking_data || {};
    const tr = (td.shipment_track || [])[0] || {};
    out.awb = out.awb || clean(tr.awb_code, 40);
    out.courier = out.courier || clean(tr.courier_name, 80);
    out.status = clean(tr.current_status, 60) || out.status;
    out.etd = clean(td.etd || tr.edd || out.etd, 40);
    out.trackUrl = clean(td.track_url, 200);
    out.activities = (td.shipment_track_activities || []).slice(0, 25).map((x) => ({
      date: clean(x.date, 30),
      activity: clean(x.activity || x['sr-status-label'], 160),
      location: clean(x.location, 80),
    }));
    out.location = out.activities[0]?.location || '';
  }
  return out;
}

// ---- Background sync (runs every 30 minutes from the Cloudflare cron, see wrangler.jsonc) ----
// Sends waiting orders to Shiprocket and copies status / AWB / courier / delivery date back to the website.
const FS_DOCS = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;
const toFs = (v) => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFs) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toFs(x)])) } };
  return { stringValue: String(v) };
};
async function patchOrderDoc(id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  const mask = keys.map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const r = await fetch(`${FS_DOCS}/orders/${encodeURIComponent(id)}?${mask}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(keys.map((k) => [k, toFs(fields[k])])) }),
  });
  if (!r.ok) console.error('order update failed', id, r.status, (await r.text()).slice(0, 200));
}
async function recentOrders(days = 30) {
  const r = await fetch(`${FS_DOCS}:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'orders' }],
        where: { fieldFilter: { field: { fieldPath: 'createdAt' }, op: 'GREATER_THAN_OR_EQUAL', value: { integerValue: String(Date.now() - days * 86400000) } } },
        limit: 300,
      },
    }),
  });
  if (!r.ok) throw new Error(`Could not read orders (${r.status})`);
  const rows = await r.json();
  return rows.filter((x) => x.document).map((x) => ({ ...fsObject(x.document.fields || {}), id: x.document.name.split('/').pop() }));
}
const RANK = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
function mapStatus(s) {
  const t = String(s || '').toUpperCase();
  if (/RTO|CANCEL|LOST|DAMAGED|UNDELIVERED/.test(t)) return null;
  if (/^DELIVERED/.test(t)) return 'Delivered';
  if (/OUT FOR DELIVERY/.test(t)) return 'Out for Delivery';
  if (/IN TRANSIT|SHIPPED|PICKED UP|REACHED|DESTINATION HUB/.test(t)) return 'Shipped';
  if (/PICKUP|READY TO SHIP|AWB|MANIFEST|PACKED|INVOICED/.test(t)) return 'Packed';
  return null;
}

export async function syncAll() {
  const report = { sent: [], updated: [], errors: [] };
  if (!configured()) return { ...report, errors: ['Shiprocket is not set up'] };
  await token(); // stop early (without touching orders) if the login is not working
  const orders = await recentOrders();
  const open = orders.filter((o) => !['Cancelled', 'Refunded', 'Delivered'].includes(o.orderStatus));
  let budget = 8; // keep within Cloudflare's per-run request limit

  // 1. orders that never reached Shiprocket (older than 10 min, so the checkout page has had its turn)
  const waiting = open.filter((o) =>
    !o.shiprocketOrderId &&
    Number(o.shiprocketTries || 0) < 5 &&
    Date.now() - Number(o.createdAt || 0) > 10 * 60000 &&
    (o.paymentMethod === 'cod' ? Date.now() - Number(o.createdAt) < 7 * 86400000 : o.paymentMethod === 'razorpay' && o.paymentStatus === 'paid'));
  for (const o of waiting) {
    if (budget-- <= 0) break;
    try {
      const problem = o.paymentMethod === 'cod' ? '' : await paidOnRazorpay(o);
      const made = problem ? { success: false, error: problem } : await createInShiprocket(o);
      if (made.success) {
        await patchOrderDoc(o.id, { shiprocketOrderId: made.shiprocketOrderId, shiprocketShipmentId: made.shipmentId, shiprocketStatus: made.status, shiprocketError: '', updatedAt: Date.now() });
        report.sent.push(o.orderNumber);
      } else {
        await patchOrderDoc(o.id, { shiprocketError: made.error, shiprocketTries: Number(o.shiprocketTries || 0) + 1, updatedAt: Date.now() });
        report.errors.push(`${o.orderNumber}: ${made.error}`);
      }
    } catch (e) {
      report.errors.push(`${o.orderNumber}: ${e.message || e}`);
      if (/login/i.test(String(e.message))) break;
    }
  }

  // 2. orders already on Shiprocket: copy the latest shipping details back
  const shipped = open
    .filter((o) => o.shiprocketOrderId || o.shiprocketShipmentId)
    .sort((a, b) => Number(a.shiprocketSyncedAt || 0) - Number(b.shiprocketSyncedAt || 0));
  for (const o of shipped) {
    if (budget-- <= 0) break;
    try {
      const t = await trackShiprocket(String(o.shiprocketOrderId || '').replace(/\D/g, ''), String(o.shiprocketShipmentId || '').replace(/\D/g, ''));
      const f = { shiprocketSyncedAt: Date.now() };
      if (t.status && t.status !== o.shiprocketStatus) f.shiprocketStatus = t.status;
      if (t.awb && t.awb !== o.trackingNumber) f.trackingNumber = t.awb;
      if (t.courier && t.courier !== o.deliveryCourier) f.deliveryCourier = t.courier;
      if (t.location && t.location !== o.currentLocation) f.currentLocation = t.location;
      if (t.etd && t.etd !== o.estimatedDeliveryDate) f.estimatedDeliveryDate = t.etd;
      if (t.trackUrl && t.trackUrl !== o.shiprocketTrackUrl) f.shiprocketTrackUrl = t.trackUrl;
      const next = mapStatus(t.status);
      if (next && RANK.indexOf(next) > RANK.indexOf(o.orderStatus)) {
        f.orderStatus = next;
        f.statusHistory = [...(Array.isArray(o.statusHistory) ? o.statusHistory : []), {
          status: next,
          timestamp: Date.now(),
          location: t.location || o.currentLocation || 'In transit',
          note: `${t.status}${t.courier ? ` - ${t.courier}` : ''}${t.awb ? ` (AWB ${t.awb})` : ''}`,
        }];
        if (next === 'Delivered' && o.paymentMethod === 'cod') f.paymentStatus = 'paid';
      }
      const changed = Object.keys(f).length > 1;
      if (changed) f.updatedAt = Date.now();
      await patchOrderDoc(o.id, f);
      if (changed) report.updated.push(`${o.orderNumber}: ${t.status || ''}${t.awb ? ' AWB ' + t.awb : ''}`);
    } catch (e) {
      report.errors.push(`${o.orderNumber}: ${e.message || e}`);
    }
  }
  return report;
}

export default async (req) => {
  const url = new URL(req.url);
  const action = url.pathname.replace(/\/+$/, '').split('/').pop();

  if (action === 'config' && req.method === 'GET') {
    // which API user is configured (partly hidden), to spot an old value still in use
    const em = env('SHIPROCKET_EMAIL');
    const emailUsed = em ? em.replace(/^(.{3}).*(@.*)$/, '$1***$2') : '';
    if (url.searchParams.get('test') === '1' && configured()) {
      try {
        await token(false);
        const p = await sr('/settings/company/pickup');
        const names = (p.data?.data?.shipping_address || []).map((x) => x.pickup_location);
        const want = env('SHIPROCKET_PICKUP_LOCATION') || 'Primary';
        return json({ enabled: true, emailUsed, loginOk: true, pickupLocations: names, pickupLocationUsed: want, pickupLocationFound: names.includes(want) });
      } catch (e) {
        return json({ enabled: true, emailUsed, loginOk: false, error: String(e.message || e) });
      }
    }
    return json({ enabled: configured() });
  }

  if (!configured()) return json({ success: false, error: 'Shiprocket is not set up yet' }, 503);

  // Run the background sync now (at most once every 2 minutes): /api/shiprocket/sync
  if (action === 'sync' && req.method === 'GET') {
    const last = await cacheGet('sr-sync-last');
    if (last && Date.now() - last.at < 120000) return json({ success: true, skipped: 'Synced less than 2 minutes ago', last: last.report });
    try {
      const report = await syncAll();
      await cachePut('sr-sync-last', { at: Date.now(), report }, 300);
      return json({ success: true, ...report });
    } catch (e) {
      return json({ success: false, error: String(e.message || e) }, 500);
    }
  }

  if (action === 'create-order' && req.method === 'POST') {
    try {
      const body = await req.json().catch(() => null);
      if (!body) return json({ success: false, error: 'Invalid order' }, 400);
      let order = body;
      if (body.paymentMethod === 'cod') {
        // COD: prefer the saved order from the database; if the database can't be read from here,
        // accept the order only if it passes basic checks (recent, real phone/pincode, sensible amounts).
        const found = await codOrderFromDatabase(body.id).catch(() => ({ error: 'lookup failed' }));
        if (found.order) order = found.order;
        else if (found.error === 'Order is cancelled' || found.error === 'Not a Cash on Delivery order') {
          return json({ success: false, error: found.error }, 400);
        } else {
          const problem = codSanity(body);
          if (problem) return json({ success: false, error: problem }, 400);
        }
      }
      if (!order.orderNumber || !Array.isArray(order.items) || !order.items.length) return json({ success: false, error: 'Invalid order' }, 400);
      if (order.paymentMethod !== 'cod') {
        const problem = await paidOnRazorpay(order);
        if (problem) return json({ success: false, error: problem }, 400);
      }

      const made = await createInShiprocket(order);
      if (!made.success) return json(made, 400);
      return json(made);
    } catch (e) {
      console.error('shiprocket create-order', e);
      return json({ success: false, error: String(e.message || 'Could not reach Shiprocket') }, 500);
    }
  }

  // Cancel an order that has not shipped yet. The website order number must match the Shiprocket order.
  if (action === 'cancel' && req.method === 'POST') {
    try {
      const b = await req.json().catch(() => ({}));
      const id = String(b.shiprocketOrderId || '').replace(/\D/g, '');
      const orderNumber = clean(b.orderNumber, 45);
      if (!id || !orderNumber) return json({ success: false, error: 'Missing order' }, 400);
      const o = await sr(`/orders/show/${id}`);
      const d = o.data?.data || {};
      if (!o.ok || String(d.channel_order_id || '') !== orderNumber) return json({ success: false, error: 'Order not found' }, 404);
      if (/CANCEL/i.test(String(d.status || ''))) return json({ success: true, already: true });
      if (/SHIPPED|TRANSIT|OUT FOR DELIVERY|DELIVERED|PICKED/i.test(String(d.status || ''))) {
        return json({ success: false, error: 'This order has already been shipped' }, 409);
      }
      const r = await sr('/orders/cancel', { method: 'POST', body: JSON.stringify({ ids: [Number(id)] }) });
      if (!r.ok) return json({ success: false, error: clean(r.data?.message, 200) || 'Shiprocket could not cancel the order' }, 400);
      return json({ success: true });
    } catch (e) {
      console.error('shiprocket cancel', e);
      return json({ success: false, error: 'Could not reach Shiprocket' }, 500);
    }
  }

  // Live shipping details of one order: /api/shiprocket/track?order=<shiprocketOrderId>&shipment=<shipmentId>
  if (action === 'track' && req.method === 'GET') {
    try {
      const orderId = (url.searchParams.get('order') || '').replace(/\D/g, '');
      const shipmentId = (url.searchParams.get('shipment') || '').replace(/\D/g, '');
      if (!orderId && !shipmentId) return json({ success: false, error: 'Missing order' }, 400);
      return json(await trackShiprocket(orderId, shipmentId));
    } catch (e) {
      console.error('shiprocket track', e);
      return json({ success: false, error: 'Could not reach Shiprocket' }, 500);
    }
  }

  return json({ error: 'Not found' }, 404);
};

export const config = { path: '/api/shiprocket/*' };
