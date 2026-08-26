import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { StoreSettings, PaymentSettings, HomepageCMS } from '../types';
import {
  INITIAL_STORE_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_HOMEPAGE_CMS,
} from '../data/initialSettings';

const SETTINGS_COLLECTION = 'settings';

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const storeName = data.storeName === 'Vana Botanica' ? 'buddy4plant' : (data.storeName || 'buddy4plant');
      const logoText = data.logoText === 'VANA BOTANICA' ? 'buddy4plant' : (data.logoText || 'buddy4plant');
      return { ...INITIAL_STORE_SETTINGS, ...data, storeName, logoText } as StoreSettings;
    }
    // Set initial
    await setDoc(docRef, INITIAL_STORE_SETTINGS, { merge: true });
    return INITIAL_STORE_SETTINGS;
  } catch (error) {
    console.warn('Fallback store settings:', error);
    return INITIAL_STORE_SETTINGS;
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.error('Error saving store settings:', error);
    throw error;
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'payments');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...INITIAL_PAYMENT_SETTINGS, ...snap.data() } as PaymentSettings;
    }
    await setDoc(docRef, INITIAL_PAYMENT_SETTINGS, { merge: true });
    return INITIAL_PAYMENT_SETTINGS;
  } catch (error) {
    console.warn('Fallback payment settings:', error);
    return INITIAL_PAYMENT_SETTINGS;
  }
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'payments');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.error('Error saving payment settings:', error);
    throw error;
  }
}

export async function getHomepageCMS(): Promise<HomepageCMS> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'homepage');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...INITIAL_HOMEPAGE_CMS, ...snap.data() } as HomepageCMS;
    }
    await setDoc(docRef, INITIAL_HOMEPAGE_CMS, { merge: true });
    return INITIAL_HOMEPAGE_CMS;
  } catch (error) {
    console.warn('Fallback homepage CMS:', error);
    return INITIAL_HOMEPAGE_CMS;
  }
}

export async function saveHomepageCMS(cms: HomepageCMS): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'homepage');
    await setDoc(docRef, cms, { merge: true });
  } catch (error) {
    console.error('Error saving homepage CMS:', error);
    throw error;
  }
}
