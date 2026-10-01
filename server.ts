import fs from 'fs';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

/* ------------------------------------------------------------------ */
/* WhatsApp confirmation for service enquiries                         */
/* Uses the WhatsApp Business (Cloud) API. Set in .env:                */
/*   WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID                          */
/*   WHATSAPP_ENQUIRY_TEMPLATE (default "enquiry_received", {{1}} name, */
/*     {{2}} service) and WHATSAPP_TEMPLATE_LANG (default "en")        */
/*   optional owner alert: WHATSAPP_OWNER_NUMBER + WHATSAPP_OWNER_TEMPLATE */
/*     ({{1}} name, {{2}} phone, {{3}} service, {{4}} city)            */
/* Without these settings the endpoint does nothing (returns skipped).  */
/* ------------------------------------------------------------------ */
const recentNotify = new Map<string, number>();
const toWaNumber = (raw: string) => {
  const d = String(raw || '').replace(/\D/g, '').replace(/^0+/, '');
  if (d.length === 10) return `91${d}`;
  if (d.length === 12 && d.startsWith('91')) return d;
  return d.length >= 11 && d.length <= 15 ? d : '';
};
async function sendWhatsAppTemplate(to: string, template: string, params: string[]) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId || !to || !template) return 'skipped';
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
        components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text: String(text || '-').slice(0, 200) })) }],
      },
    }),
  });
  if (!res.ok) {
    console.warn('WhatsApp send failed:', res.status, await res.text().catch(() => ''));
    return 'failed';
  }
  return 'sent';
}
app.post('/api/notify/enquiry', async (req, res) => {
  try {
    const { name = '', phone = '', service = '', city = '' } = req.body || {};
    const to = toWaNumber(phone);
    if (!to) return res.status(400).json({ customer: 'skipped', owner: 'skipped', error: 'Invalid phone' });
    const last = recentNotify.get(to) || 0;
    if (Date.now() - last < 10 * 60 * 1000) return res.json({ customer: 'skipped', owner: 'skipped', reason: 'recently notified' });
    recentNotify.set(to, Date.now());
    const firstName = String(name).trim().split(/\s+/)[0] || 'there';
    const customer = await sendWhatsAppTemplate(to, process.env.WHATSAPP_ENQUIRY_TEMPLATE || 'enquiry_received', [firstName, String(service).toLowerCase()]);
    const ownerTo = toWaNumber(process.env.WHATSAPP_OWNER_NUMBER || '');
    const owner = ownerTo && process.env.WHATSAPP_OWNER_TEMPLATE
      ? await sendWhatsAppTemplate(ownerTo, process.env.WHATSAPP_OWNER_TEMPLATE, [String(name), `+${to}`, String(service), String(city)])
      : 'skipped';
    res.json({ customer, owner });
  } catch (error) {
    console.error('Enquiry WhatsApp notify error:', error);
    res.json({ customer: 'failed', owner: 'failed' });
  }
});

/* ------------------------------------------------------------------ */
/* Admin photo / video uploads (projects)                              */
/* Files are stored in ./uploads and served at /uploads/...            */
/* In production set ADMIN_UPLOAD_KEY; the admin panel asks for it     */
/* once per session. Without the key, uploads work only in development. */
/* ------------------------------------------------------------------ */
const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
const UPLOAD_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};
const uploadKeyRequired = () => !!process.env.ADMIN_UPLOAD_KEY || process.env.NODE_ENV === 'production';
app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '30d' }));
app.get('/api/admin/upload-status', (_req, res) => res.json({ keyRequired: uploadKeyRequired() }));
app.post(
  '/api/admin/upload',
  express.raw({ type: Object.keys(UPLOAD_TYPES), limit: '80mb' }),
  (req, res) => {
    try {
      if (uploadKeyRequired()) {
        const key = process.env.ADMIN_UPLOAD_KEY;
        if (!key || req.get('x-b4p-upload-key') !== key) {
          return res.status(401).json({ error: 'Upload key required' });
        }
      }
      const type = (req.get('content-type') || '').split(';')[0].trim();
      const ext = UPLOAD_TYPES[type];
      if (!ext || !Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ error: 'Only JPG, PNG, WEBP images and MP4/WEBM/MOV videos are allowed' });
      }
      const folder = String(req.query.folder || 'projects').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'projects';
      const base = String(req.query.name || 'photo').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'photo';
      const dir = path.join(UPLOAD_ROOT, folder);
      fs.mkdirSync(dir, { recursive: true });
      const file = `${base}-${Date.now().toString(36)}${crypto.randomBytes(2).toString('hex')}${ext}`;
      fs.writeFileSync(path.join(dir, file), req.body);
      res.json({ url: `/uploads/${folder}/${file}` });
    } catch (error: any) {
      console.error('Upload failed:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);

// API: Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'Buddy4Plant',
    timestamp: new Date().toISOString(),
  });
});

// ---------------- Razorpay (online payments: UPI, cards, netbanking, wallets) ----------------
// Keys live only in .env (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). The secret never reaches the browser.
const rzpKeys = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const ok = /^rzp_(test|live)_/.test(keyId) && keySecret.length > 10;
  return { keyId, keySecret, ok, mode: keyId.startsWith('rzp_live_') ? 'live' : 'test' };
};
const rzpAuth = () => {
  const { keyId, keySecret } = rzpKeys();
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
};
// Amount of every Razorpay order we created, so a payment can't be verified against a different amount
const rzpOrders = new Map<string, { amount: number; receipt: string; at: number }>();

// API: is online payment available? (key id is public; secret is never sent)
app.get('/api/razorpay/config', (_req, res) => {
  const { ok, keyId, mode } = rzpKeys();
  res.json({ enabled: ok, keyId: ok ? keyId : '', mode });
});

// API: Razorpay Create Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { ok } = rzpKeys();
    if (!ok) return res.status(503).json({ success: false, error: 'Online payment is not set up yet. Please choose Cash on Delivery.' });

    const amount = Number(req.body?.amount);
    const receipt = String(req.body?.receipt || `rec_${Date.now()}`).slice(0, 40);
    if (!Number.isFinite(amount) || amount < 1 || amount > 500000) {
      return res.status(400).json({ success: false, error: 'Invalid order amount' });
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: rzpAuth() },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        receipt,
        payment_capture: 1,
        notes: { receipt, store: 'Buddy4Plant' },
      }),
    });
    const orderData: any = await response.json();
    if (!response.ok) {
      return res.status(400).json({ success: false, error: orderData?.error?.description || 'Could not start the payment' });
    }
    rzpOrders.set(orderData.id, { amount: orderData.amount, receipt, at: Date.now() });
    // forget old entries
    for (const [id, o] of rzpOrders) if (Date.now() - o.at > 6 * 3600 * 1000) rzpOrders.delete(id);

    return res.json({ success: true, orderId: orderData.id, amount: orderData.amount, currency: orderData.currency, keyId: rzpKeys().keyId });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: 'Could not reach the payment gateway. Please try again.' });
  }
});

// API: Razorpay Verify Payment - checks the signature, then asks Razorpay that the payment really
// belongs to this order, is captured/authorised and is for the right amount.
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { ok, keySecret } = rzpKeys();
    if (!ok) return res.status(503).json({ verified: false, error: 'Online payment is not set up' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ verified: false, error: 'Missing payment details' });
    }

    const expected = crypto.createHmac('sha256', keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(String(razorpay_signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(400).json({ verified: false, error: 'Payment signature mismatch' });
    }

    const pr = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, { headers: { Authorization: rzpAuth() } });
    const payment: any = await pr.json();
    if (!pr.ok) return res.status(400).json({ verified: false, error: 'Could not confirm the payment with Razorpay' });

    const known = rzpOrders.get(razorpay_order_id);
    const amountOk = !known || payment.amount === known.amount;
    const statusOk = payment.status === 'captured' || payment.status === 'authorized';
    if (payment.order_id !== razorpay_order_id || !statusOk || !amountOk) {
      return res.status(400).json({ verified: false, error: 'Payment could not be confirmed' });
    }

    return res.json({
      verified: true,
      paymentId: payment.id,
      method: payment.method, // upi | card | netbanking | wallet ...
      amount: payment.amount / 100,
      status: payment.status,
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ verified: false, error: 'Verification error' });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));

    // SEO: put the right title, description, canonical, Open Graph and JSON-LD into the HTML
    // for each URL (generated by scripts/generate-seo.ts into dist/seo-routes.json).
    const baseHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
    let seoRoutes: Record<string, { title: string; description: string; image?: string; type?: string; jsonLd?: unknown[] }> = {};
    try {
      seoRoutes = JSON.parse(fs.readFileSync(path.join(distPath, 'seo-routes.json'), 'utf-8'));
    } catch {
      console.warn('seo-routes.json not found - serving default meta tags');
    }
    const SITE = 'https://buddy4plant.in';
    const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const renderHtml = (urlPath: string) => {
      const clean = urlPath.split('?')[0].replace(/\/+$/, '') || '/';
      const r = seoRoutes[clean];
      if (!r) return baseHtml;
      const title = r.title.includes('Buddy4Plant') ? r.title : `${r.title} | Buddy4Plant`;
      const url = `${SITE}${clean === '/' ? '/' : clean}`;
      const img = r.image ? (r.image.startsWith('http') ? r.image : `${SITE}${r.image}`) : `${SITE}/plant-photos/areca-palm-plant.jpg`;
      let html = baseHtml
        .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
        .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(r.description)}" />`)
        .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
        .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(title)}" />`)
        .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(r.description)}" />`)
        .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${esc(img)}" />`)
        .replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${r.type === 'article' ? 'article' : 'website'}" />`);
      html = html.replace('</head>', `    <meta property="og:url" content="${url}" />\n  </head>`);
      if (r.jsonLd?.length) {
        const ld = JSON.stringify(r.jsonLd.length === 1 ? r.jsonLd[0] : r.jsonLd).replace(/</g, '\\u003c');
        html = html.replace('</head>', `    <script type="application/ld+json" id="b4p-page-jsonld">${ld}</script>\n  </head>`);
      }
      return html;
    };
    app.get('*', (req, res) => {
      res.set('Content-Type', 'text/html; charset=utf-8').send(renderHtml(req.path));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Buddy4Plant server running at http://localhost:${PORT}`);
  });
}

start();
