// Cloudflare Workers entry point.
// The website files are served from ./dist; only /api/* requests reach this code.
// It reuses the same Razorpay and Shiprocket code as the other hosts.
import razorpay from '../netlify/functions/razorpay.mjs';
import shiprocket from '../netlify/functions/shiprocket.mjs';

export default {
  async fetch(request, env) {
    // make the dashboard's Variables and Secrets readable as process.env.NAME
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === 'string') process.env[k] = v;
    }
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/razorpay/')) return razorpay(request);
    if (pathname.startsWith('/api/shiprocket/')) return shiprocket(request);
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return env.ASSETS.fetch(request);
  },
};
