// Cloudflare Workers entry point.
// The website files are served from ./dist; only /api/* requests reach this code.
// It reuses the same Razorpay and Shiprocket code as the other hosts.
import razorpay from '../netlify/functions/razorpay.mjs';
import shiprocket, { syncAll } from '../netlify/functions/shiprocket.mjs';
import notify, { notifyAll } from '../netlify/functions/notify.mjs';

// make the dashboard's Variables and Secrets readable as process.env.NAME
const loadEnv = (env) => {
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === 'string') process.env[k] = v;
  }
};

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
    if (pathname.startsWith('/api/razorpay/')) return razorpay(request);
    if (pathname.startsWith('/api/shiprocket/')) return shiprocket(request);
    if (pathname.startsWith('/api/notify/')) return notify(request);
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return env.ASSETS.fetch(request);
  },
};
