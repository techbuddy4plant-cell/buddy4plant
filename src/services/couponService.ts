import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/initialSettings';

const COUPONS_COLLECTION = 'coupons';
const LOCAL_STORAGE_KEY = 'b4p_coupons_db';

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'coupons' } }));
  }
};

const getLocalCoupons = (): Coupon[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading coupons from localStorage:', err);
  }
  return INITIAL_COUPONS;
};

const setLocalCoupons = (coupons: Coupon[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(coupons));
    emitStoreDataChanged();
  } catch (err) {
    console.warn('Error saving coupons to localStorage:', err);
  }
};

export async function seedCouponsIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, COUPONS_COLLECTION);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const coup of INITIAL_COUPONS) {
        const docRef = doc(db, COUPONS_COLLECTION, coup.id);
        batch.set(docRef, coup);
      }
      await batch.commit();
    }
  } catch (error) {
    console.warn('Coupon seed fallback:', error);
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    await seedCouponsIfEmpty();
    const snap = await getDocs(collection(db, COUPONS_COLLECTION));
    if (!snap.empty) {
      const remoteCoupons = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
      setLocalCoupons(remoteCoupons);
      return remoteCoupons;
    }
  } catch (error) {
    console.warn('Fallback local coupons:', error);
  }
  return getLocalCoupons();
}

export const getCoupons = getAllCoupons;

export async function validateCoupon(
  code: string,
  orderSubtotal: number
): Promise<{ valid: boolean; discountAmount: number; message: string; coupon?: Coupon }> {
  try {
    const coupons = await getAllCoupons();
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.active);

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or inactive coupon code' };
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.expiryDate && coupon.expiryDate < today) {
      return { valid: false, discountAmount: 0, message: 'This coupon has expired' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'Coupon usage limit has been reached' };
    }

    if (coupon.minOrderValue && orderSubtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Add items worth ₹${coupon.minOrderValue - orderSubtotal} more to apply this coupon (Minimum order ₹${coupon.minOrderValue})`
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderSubtotal);

    return {
      valid: true,
      discountAmount,
      message: `Coupon '${coupon.code}' applied! You saved ₹${discountAmount}`,
      coupon
    };
  } catch (error) {
    return { valid: false, discountAmount: 0, message: 'Failed to validate coupon' };
  }
}

export async function saveCoupon(coupon: Partial<Coupon> & { code: string; discountValue: number }): Promise<string> {
  const id = coupon.id || coupon.code.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const couponData: Coupon = {
    id,
    code: coupon.code.toUpperCase().trim(),
    discountType: coupon.discountType || 'percentage',
    discountValue: Number(coupon.discountValue),
    minOrderValue: Number(coupon.minOrderValue || 0),
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
    expiryDate: coupon.expiryDate || '2028-12-31',
    usageLimit: coupon.usageLimit ? Number(coupon.usageLimit) : undefined,
    usedCount: coupon.usedCount || 0,
    active: coupon.active !== undefined ? coupon.active : true,
    description: coupon.description || '',
  };

  // 1. Save to localStorage instantly
  const current = getLocalCoupons();
  const existingIdx = current.findIndex((c) => c.id === id);
  let updatedList: Coupon[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = couponData;
  } else {
    updatedList = [couponData, ...current];
  }
  setLocalCoupons(updatedList);

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, COUPONS_COLLECTION, id);
    await setDoc(docRef, couponData, { merge: true });
  } catch (err) {
    console.warn('Firestore coupon save failed, saved locally:', err);
  }

  return id;
}

export async function deleteCoupon(id: string): Promise<void> {
  // 1. Delete from localStorage
  const current = getLocalCoupons();
  const updatedList = current.filter((c) => c.id !== id);
  setLocalCoupons(updatedList);

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, COUPONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore coupon delete failed, removed locally:', err);
  }
}
