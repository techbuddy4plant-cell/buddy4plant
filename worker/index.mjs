// Cloudflare Workers entry point.
// The website files are served from ./dist; only /api/* requests reach this code.
// It reuses the same Razorpay and Shiprocket code as the other hosts.
import razorpay from '../netlify/functions/razorpay.mjs';
import shiprocket, { syncAll } from '../netlify/functions/shiprocket.mjs';
import notify, { notifyAll } from '../netlify/functions/notify.mjs';
import orders from '../netlify/functions/orders.mjs';
import { rateLimit, tooMany } from '../netlify/functions/firebaseServer.mjs';
import { EmailMessage } from 'cloudflare:email';

// make the dashboard's Variables and Secrets readable as process.env.NAME
const loadEnv = (env) => {
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === 'string') process.env[k] = v;
  }
  // "new order" emails (Cloudflare Email Routing) - see netlify/functions/orderEmail.mjs
  globalThis.B4P_ORDER_EMAIL = env.ORDER_EMAIL || null;
  globalThis.B4P_EmailMessage = EmailMessage;
};

async function api(pathname, request) {
  if (pathname.startsWith('/api/razorpay/')) return razorpay(request);
  if (pathname.startsWith('/api/shiprocket/')) return shiprocket(request);
  if (pathname.startsWith('/api/notify/')) return notify(request);
  if (pathname.startsWith('/api/orders/')) return orders(request);
  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}

/** Safety headers on every API answer (the website pages get theirs from public/_headers). */
function secure(res) {
  const r = new Response(res.body, res);
  r.headers.set('X-Content-Type-Options', 'nosniff');
  r.headers.set('X-Frame-Options', 'DENY');
  r.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  r.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (!r.headers.has('Cache-Control')) r.headers.set('Cache-Control', 'no-store');
  return r;
}

export default {
  // every 30 minutes (wrangler.jsonc "triggers"): send waiting orders to Shiprocket and bring back AWB / status
  async scheduled(event, env, ctx) {
    loadEnv(env);
    ctx.waitUntil(syncAll().then((r) => console.log('Shiprocket sync', JSON.stringify(r))).catch((e) => console.error('Shiprocket sync failed', e)));
    // WhatsApp / SMS: order messages that were missed + cart reminders
    ctx.waitUntil(notifyAll().then((r) => console.log('Notify', JSON.stringify(r))).catch((e) => console.error('Notify failed', e)));
  },

  async fetch(request, env) {
    loadEnv(env);
    const url = new URL(request.url);
    // www.buddy4plant.in -> buddy4plant.in (pages are redirected by a line in index.html)
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    const { pathname } = url;
    if (pathname.startsWith('/api/')) {
      // overall limit per visitor on the API (each endpoint also has its own, stricter limits)
      if (!(await rateLimit(request, 'api', 120, 60))) return secure(tooMany());
      return secure(await api(pathname, request));
    }
    return env.ASSETS.fetch(request);
  },
};
