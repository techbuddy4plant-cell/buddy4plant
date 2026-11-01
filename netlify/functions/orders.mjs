// Order endpoints for customers. The database rules only let customers create orders and read their own,
// so looking up / cancelling an order goes through here, where the server checks who is asking.
//
//   POST /api/orders/lookup  { number | id, contact?, key? }  -> the order, if the visitor may see it
//   POST /api/orders/cancel  { id, reason, key? }               -> cancels (before it is packed)
//   POST /api/orders/return  { id, reason, comments? }          -> return / replacement request (after delivery)
//   GET  /api/orders/health                                     -> is the server signed in to the database?
//
// A visitor may see / change an order when they are: an admin, the signed-in customer who placed it, the browser
// that placed it (it keeps the order's private key), or - for lookup only - someone who knows the order number
// AND the phone number or email used on it (the "Track order" form).

import {
  json, tooMany, rateLimit, readDoc, patchDoc, findWhere, requestAuth, ownsOrder, serviceAccountStatus,
} from './firebaseServer.mjs';

const ID_RE = /^[\w-]{3,80}$/;
const digits = (v) => String(v || '').replace(/\D/g, '').slice(-10);
const PRIVATE = ['viewKey', 'notifyResult', 'shiprocketTries', 'shiprocketCancelTries', 'shiprocketSyncedAt'];
const publicOrder = (o, id) => {
  const out = { ...o, id };
  for (const k of PRIVATE) delete out[k];
  delete out._id;
  delete out._updateTime;
  return out;
};

async function loadOrder({ id, number }) {
  if (id && ID_RE.test(id)) {
    const d = await readDoc(`orders/${encodeURIComponent(id)}`);
    if (d) return { order: d.data, id, updateTime: d.updateTime };
  }
  const num = String(number || id || '').trim().toUpperCase();
  if (num && num.length <= 45) {
    const rows = await findWhere('orders', 'orderNumber', num, 2);
    if (rows[0]) return { order: rows[0], id: rows[0]._id, updateTime: rows[0]._updateTime };
  }
  return null;
}

async function mayChange(req, order, key) {
  const { user, admin } = await requestAuth(req);
  if (admin || ownsOrder(user, order)) return { ok: true, admin };
  return { ok: !!order.viewKey && typeof key === 'string' && key === order.viewKey, admin: false };
}

export default async (req) => {
  const url = new URL(req.url);
  const action = url.pathname.replace(/\/+$/, '').split('/').pop();

  try {
    if (action === 'health' && req.method === 'GET') {
      return json({ serviceAccount: await serviceAccountStatus() });
    }

    if (action === 'lookup' && req.method === 'POST') {
      if (!(await rateLimit(req, 'order-lookup', 30, 60))) return tooMany();
      const b = await req.json().catch(() => ({}));
      const found = await loadOrder({ id: String(b.id || ''), number: String(b.number || '') });
      const fail = async () => {
        // wrong guesses are limited much harder, so order numbers can't be tried one after another
        if (!(await rateLimit(req, 'order-lookup-miss', 15, 600))) return tooMany();
        return json({ success: false, error: 'No order found with these details.' }, 404);
      };
      if (!found) return fail();
      const o = found.order;
      const { user, admin } = await requestAuth(req);
      const contact = String(b.contact || '').trim().toLowerCase();
      const contactOk = !!contact && (
        (contact.includes('@') && contact === String(o.customerEmail || '').toLowerCase()) ||
        (digits(contact).length === 10 && [o.customerPhone, o.shippingAddress && o.shippingAddress.phone].some((p) => digits(p) === digits(contact)))
      );
      const keyOk = !!o.viewKey && typeof b.key === 'string' && b.key === o.viewKey;
      if (!(admin || ownsOrder(user, o) || keyOk || contactOk)) return fail();
      return json({ success: true, order: publicOrder(o, found.id) });
    }

    if (action === 'cancel' && req.method === 'POST') {
      if (!(await rateLimit(req, 'order-cancel', 10, 60))) return tooMany();
      const b = await req.json().catch(() => ({}));
      if (!ID_RE.test(String(b.id || ''))) return json({ success: false, error: 'Missing order' }, 400);
      const found = await loadOrder({ id: b.id });
      if (!found) return json({ success: false, error: 'Order not found' }, 404);
      const o = found.order;
      const who = await mayChange(req, o, b.key);
      if (!who.ok) return json({ success: false, error: 'Please sign in to cancel this order.' }, 403);
      if (o.orderStatus === 'Cancelled') return json({ success: true, already: true });
      if (!['Pending', 'Confirmed', 'Processing'].includes(o.orderStatus) && !who.admin) {
        return json({ success: false, error: 'This order is already packed or shipped, so it cannot be cancelled online. Please message us on WhatsApp.' }, 409);
      }
      const reason = String(b.reason || '').replace(/\s+/g, ' ').trim().slice(0, 400) || 'Cancelled by customer';
      const now = Date.now();
      const ok = await patchDoc(`orders/${encodeURIComponent(found.id)}`, {
        orderStatus: 'Cancelled',
        cancelledBy: who.admin ? 'admin' : 'user',
        cancelReason: reason,
        updatedAt: now,
        statusHistory: [...(Array.isArray(o.statusHistory) ? o.statusHistory : []), {
          status: 'Cancelled',
          timestamp: now,
          location: 'Customer Cancellation Request',
          note: `Order cancelled by customer. Reason: ${reason}`,
        }],
      }, found.updateTime);
      if (!ok) return json({ success: false, error: 'The order changed meanwhile. Please refresh and try again.' }, 409);
      return json({ success: true });
    }

    if (action === 'return' && req.method === 'POST') {
      if (!(await rateLimit(req, 'order-return', 10, 60))) return tooMany();
      const b = await req.json().catch(() => ({}));
      if (!ID_RE.test(String(b.id || ''))) return json({ success: false, error: 'Missing order' }, 400);
      const found = await loadOrder({ id: b.id });
      if (!found) return json({ success: false, error: 'Order not found' }, 404);
      const o = found.order;
      const who = await mayChange(req, o, b.key);
      if (!who.ok) return json({ success: false, error: 'Please sign in to request a return.' }, 403);
      if (o.orderStatus !== 'Delivered' && !who.admin) return json({ success: false, error: 'A return can be requested after the order is delivered.' }, 409);
      const reason = String(b.reason || '').replace(/\s+/g, ' ').trim().slice(0, 200);
      const comments = String(b.comments || '').replace(/\s+/g, ' ').trim().slice(0, 600);
      const now = Date.now();
      const ok = await patchDoc(`orders/${encodeURIComponent(found.id)}`, {
        orderStatus: 'Processing',
        updatedAt: now,
        statusHistory: [...(Array.isArray(o.statusHistory) ? o.statusHistory : []), {
          status: 'Processing',
          timestamp: now,
          location: o.currentLocation || 'Buddy4Plant Nursery, Lucknow',
          note: `Return/Replacement Requested. Reason: ${reason}${comments ? ` | Note: ${comments}` : ''}`,
        }],
      }, found.updateTime);
      if (!ok) return json({ success: false, error: 'The order changed meanwhile. Please refresh and try again.' }, 409);
      return json({ success: true });
    }

    return json({ error: 'Not found' }, 404);
  } catch (e) {
    console.error('orders endpoint', e);
    return json({ success: false, error: 'Something went wrong. Please try again.' }, 500);
  }
};

export const config = { path: '/api/orders/*' };
