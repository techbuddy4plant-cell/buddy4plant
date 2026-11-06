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

// ---------- SEO for every page address ----------
// The site is a single-page app, so without this every address would send search engines the
// homepage's title and a canonical link pointing at the homepage. scripts/generate-seo.ts writes
// dist/seo-routes.json at build time; here each page gets its own title, description, canonical,
// Open Graph tags and JSON-LD before the HTML is sent.
const SITE = 'https://buddy4plant.in';
let seoRoutes = null;
let baseHtml = null;
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function loadSeo(env, origin) {
  if (!seoRoutes) {
    try {
      const r = await env.ASSETS.fetch(new Request(`${origin}/seo-routes.json`));
      seoRoutes = r.ok ? await r.json() : {};
    } catch {
      seoRoutes = {};
    }
  }
  if (!baseHtml) {
    const r = await env.ASSETS.fetch(new Request(`${origin}/`));
    if (!r.ok) return false;
    baseHtml = await r.text();
  }
  return true;
}

// other addresses that show the same page - search engines are pointed at the main address
const ALIASES = {
  '/locate-store': '/store-locator',
  '/terms': '/terms-and-conditions',
  '/terms-of-service': '/terms-and-conditions',
  '/privacy': '/privacy-policy',
  '/shipping': '/shipping-policy',
  '/refund': '/refund-policy',
  '/refunds': '/refund-policy',
  '/returns': '/refund-policy',
  '/cancellation-policy': '/refund-policy',
};

function renderPage(pathname) {
  const raw = pathname.replace(/\/+$/, '') || '/';
  const clean = ALIASES[raw] || raw;
  const url = `${SITE}${clean === '/' ? '/' : encodeURI(decodeURI(clean))}`;
  const r = seoRoutes[clean];
  let html = baseHtml.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(url)}" />`);
  if (!/property="og:url"/.test(html)) html = html.replace('</head>', `  <meta property="og:url" content="${esc(url)}" />\n</head>`);
  if (!r) return html; // pages not in the list (new products etc.) keep the general tags but point at themselves
  const title = r.title.includes('Buddy4Plant') ? r.title : `${r.title} | Buddy4Plant`;
  const img = r.image ? (r.image.startsWith('http') ? r.image : `${SITE}${r.image}`) : `${SITE}/plant-photos/areca-palm-plant.jpg`;
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(r.description)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(r.description)}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${esc(img)}" />`)
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${r.type === 'article' ? 'article' : 'website'}" />`);
  if (r.jsonLd?.length) {
    const ld = JSON.stringify(r.jsonLd.length === 1 ? r.jsonLd[0] : r.jsonLd).replace(/</g, '\\u003c');
    html = html.replace('</head>', `  <script type="application/ld+json" id="b4p-page-jsonld">${ld}</script>\n</head>`);
  }
  return html;
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
    // page addresses (no file extension): the app's HTML with this page's own SEO tags
    if ((request.method === 'GET' || request.method === 'HEAD') && !/\.[a-z0-9]{1,8}$/i.test(pathname)) {
      try {
        if (await loadSeo(env, url.origin)) {
          return new Response(request.method === 'HEAD' ? null : renderPage(pathname), {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=0, must-revalidate',
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'SAMEORIGIN',
              'Referrer-Policy': 'strict-origin-when-cross-origin',
              'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=()',
              'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
              'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
            },
          });
        }
      } catch (e) {
        console.error('SEO page render failed', e);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
