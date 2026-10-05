// Shiprocket endpoints (used by the Netlify site, and by server.ts on a local computer).
// Environment variables:
//   SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD  - the API user from Shiprocket > Settings > API > Add New API User
//   SHIPROCKET_PICKUP_LOCATION              - pickup location nickname exactly as in Shiprocket (default "Primary")
//   SHIPROCKET_BOX_CM                       - optional default box "length,breadth,height" (default 25,25,35)
//   SHIPROCKET_WEIGHT_PER_ITEM_KG           - optional (default 0.5)
// Only orders with a confirmed Razorpay payment are accepted, so nobody can create fake shipments.

const API = 'https://apiv2.shiprocket.in/v1/external';

const env = (name) => {
  let v = '';
  try { v = (globalThis.Netlify && globalThis.Netlify.env.get(name)) || ''; } catch { v = ''; }
  if (!v) v = process.env[name] || '';
  return String(v).trim().replace(/^['"]+|['"]+$/g, '').trim();
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const configured = () => Boolean(env('SHIPROCKET_EMAIL') && env('SHIPROCKET_PASSWORD'));

// Shiprocket tokens last 10 days; keep one for 8 days while this function instance is warm
let cached = { token: '', at: 0 };
async function token(force = false) {
  if (!force && cached.token && Date.now() - cached.at < 8 * 86400000) return cached.token;
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env('SHIPROCKET_EMAIL'), password: env('SHIPROCKET_PASSWORD') }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.token) throw new Error(d.message || 'Shiprocket login failed - check the API user email and password');
  cached = { token: d.token, at: Date.now() };
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
  const [pr, or] = await Promise.all([
    fetch(`https://api.razorpay.com/v1/payments/${pid}`, { headers: { Authorization: rzpAuth() } }),
    fetch(`https://api.razorpay.com/v1/orders/${oid}`, { headers: { Authorization: rzpAuth() } }),
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
    payment_method: 'Prepaid',
    shipping_charges: Number(order.shippingCharge) || 0,
    total_discount: Number(order.discount) || 0,
    sub_total: Number(order.subtotal) || items.reduce((s, it) => s + it.selling_price * it.units, 0),
    length: L,
    breadth: B,
    height: H,
    weight: Math.max(0.5, Math.round(units * perItem * 100) / 100),
  };
}

export default async (req) => {
  const url = new URL(req.url);
  const action = url.pathname.replace(/\/+$/, '').split('/').pop();

  if (action === 'config' && req.method === 'GET') {
    if (url.searchParams.get('test') === '1' && configured()) {
      try {
        await token(true);
        const p = await sr('/settings/company/pickup');
        const names = (p.data?.data?.shipping_address || []).map((x) => x.pickup_location);
        const want = env('SHIPROCKET_PICKUP_LOCATION') || 'Primary';
        return json({ enabled: true, loginOk: true, pickupLocations: names, pickupLocationUsed: want, pickupLocationFound: names.includes(want) });
      } catch (e) {
        return json({ enabled: true, loginOk: false, error: String(e.message || e) });
      }
    }
    return json({ enabled: configured() });
  }

  if (!configured()) return json({ success: false, error: 'Shiprocket is not set up yet' }, 503);

  if (action === 'create-order' && req.method === 'POST') {
    try {
      const order = await req.json().catch(() => null);
      if (!order || !order.orderNumber || !Array.isArray(order.items) || !order.items.length) return json({ success: false, error: 'Invalid order' }, 400);
      const problem = await paidOnRazorpay(order);
      if (problem) return json({ success: false, error: problem }, 400);

      const r = await sr('/orders/create/adhoc', { method: 'POST', body: JSON.stringify(buildShiprocketOrder(order)) });
      const d = r.data || {};
      if (!r.ok || !d.order_id) {
        console.error('Shiprocket create failed', r.status, JSON.stringify(d).slice(0, 800));
        const msg = d.message || (d.errors && Object.values(d.errors).flat().join(' ')) || 'Shiprocket did not accept the order';
        return json({ success: false, error: String(msg).slice(0, 300) }, 400);
      }
      return json({ success: true, shiprocketOrderId: String(d.order_id), shipmentId: String(d.shipment_id || ''), status: d.status || 'NEW' });
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
      return json(out);
    } catch (e) {
      console.error('shiprocket track', e);
      return json({ success: false, error: 'Could not reach Shiprocket' }, 500);
    }
  }

  return json({ error: 'Not found' }, 404);
};

export const config = { path: '/api/shiprocket/*' };
