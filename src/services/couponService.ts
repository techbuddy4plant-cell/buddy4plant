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
const DELETED_IDS_KEY = 'b4p_deleted_coupon_ids';
const SEEDED_FLAG_KEY = 'b4p_coupons_seeded';

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'coupons' } }));
  }
};

const getDeletedCouponIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

const markCouponDeleted = (id: string) => {
  const set = getDeletedCouponIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

const unmarkCouponDeleted = (id: string) => {
  const set = getDeletedCouponIds();
  set.delete(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

const getLocalCoupons = (): Coupon[] => {
  const deletedIds = getDeletedCouponIds();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => c && c.id && !deletedIds.has(c.id));
      }
    }
  } catch (err) {
    console.warn('Error reading coupons from localStorage:', err);
  }

  const isSeeded = typeof window !== 'undefined' ? localStorage.getItem(SEEDED_FLAG_KEY) : null;
  if (isSeeded === 'true') {
    return [];
  }

  return INITIAL_COUPONS.filter((c) => !deletedIds.has(c.id));
};

const setLocalCoupons = (coupons: Coupon[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(coupons));
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');
    emitStoreDataChanged();
  } catch (err) {
    console.warn('Error saving coupons to localStorage:', err);
  }
};

export async function seedCouponsIfEmpty(): Promise<void> {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(SEEDED_FLAG_KEY) === 'true' || localStorage.getItem(LOCAL_STORAGE_KEY) !== null) {
      return;
    }
  }

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
      if (typeof window !== 'undefined') {
        localStorage.setItem(SEEDED_FLAG_KEY, 'true');
      }
    }
  } catch (error) {
    console.warn('Coupon seed fallback:', error);
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const deletedIds = getDeletedCouponIds();
  const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
  const isSeeded = typeof window !== 'undefined' ? localStorage.getItem(SEEDED_FLAG_KEY) === 'true' : false;

  if (saved !== null) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 0) {
        return [];
      }
    } catch (e) {}
  }

  try {
    if (!isSeeded && saved === null) {
      await seedCouponsIfEmpty();
    }
    const snap = await getDocs(collection(db, COUPONS_COLLECTION));
    if (!snap.empty) {
      const remoteCoupons = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Coupon))
        .filter((c) => !deletedIds.has(c.id));

      if (saved !== null) {
        const local = getLocalCoupons();
        if (local.length === 0 && isSeeded) {
          return [];
        }
        const localIds = new Set(local.map((c) => c.id));
        const combined = [...local];
        for (const rc of remoteCoupons) {
          if (!localIds.has(rc.id) && !deletedIds.has(rc.id)) {
            combined.push(rc);
          }
        }
        setLocalCoupons(combined);
        return combined;
      }

      setLocalCoupons(remoteCoupons);
      return remoteCoupons;
    } else {
      if (saved !== null) {
        return getLocalCoupons();
      }
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

  // 1. Unmark deleted if re-created
  unmarkCouponDeleted(id);

  // 2. Save to localStorage instantly
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

  // 3. Sync to Firestore
  try {
    const docRef = doc(db, COUPONS_COLLECTION, id);
    await setDoc(docRef, couponData, { merge: true });
  } catch (err) {
    console.warn('Firestore coupon save failed, saved locally:', err);
  }

  return id;
}

export async function deleteCoupon(id: string): Promise<void> {
  markCouponDeleted(id);

  const current = getLocalCoupons();
  const updatedList = current.filter((c) => c.id !== id);
  setLocalCoupons(updatedList);

  try {
    const docRef = doc(db, COUPONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore coupon delete failed, removed locally:', err);
  }
}

export async function deleteAllCoupons(): Promise<void> {
  const current = getLocalCoupons();
  for (const c of current) {
    markCouponDeleted(c.id);
  }
  setLocalCoupons([]);
  try {
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  } catch (e) {}
  emitStoreDataChanged();

  try {
    const snap = await getDocs(collection(db, COUPONS_COLLECTION));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('Firestore bulk delete coupon fallback:', err);
  }
}
