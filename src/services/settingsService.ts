import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StoreSettings, PaymentSettings, HomepageCMS } from '../types';
import {
  INITIAL_STORE_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_HOMEPAGE_CMS,
} from '../data/initialSettings';

const SETTINGS_COLLECTION = 'settings';

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'settings' } }));
  }
};

// --- Store Settings ---
const STORE_SETTINGS_KEY = 'b4p_store_settings';

const getLocalStoreSettings = (): StoreSettings => {
  try {
    const saved = localStorage.getItem(STORE_SETTINGS_KEY);
    if (saved) {
      return { ...INITIAL_STORE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Error reading store settings from localStorage:', err);
  }
  return INITIAL_STORE_SETTINGS;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const storeName = data.storeName === 'Vana Botanica' ? 'buddy4plant' : (data.storeName || 'buddy4plant');
      const logoText = data.logoText === 'VANA BOTANICA' ? 'buddy4plant' : (data.logoText || 'buddy4plant');
      const merged = { ...INITIAL_STORE_SETTINGS, ...data, storeName, logoText } as StoreSettings;
      localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.warn('Fallback store settings:', error);
  }
  return getLocalStoreSettings();
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  // 1. Save to localStorage instantly
  try {
    localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(settings));
    emitStoreDataChanged();
  } catch (err) {
    console.warn('Error saving store settings locally:', err);
  }

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.warn('Firestore store settings save failed, saved locally:', error);
  }
}

// --- Payment Settings ---
const PAYMENT_SETTINGS_KEY = 'b4p_payment_settings';

const getLocalPaymentSettings = (): PaymentSettings => {
  try {
    const saved = localStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (saved) {
      return { ...INITIAL_PAYMENT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Error reading payment settings from localStorage:', err);
  }
  return INITIAL_PAYMENT_SETTINGS;
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'payments');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const merged = { ...INITIAL_PAYMENT_SETTINGS, ...snap.data() } as PaymentSettings;
      localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.warn('Fallback payment settings:', error);
  }
  return getLocalPaymentSettings();
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  // 1. Save to localStorage instantly
  try {
    localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
    emitStoreDataChanged();
  } catch (err) {
    console.warn('Error saving payment settings locally:', err);
  }

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'payments');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.warn('Firestore payment settings save failed, saved locally:', error);
  }
}

// --- Homepage CMS ---
const HOMEPAGE_CMS_KEY = 'b4p_homepage_cms';

const getLocalHomepageCMS = (): HomepageCMS => {
  try {
    const saved = localStorage.getItem(HOMEPAGE_CMS_KEY);
    if (saved) {
      return { ...INITIAL_HOMEPAGE_CMS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Error reading homepage CMS from localStorage:', err);
  }
  return INITIAL_HOMEPAGE_CMS;
};

export async function getHomepageCMS(): Promise<HomepageCMS> {
  const local = getLocalHomepageCMS();
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'homepage');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const merged = { ...INITIAL_HOMEPAGE_CMS, ...snap.data(), ...local } as HomepageCMS;
      try {
        localStorage.setItem(HOMEPAGE_CMS_KEY, JSON.stringify(merged));
      } catch (e) {
        // ignore storage error
      }
      return merged;
    }
  } catch (error) {
    console.warn('Fallback homepage CMS:', error);
  }
  return local;
}

export async function saveHomepageCMS(cms: HomepageCMS): Promise<void> {
  // 1. Save to localStorage instantly
  try {
    localStorage.setItem(HOMEPAGE_CMS_KEY, JSON.stringify(cms));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('b4p_cms_changed', { detail: cms }));
    }
    emitStoreDataChanged();
  } catch (err) {
    console.warn('Error saving homepage CMS locally:', err);
  }

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'homepage');
    await setDoc(docRef, cms, { merge: true });
  } catch (error) {
    console.warn('Firestore homepage CMS save failed, saved locally:', error);
  }
}
