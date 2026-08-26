import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/initialSettings';

const COUPONS_COLLECTION = 'coupons';

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
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
    }
    return INITIAL_COUPONS;
  } catch (error) {
    console.warn('Fallback local coupons:', error);
    return INITIAL_COUPONS;
  }
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

  try {
    const docRef = doc(db, COUPONS_COLLECTION, id);
    await setDoc(docRef, couponData, { merge: true });
    return id;
  } catch (err) {
    console.error('Error saving coupon:', err);
    throw err;
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  try {
    const docRef = doc(db, COUPONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting coupon:', err);
    throw err;
  }
}
