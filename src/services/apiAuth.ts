import { auth } from '../config/firebase';

/**
 * Helpers for calling the website's own server (/api/...) as the signed-in visitor.
 * The server checks the Firebase ID token itself, so nobody can act for someone else.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  try {
    const u = auth.currentUser;
    if (!u) return {};
    return { Authorization: `Bearer ${await u.getIdToken()}` };
  } catch {
    return {};
  }
}

/** POST JSON to our server; resolves to { ok, status, data } and never throws. */
export async function postApi<T = any>(path: string, body: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} as T };
  }
}

// ---------- private order keys ----------
// Every order gets a random private key when it is placed. The browser that placed it keeps the key,
// so a guest (not signed in) can still open, track and cancel their own order - and nobody else can.
const KEYS = 'b4p_order_keys';
type KeyMap = Record<string, { id: string; key: string; at: number }>;

const readKeys = (): KeyMap => {
  try {
    return JSON.parse(localStorage.getItem(KEYS) || '{}');
  } catch {
    return {};
  }
};

export function newOrderKey(): string {
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 32);
}

export function rememberOrderKey(orderNumber: string, id: string, key: string) {
  try {
    const all = readKeys();
    all[orderNumber.toUpperCase()] = { id, key, at: Date.now() };
    // keep the newest 50
    const trimmed = Object.entries(all).sort((a, b) => b[1].at - a[1].at).slice(0, 50);
    localStorage.setItem(KEYS, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    /* storage blocked */
  }
}

/** The private key of an order placed in this browser (by order number or order id). */
export function orderKeyFor(numberOrId: string): string | undefined {
  const all = readKeys();
  const k = numberOrId.trim();
  const hit = all[k.toUpperCase()] || Object.values(all).find((x) => x.id === k);
  return hit?.key;
}
