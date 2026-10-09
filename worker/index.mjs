// Cloudflare Workers entry point.
// The website files are served from ./dist; only /api/* requests reach this code.
// It reuses the same Razorpay and Shiprocket code as the other hosts.
import razorpay from '../netlify/functions/razorpay.mjs';
import shiprocket, { syncAll } from '../netlify/functions/shiprocket.mjs';

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
  },

  async fetch(request, env) {
    loadEnv(env);
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/razorpay/')) return razorpay(request);
    if (pathname.startsWith('/api/shiprocket/')) return shiprocket(request);
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return env.ASSETS.fetch(request);
  },
};
