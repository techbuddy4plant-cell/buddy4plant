/**
 * Sign-in / sign-up safety checks used by the customer login and the admin login.
 *  - email: format, common typos ("gmial.com"), throwaway inboxes, and whether the domain can receive mail
 *  - password: minimum strength for new accounts
 *  - lockout: after 5 wrong attempts the form waits 30 s, then 1, 2, 5, 15 minutes (per email, on this device).
 *    Firebase also blocks repeated guessing on its own servers.
 *  - friendly messages instead of raw "Firebase: Error (auth/...)" texts; they never reveal whether an
 *    account exists for an email.
 */

// ---------- email ----------
const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const POPULAR = [
  'gmail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'hotmail.com', 'outlook.com', 'outlook.in', 'live.com',
  'icloud.com', 'me.com', 'rediffmail.com', 'protonmail.com', 'proton.me', 'aol.com', 'zoho.com', 'zohomail.in',
  'msn.com', 'ymail.com', 'gmx.com', 'mail.com', 'buddy4plant.in',
];

// Throwaway / temporary inbox services (not a complete list - the most common ones)
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com', 'grr.la',
  '10minutemail.com', '10minutemail.net', '10minmail.com', 'tempmail.com', 'temp-mail.org', 'temp-mail.io',
  'tempmail.net', 'tempmailo.com', 'tempr.email', 'throwawaymail.com', 'yopmail.com', 'yopmail.net', 'yopmail.fr',
  'getnada.com', 'nada.email', 'dispostable.com', 'maildrop.cc', 'mailnesia.com', 'trashmail.com', 'trashmail.de',
  'fakeinbox.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'spamgourmet.com', 'mytemp.email',
  'tempinbox.com', 'mailcatch.com', 'moakt.com', 'burnermail.io', 'inboxkitten.com', 'mail.tm', 'tmail.ws',
  'tmpmail.org', 'tmpmail.net', 'emailfake.com', 'fakemail.net', 'mailpoof.com', 'mailsac.com', 'harakirimail.com',
  'discard.email', 'spambox.us', 'luxusmail.org', 'tempail.com', 'byom.de', 'trbvm.com', 'cuvox.de', 'armyspy.com',
  'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com',
  'teleworm.us', 'mailforspam.com', 'tempmailaddress.com', 'emltmp.com', 'linshiyouxiang.net', 'mvrht.net',
  'owlymail.com', 'mailtemp.net', 'temporary-mail.net', 'disposablemail.com', 'cock.li', 'guerrillamailblock.com',
]);

const lev = (a: string, b: string) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

export interface EmailCheck {
  ok: boolean;
  email: string;
  /** why it is not OK */
  message?: string;
  /** a likely-intended address for a typo such as gmial.com (the typed one may still be correct) */
  suggestion?: string;
}

/** Quick check while typing / before submitting (no network). */
export function checkEmailFormat(raw: string): EmailCheck {
  const email = raw.trim().toLowerCase();
  if (!email) return { ok: false, email, message: 'Please enter your email address.' };
  if (email.length > 254 || !EMAIL_RE.test(email) || email.includes('..')) {
    return { ok: false, email, message: 'This is not a valid email address. Please check it (example: name@gmail.com).' };
  }
  const domain = email.split('@')[1];
  const tld = domain.split('.').pop() || '';
  if (tld.length < 2 || /\d/.test(tld)) {
    return { ok: false, email, message: 'This is not a valid email address - the part after the last dot looks wrong.' };
  }
  if (DISPOSABLE.has(domain)) {
    return { ok: false, email, message: 'Temporary / throwaway email addresses are not allowed. Please use your regular email.' };
  }
  if (!POPULAR.includes(domain)) {
    const near = POPULAR.find((p) => lev(domain, p) <= 2 && Math.abs(domain.length - p.length) <= 2);
    if (near) {
      const suggestion = `${email.split('@')[0]}@${near}`;
      return { ok: false, email, message: `Did you mean ${suggestion}?`, suggestion };
    }
  }
  return { ok: true, email };
}

/**
 * Checks (via Google's public DNS) that the email's domain exists and can receive mail.
 * Returns true when it can, or when the check itself could not run (never blocks people because of a network hiccup).
 */
export async function emailDomainCanReceive(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain || POPULAR.includes(domain)) return true;
  const ask = async (type: string) => {
    const c = new AbortController();
    const t = window.setTimeout(() => c.abort(), 4000);
    try {
      const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, { signal: c.signal });
      return (await r.json()) as { Status: number; Answer?: { type: number }[] };
    } finally {
      window.clearTimeout(t);
    }
  };
  try {
    const mx = await ask('MX');
    if (mx.Status === 3) return false; // domain does not exist
    if (mx.Answer?.some((a) => a.type === 15)) return true;
    const a = await ask('A'); // no MX: mail can still go to the domain's own address
    return !!a.Answer?.length;
  } catch {
    return true;
  }
}

/** Full check for new accounts: format + domain (a typo suggestion the person chose to ignore is allowed). */
export async function validateNewEmail(raw: string): Promise<EmailCheck> {
  const f = checkEmailFormat(raw);
  if (!f.ok && !f.suggestion) return f;
  if (!(await emailDomainCanReceive(f.email))) {
    return {
      ok: false,
      email: f.email,
      message: `The email domain "${f.email.split('@')[1]}" doesn't exist or can't receive emails. Please check your email address.`,
    };
  }
  return { ok: true, email: f.email };
}

// ---------- password ----------
export function checkNewPassword(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (pw.length > 128) return 'Password is too long.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain letters and at least one number.';
  if (/^(.)\1+$/.test(pw) || /^(12345678|password1?|qwerty123|abcd1234)$/i.test(pw)) return 'This password is too easy to guess. Please choose another.';
  return null;
}

// ---------- lockout after repeated failures ----------
const LOCK_KEY = 'b4p_auth_attempts';
const STEPS = [30, 60, 120, 300, 900]; // seconds
type Attempts = Record<string, { fails: number; until: number }>;
const readAttempts = (): Attempts => {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) || '{}');
  } catch {
    return {};
  }
};
const writeAttempts = (a: Attempts) => {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(a));
  } catch {
    /* storage blocked */
  }
};

/** Seconds the person still has to wait before trying this email again (0 = may try). */
export function lockedFor(scope: string, email: string): number {
  const rec = readAttempts()[`${scope}:${email.trim().toLowerCase()}`];
  return rec ? Math.max(0, Math.ceil((rec.until - Date.now()) / 1000)) : 0;
}
export function recordFailure(scope: string, email: string) {
  const all = readAttempts();
  const k = `${scope}:${email.trim().toLowerCase()}`;
  const rec = all[k] || { fails: 0, until: 0 };
  rec.fails += 1;
  if (rec.fails >= 5) rec.until = Date.now() + STEPS[Math.min(rec.fails - 5, STEPS.length - 1)] * 1000;
  all[k] = rec;
  writeAttempts(all);
}
export function clearFailures(scope: string, email: string) {
  const all = readAttempts();
  delete all[`${scope}:${email.trim().toLowerCase()}`];
  writeAttempts(all);
}
export const waitText = (s: number) => (s >= 60 ? `${Math.ceil(s / 60)} minute${s >= 120 ? 's' : ''}` : `${s} seconds`);

// ---------- friendly Firebase errors ----------
export function friendlyAuthError(err: unknown, mode: 'login' | 'register' | 'reset' | 'google'): string {
  const code = String((err as { code?: string })?.code || (err as Error)?.message || '');
  if (/invalid-email/.test(code)) return 'This is not a valid email address.';
  if (/too-many-requests/.test(code)) return 'Too many attempts. For your safety, please wait a few minutes and try again.';
  if (/network-request-failed/.test(code)) return 'No internet connection. Please check your connection and try again.';
  if (/user-disabled/.test(code)) return 'This account has been disabled. Please contact us on WhatsApp.';
  if (mode === 'register') {
    if (/email-already-in-use/.test(code)) return 'An account with this email already exists. Please sign in instead, or use "Forgot password".';
    if (/weak-password|password-does-not-meet/.test(code)) return 'Please choose a stronger password (at least 8 characters with letters and numbers).';
  }
  if (mode === 'google') {
    if (/popup-closed|cancelled-popup/.test(code)) return 'Google sign-in was closed before finishing.';
    if (/popup-blocked/.test(code)) return 'Your browser blocked the Google window. Please allow pop-ups and try again.';
    if (/account-exists-with-different-credential/.test(code)) return 'This email is already registered with a password. Please sign in with your email and password.';
  }
  if (mode === 'login' && /(wrong-password|user-not-found|invalid-credential|invalid-login-credentials)/.test(code)) {
    return 'Email or password is incorrect.';
  }
  if (/app-check|appCheck/.test(code)) return 'Security check failed. Please refresh the page and try again.';
  return mode === 'reset'
    ? 'Could not send the reset email right now. Please try again in a minute.'
    : 'Something went wrong. Please try again.';
}
