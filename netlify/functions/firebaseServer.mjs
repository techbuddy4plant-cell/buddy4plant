// Server-side access to Firebase for the API code (Cloudflare Worker / Netlify / local server.ts).
//
//  - fsFetch():        Firestore REST calls signed in as the project's service account, so they keep working
//                      after the database rules are locked (the service account is allowed everything).
//                      Without FIREBASE_SERVICE_ACCOUNT it falls back to plain (anonymous) calls, which only
//                      work while the rules are still open.
//  - verifyIdToken():  checks a signed-in visitor's Firebase ID token (sent as "Authorization: Bearer ...").
//  - isAdminUid():     an admin is a user with a document admins/{uid} (created by the owner in the Firebase console).
//  - rateLimit():      simple per-visitor limits for the public API endpoints.
//
// Environment variable (Cloudflare > Workers > buddy4plant > Settings > Variables and secrets, type Secret):
//   FIREBASE_SERVICE_ACCOUNT - the whole JSON file from Firebase > Project settings > Service accounts >
//                              "Generate new private key" (pasted as it is, or base64-encoded)

export const FIREBASE_PROJECT = 'buddy4plant-24f6f';
export const FS_DOCS = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

export const env = (name) => {
  let v = '';
  try { v = (globalThis.Netlify && globalThis.Netlify.env.get(name)) || ''; } catch { v = ''; }
  if (!v) v = (typeof process !== 'undefined' && process.env && process.env[name]) || '';
  return String(v).trim();
};

const _fetch = globalThis.fetch;
/** fetch that gives up after `ms` (default 12 s) */
export const timedFetch = (url, init = {}, ms = 12000) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return _fetch(url, { ...init, signal: c.signal }).finally(() => clearTimeout(t));
};

// ---------- base64url helpers ----------
const b64urlFromBytes = (bytes) => {
  let s = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const b64urlFromString = (str) => b64urlFromBytes(new TextEncoder().encode(str));
const bytesFromB64url = (s) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
};
const jsonFromB64url = (s) => JSON.parse(new TextDecoder().decode(bytesFromB64url(s)));

// ---------- service account ----------
let saCache = null;
export function serviceAccount() {
  if (saCache !== null) return saCache || null;
  const raw = env('FIREBASE_SERVICE_ACCOUNT');
  saCache = false;
  if (!raw) return null;
  try {
    const text = raw.startsWith('{') ? raw : new TextDecoder().decode(bytesFromB64url(raw.replace(/\s+/g, '')));
    const j = JSON.parse(text);
    if (j.client_email && j.private_key) saCache = j;
  } catch (e) {
    console.error('FIREBASE_SERVICE_ACCOUNT could not be read - paste the whole JSON file', String(e && e.message || e));
  }
  return saCache || null;
}

let tokenCache = { token: '', exp: 0 };
async function accessToken() {
  const sa = serviceAccount();
  if (!sa) return '';
  if (tokenCache.token && tokenCache.exp - 120 > Date.now() / 1000) return tokenCache.token;
  const pem = String(sa.private_key).replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const now = Math.floor(Date.now() / 1000);
  const head = b64urlFromString(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64urlFromString(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${head}.${claims}`));
  const r = await timedFetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${head}.${claims}.${b64urlFromBytes(sig)}`,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(`Service account login failed (${r.status}) ${d.error || ''}`);
  tokenCache = { token: d.access_token, exp: now + (Number(d.expires_in) || 3600) };
  return tokenCache.token;
}

/** Firestore REST call (path relative to FS_DOCS, or a full URL), signed in as the service account when configured. */
export async function fsFetch(pathOrUrl, init = {}) {
  const url = /^https?:/.test(pathOrUrl) ? pathOrUrl : `${FS_DOCS}${pathOrUrl.startsWith(':') || pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
  const headers = { ...(init.headers || {}) };
  try {
    const t = await accessToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  } catch (e) {
    console.error(String(e.message || e));
  }
  return timedFetch(url, { ...init, headers });
}

/** Is the server signed in with the service account? (for the health check) */
export async function serviceAccountStatus() {
  if (!serviceAccount()) return { configured: false };
  try {
    await accessToken();
    const r = await fsFetch(`/settings/general?mask.fieldPaths=storeName`);
    return { configured: true, ok: r.ok || r.status === 404, status: r.status };
  } catch (e) {
    return { configured: true, ok: false, error: String(e.message || e).slice(0, 200) };
  }
}

// ---------- Firestore value helpers ----------
export const fsValue = (x) => {
  if (!x || typeof x !== 'object') return undefined;
  if ('stringValue' in x) return x.stringValue;
  if ('integerValue' in x) return Number(x.integerValue);
  if ('doubleValue' in x) return Number(x.doubleValue);
  if ('booleanValue' in x) return x.booleanValue;
  if ('nullValue' in x) return null;
  if ('timestampValue' in x) return Date.parse(x.timestampValue);
  if ('mapValue' in x) return fsObject(x.mapValue.fields || {});
  if ('arrayValue' in x) return (x.arrayValue.values || []).map(fsValue);
  return undefined;
};
export const fsObject = (fields) => Object.fromEntries(Object.entries(fields || {}).map(([k, x]) => [k, fsValue(x)]));
export const toFs = (x) => {
  if (x === null || x === undefined) return { nullValue: null };
  if (typeof x === 'boolean') return { booleanValue: x };
  if (typeof x === 'number') return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(toFs) } };
  if (typeof x === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(x).filter(([, y]) => y !== undefined).map(([k, y]) => [k, toFs(y)])) } };
  return { stringValue: String(x) };
};

/** Reads one document: { data, updateTime } or null */
export async function readDoc(path) {
  const r = await fsFetch(`/${path}`);
  if (!r.ok) return null;
  const d = await r.json();
  return { data: fsObject(d.fields || {}), updateTime: d.updateTime };
}

/** Updates the given fields. With updateTime it only succeeds if nobody changed the document meanwhile. */
export async function patchDoc(path, fields, updateTime) {
  const keys = Object.keys(fields);
  if (!keys.length) return true;
  const q = keys.map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`);
  if (updateTime) q.push(`currentDocument.updateTime=${encodeURIComponent(updateTime)}`);
  const r = await fsFetch(`/${path}?${q.join('&')}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(keys.map((k) => [k, toFs(fields[k])])) }),
  });
  if (!r.ok) console.error('database update failed', path, r.status, (await r.text()).slice(0, 200));
  return r.ok;
}

/** Documents of a collection where `field` == value (string). */
export async function findWhere(collectionId, field, value, limit = 5) {
  const r = await fsFetch(':runQuery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: toFs(value) } },
        limit,
      },
    }),
  });
  if (!r.ok) throw new Error(`Could not read ${collectionId} (${r.status})`);
  const rows = await r.json();
  return rows.filter((x) => x.document).map((x) => ({
    ...fsObject(x.document.fields || {}),
    _id: x.document.name.split('/').pop(),
    _updateTime: x.document.updateTime,
  }));
}

// ---------- signed-in visitors ----------
let jwkCache = { keys: null, exp: 0 };
async function googleKeys() {
  if (jwkCache.keys && jwkCache.exp > Date.now()) return jwkCache.keys;
  const r = await timedFetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
  const d = await r.json();
  const age = Number((/max-age=(\d+)/.exec(r.headers.get('cache-control') || '') || [])[1]) || 3600;
  jwkCache = { keys: d.keys || [], exp: Date.now() + age * 1000 };
  return jwkCache.keys;
}

/** Returns the token's claims ({ uid, email, email_verified, ... }) or null if it is missing / invalid / expired. */
export async function verifyIdToken(token) {
  try {
    const [h, p, s] = String(token || '').split('.');
    if (!h || !p || !s) return null;
    const head = jsonFromB64url(h);
    const claims = jsonFromB64url(p);
    if (head.alg !== 'RS256') return null;
    const now = Math.floor(Date.now() / 1000);
    if (claims.aud !== FIREBASE_PROJECT || claims.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT}`) return null;
    if (!claims.sub || typeof claims.sub !== 'string' || claims.exp < now || claims.iat > now + 300) return null;
    const jwk = (await googleKeys()).find((k) => k.kid === head.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytesFromB64url(s), new TextEncoder().encode(`${h}.${p}`));
    return ok ? { ...claims, uid: claims.sub } : null;
  } catch {
    return null;
  }
}

/** The signed-in visitor of this request (from "Authorization: Bearer <Firebase ID token>"), or null. */
export async function requestUser(req) {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get('authorization') || '');
  return m ? verifyIdToken(m[1]) : null;
}

export async function isAdminUid(uid) {
  if (!uid || !/^[\w-]{6,128}$/.test(uid)) return false;
  const r = await fsFetch(`/admins/${encodeURIComponent(uid)}`);
  return r.ok;
}

/** Visitor + admin flag for this request. */
export async function requestAuth(req) {
  const user = await requestUser(req);
  return { user, admin: user ? await isAdminUid(user.uid) : false };
}

/** Is this signed-in user the customer of the order? */
export const ownsOrder = (user, order) =>
  !!user && !!order && (order.customerId === user.uid ||
    (!!user.email && user.email_verified === true && String(order.customerEmail || '').toLowerCase() === String(user.email).toLowerCase()));

// ---------- rate limiting ----------
const memHits = new Map();
export const clientIp = (req) =>
  req.headers.get('cf-connecting-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';

/**
 * true = allowed. Counts requests per visitor (IP) and bucket in a time window. Uses the shared Cloudflare
 * cache when available (counts are per data centre and approximate - fine for stopping floods and guessing).
 */
export async function rateLimit(req, bucket, limit, windowSec) {
  const ip = clientIp(req);
  const slot = Math.floor(Date.now() / 1000 / windowSec);
  const id = `${bucket}:${ip}:${slot}`;
  const cache = globalThis.caches && globalThis.caches.default;
  let n = 0;
  if (cache) {
    const key = new Request(`https://b4p-ratelimit.internal/${encodeURIComponent(id)}`);
    try {
      const hit = await cache.match(key);
      n = hit ? Number(await hit.text()) || 0 : 0;
      await cache.put(key, new Response(String(n + 1), { headers: { 'Cache-Control': `max-age=${windowSec + 5}` } }));
    } catch {
      /* cache not available - fall through to memory */
    }
  }
  const m = (memHits.get(id) || 0) + 1;
  memHits.set(id, m);
  if (memHits.size > 5000) memHits.clear();
  return Math.max(n + 1, m) <= limit;
}

export const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });

export const tooMany = () => json({ success: false, error: 'Too many requests. Please wait a minute and try again.' }, 429, { 'Retry-After': '60' });
