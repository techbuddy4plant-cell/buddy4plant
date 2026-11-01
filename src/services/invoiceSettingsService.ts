import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, withTimeout } from '../config/firebase';

/** How invoices look and what they contain (Admin > Invoice). Saved in the database at settings/invoice. */
export interface InvoiceSettings {
  businessName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  stateName: string;
  stateCode: string;
  /** invoice number = PREFIX/YY-YY/0001 */
  prefix: string;
  /** first number of a new financial year */
  startNumber: number;
  /** "auto" = TAX INVOICE when a GSTIN is set, otherwise INVOICE */
  title: string;
  thanksText: string;
  terms: string;
  footerNote: string;
  signatureUrl: string;
  signatoryLabel: string;
  accentColor: string;
  showSku: boolean;
  showPaymentId: boolean;
  showNotes: boolean;
  showEta: boolean;
  showWatermark: boolean;
  /** GST breakdown (CGST+SGST / IGST) on the invoice - switch on once prices are confirmed as GST-inclusive */
  showGstBreakdown: boolean;
  pricesIncludeGst: boolean;
  defaultHsn: string;
  defaultGstRate: number;
  /** per category id: HSN code and GST rate */
  categoryTax: Record<string, { hsn: string; rate: number }>;
  shippingGstRate: number;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  businessName: 'BUDDY4PLANT',
  tagline: 'Plants, pots and garden services',
  logoUrl: '/logo.png',
  address: 'Lucknow, Uttar Pradesh, India',
  phone: '+91 80048 81668',
  email: 'contactus@buddy4plant.in',
  website: 'buddy4plant.in',
  gstin: '09MYAPS0776F1ZX',
  pan: 'MYAPS0776F',
  stateName: 'Uttar Pradesh',
  stateCode: '09',
  prefix: 'B4P',
  startNumber: 1,
  title: 'auto',
  thanksText: 'Thank you for bringing green home!',
  terms: '',
  footerNote: 'This is a computer-generated invoice and does not need a signature.',
  signatureUrl: '',
  signatoryLabel: 'Authorised Signatory',
  accentColor: '#1f5a37',
  showSku: true,
  showPaymentId: true,
  showNotes: true,
  showEta: true,
  showWatermark: true,
  showGstBreakdown: false,
  pricesIncludeGst: true,
  defaultHsn: '',
  defaultGstRate: 0,
  categoryTax: {},
  shippingGstRate: 18,
};

const LOCAL_KEY = 'b4p_invoice_settings';
let cache: InvoiceSettings | null = null;

const merge = (x: Partial<InvoiceSettings> | null | undefined): InvoiceSettings => ({
  ...DEFAULT_INVOICE_SETTINGS,
  ...(x || {}),
  categoryTax: { ...(x?.categoryTax || {}) },
});

/** Last known settings without waiting (this browser's copy, or the defaults). */
export function getInvoiceSettingsNow(): InvoiceSettings {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return merge(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return merge(null);
}

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  try {
    const snap = await withTimeout(getDoc(doc(db, 'settings', 'invoice')));
    const s = merge(snap.exists() ? (snap.data() as Partial<InvoiceSettings>) : null);
    cache = s;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
    return s;
  } catch {
    return getInvoiceSettingsNow();
  }
}

/** Admin only (the database rules refuse everyone else). */
export async function saveInvoiceSettings(s: InvoiceSettings): Promise<void> {
  const clean = merge(s);
  await setDoc(doc(db, 'settings', 'invoice'), JSON.parse(JSON.stringify(clean)));
  cache = clean;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(clean));
  } catch {
    /* ignore */
  }
}

// ---------- invoice numbers ----------
/** Indian financial year of a date (April-March), e.g. "26-27". */
export function financialYear(ms: number): string {
  const d = new Date(ms + 5.5 * 3600000); // India time
  const y = d.getUTCFullYear();
  const start = d.getUTCMonth() >= 3 ? y : y - 1;
  return `${String(start).slice(-2)}-${String(start + 1).slice(-2)}`;
}

/** e.g. B4P/26-27/0012 */
export const formatInvoiceNumber = (prefix: string, fy: string, n: number) =>
  `${(prefix || 'B4P').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}/${fy}/${String(n).padStart(4, '0')}`;
