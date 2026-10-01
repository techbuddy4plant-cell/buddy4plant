// Razorpay endpoints for the Netlify-hosted site (same behaviour as server.ts).
// Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Netlify > Site configuration > Environment variables.
import crypto from 'node:crypto';

const keys = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const ok = /^rzp_(test|live)_/.test(keyId) && keySecret.length > 10;
  return { keyId, keySecret, ok, mode: keyId.startsWith('rzp_live_') ? 'live' : 'test' };
};
const auth = () => {
  const { keyId, keySecret } = keys();
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async (req) => {
  const action = new URL(req.url).pathname.replace(/\/+$/, '').split('/').pop();

  if (action === 'config' && req.method === 'GET') {
    const { ok, keyId, mode } = keys();
    return json({ enabled: ok, keyId: ok ? keyId : '', mode });
  }

  if (action === 'create-order' && req.method === 'POST') {
    try {
      if (!keys().ok) return json({ success: false, error: 'Online payment is not set up yet. Please choose Cash on Delivery.' }, 503);
      const body = await req.json().catch(() => ({}));
      const amount = Number(body?.amount);
      const receipt = String(body?.receipt || `rec_${Date.now()}`).slice(0, 40);
      if (!Number.isFinite(amount) || amount < 1 || amount > 500000) return json({ success: false, error: 'Invalid order amount' }, 400);
      const r = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth() },
        body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'INR', receipt, payment_capture: 1, notes: { receipt, store: 'Buddy4Plant' } }),
      });
      const order = await r.json();
      if (!r.ok) return json({ success: false, error: order?.error?.description || 'Could not start the payment' }, 400);
      return json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, keyId: keys().keyId });
    } catch (e) {
      console.error('create-order', e);
      return json({ success: false, error: 'Could not reach the payment gateway. Please try again.' }, 500);
    }
  }

  if (action === 'verify-payment' && req.method === 'POST') {
    try {
      const { ok, keySecret } = keys();
      if (!ok) return json({ verified: false, error: 'Online payment is not set up' }, 503);
      const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = await req.json().catch(() => ({}));
      if (!oid || !pid || !sig) return json({ verified: false, error: 'Missing payment details' }, 400);

      const expected = crypto.createHmac('sha256', keySecret).update(`${oid}|${pid}`).digest('hex');
      const a = Buffer.from(expected);
      const b = Buffer.from(String(sig));
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return json({ verified: false, error: 'Payment signature mismatch' }, 400);

      // Confirm with Razorpay: payment belongs to this order, is captured/authorised, and the amount matches the order
      const [pr, or] = await Promise.all([
        fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(pid)}`, { headers: { Authorization: auth() } }),
        fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(oid)}`, { headers: { Authorization: auth() } }),
      ]);
      const payment = await pr.json();
      const order = await or.json();
      if (!pr.ok || !or.ok) return json({ verified: false, error: 'Could not confirm the payment with Razorpay' }, 400);
      const statusOk = payment.status === 'captured' || payment.status === 'authorized';
      if (payment.order_id !== oid || !statusOk || payment.amount !== order.amount) {
        return json({ verified: false, error: 'Payment could not be confirmed' }, 400);
      }
      return json({ verified: true, paymentId: payment.id, method: payment.method, amount: payment.amount / 100, status: payment.status });
    } catch (e) {
      console.error('verify-payment', e);
      return json({ verified: false, error: 'Verification error' }, 500);
    }
  }

  return json({ error: 'Not found' }, 404);
};

export const config = { path: '/api/razorpay/*' };
