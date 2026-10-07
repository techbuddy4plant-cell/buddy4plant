// Razorpay endpoints for the Netlify-hosted site (same behaviour as server.ts).
// Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Netlify > Site configuration > Environment variables.
import crypto from 'node:crypto';

// Read a variable from Netlify (Functions v2) or process.env, trimming stray spaces/quotes
const env = (name) => {
  let v = '';
  try { v = (globalThis.Netlify && globalThis.Netlify.env.get(name)) || ''; } catch { v = ''; }
  if (!v) v = process.env[name] || '';
  return String(v).trim().replace(/^['"]+|['"]+$/g, '').trim();
};
const keys = () => {
  const keyId = env('RAZORPAY_KEY_ID');
  const keySecret = env('RAZORPAY_KEY_SECRET');
  const ok = /^rzp_(test|live)_/.test(keyId) && keySecret.length > 10;
  return { keyId, keySecret, ok, mode: keyId.startsWith('rzp_live_') ? 'live' : 'test' };
};
const auth = () => {
  const { keyId, keySecret } = keys();
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
};
// Razorpay sometimes answers 429 "Too many requests" for a moment (shared hosting addresses).
// Wait briefly and try again, so customers do not see an error.
async function rzpFetch(url, init) {
  let r;
  for (let i = 0; i < 4; i++) {
    r = await fetch(url, init);
    if (r.status !== 429 && r.status < 500) return r;
    if (i < 3) await new Promise((res) => setTimeout(res, 500 * (i + 1) + Math.floor(Math.random() * 300)));
  }
  return r;
}
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async (req) => {
  const action = new URL(req.url).pathname.replace(/\/+$/, '').split('/').pop();

  if (action === 'config' && req.method === 'GET') {
    // Credentials test: /api/razorpay/config?test=1 asks Razorpay whether the key pair is accepted
    if (new URL(req.url).searchParams.get('test') === '1') {
      const k = keys();
      let razorpayStatus = 0, razorpayError = '';
      try {
        const r = await rzpFetch('https://api.razorpay.com/v1/orders?count=1', { headers: { Authorization: auth() } });
        razorpayStatus = r.status;
        if (!r.ok) razorpayError = (await r.json().catch(() => ({})))?.error?.description || '';
      } catch (e) { razorpayError = 'Could not reach Razorpay'; }
      return json({
        keysAccepted: razorpayStatus === 200,
        razorpayStatus,
        razorpayError,
        keyIdUsed: k.keyId,
        secretLength: k.keySecret.length, // Razorpay secrets are normally 24 characters
        secretHasSpaces: /\s/.test(k.keySecret),
      });
    }
    const { ok, keyId, mode } = keys();
    const { keySecret } = keys();
    // Setup check (never reveals the secret): which variables this function can see
    const check = ok ? undefined : {
      keyIdFound: Boolean(keyId),
      keyIdLooksRight: /^rzp_(test|live)_/.test(keyId),
      secretFound: Boolean(keySecret),
      similarNames: Object.keys(process.env).filter((k) => /RAZ|RZR|RZP/i.test(k)),
    };
    return json({ enabled: ok, keyId: ok ? keyId : '', mode, ...(check ? { check } : {}) });
  }

  if (action === 'create-order' && req.method === 'POST') {
    try {
      if (!keys().ok) return json({ success: false, error: 'Online payment is not set up yet. Please choose Cash on Delivery.' }, 503);
      const body = await req.json().catch(() => ({}));
      const amount = Number(body?.amount);
      const receipt = String(body?.receipt || `rec_${Date.now()}`).slice(0, 40);
      if (!Number.isFinite(amount) || amount < 1 || amount > 500000) return json({ success: false, error: 'Invalid order amount' }, 400);
      const r = await rzpFetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth() },
        body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'INR', receipt, payment_capture: 1, notes: { receipt, store: 'Buddy4Plant' } }),
      });
      const order = await r.json();
      if (!r.ok) {
        console.error('Razorpay create-order failed', r.status, order?.error);
        return json({ success: false, error: order?.error?.description || 'Could not start the payment', code: order?.error?.code }, 400);
      }
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
        rzpFetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(pid)}`, { headers: { Authorization: auth() } }),
        rzpFetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(oid)}`, { headers: { Authorization: auth() } }),
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
