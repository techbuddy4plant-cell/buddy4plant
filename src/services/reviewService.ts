import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Review } from '../types';
import { INITIAL_REVIEWS } from '../data/initialSettings';

const REVIEWS_COLLECTION = 'reviews';
const REVIEWS_STORAGE_KEY = 'b4p_customer_reviews';
const DELETED_IDS_KEY = 'b4p_deleted_review_ids';
const SEEDED_FLAG_KEY = 'b4p_reviews_seeded';

const getDeletedReviewIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

const markReviewDeleted = (id: string) => {
  const set = getDeletedReviewIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

const unmarkReviewDeleted = (id: string) => {
  const set = getDeletedReviewIds();
  set.delete(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

export function getLocalReviews(): Review[] {
  const deletedIds = getDeletedReviewIds();
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((r) => r && r.id && !deletedIds.has(r.id));
      }
    }
  } catch {
    // ignore
  }

  const isSeeded = typeof window !== 'undefined' ? localStorage.getItem(SEEDED_FLAG_KEY) : null;
  if (isSeeded === 'true') {
    return [];
  }

  return INITIAL_REVIEWS.filter((r) => !deletedIds.has(r.id));
}

export function saveLocalReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('b4p_reviews_changed'));
      window.dispatchEvent(new Event('b4p_store_data_changed'));
    }
  } catch (err) {
    console.warn('Error saving reviews to localStorage:', err);
  }
}

export async function seedReviewsIfEmpty(): Promise<void> {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(SEEDED_FLAG_KEY) === 'true' || localStorage.getItem(REVIEWS_STORAGE_KEY) !== null) {
      return;
    }
  }

  try {
    const colRef = collection(db, REVIEWS_COLLECTION);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const rev of INITIAL_REVIEWS) {
        const docRef = doc(db, REVIEWS_COLLECTION, rev.id);
        batch.set(docRef, rev);
      }
      await batch.commit();
      if (typeof window !== 'undefined') {
        localStorage.setItem(SEEDED_FLAG_KEY, 'true');
      }
    }
  } catch (err) {
    console.warn('Reviews seed warning (using local store):', err);
  }
}

export async function getAllReviews(): Promise<Review[]> {
  const deletedIds = getDeletedReviewIds();
  const local = getLocalReviews();
  const saved = typeof window !== 'undefined' ? localStorage.getItem(REVIEWS_STORAGE_KEY) : null;
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
      await seedReviewsIfEmpty();
    }
    const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
    if (!snap.empty) {
      const remote = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Review))
        .filter((r) => !deletedIds.has(r.id));

      if (saved !== null) {
        if (local.length === 0 && isSeeded) {
          return [];
        }
        const localIds = new Set(local.map((r) => r.id));
        const combined = [...local];
        for (const rr of remote) {
          if (!localIds.has(rr.id) && !deletedIds.has(rr.id)) {
            combined.push(rr);
          }
        }
        saveLocalReviews(combined);
        return combined;
      }

      saveLocalReviews(remote);
      return remote;
    }
    return local;
  } catch (err) {
    return local;
  }
}

export async function getProductReviews(
  productId: string,
  productSlug?: string,
  productName?: string
): Promise<Review[]> {
  const allReviews = await getAllReviews();

  const normId = (productId || '').toLowerCase().trim();
  const normSlug = (productSlug || '').toLowerCase().trim();
  const normName = (productName || '').toLowerCase().trim();
  const slugifiedName = normName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return allReviews.filter((r) => {
    if (!r.approved) return false;
    const rProdId = (r.productId || '').toLowerCase().trim();
    const rProdName = (r.productName || '').toLowerCase().trim();
    const slugifiedRName = rProdName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Match exact ID or slug
    if (rProdId && normId && rProdId === normId) return true;
    if (rProdId && normSlug && rProdId === normSlug) return true;
    if (normSlug && rProdId && (normSlug.includes(rProdId) || rProdId.includes(normSlug))) return true;

    // Match product name
    if (normName && rProdName && (normName === rProdName || normName.includes(rProdName) || rProdName.includes(normName))) return true;

    // Match slugified names
    if (slugifiedName && (rProdId === slugifiedName || slugifiedRName === slugifiedName)) return true;
    if (normId && slugifiedRName && (normId === slugifiedRName || normId.includes(slugifiedRName))) return true;

    return false;
  });
}

export async function getRecentReviews(): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews.filter((r) => r.approved).slice(0, 6);
}

export async function submitReview(
  reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'> & { approved?: boolean }
): Promise<Review> {
  const id = `rev-${Date.now()}`;
  const newReview: Review = {
    ...reviewData,
    id,
    approved: reviewData.approved !== undefined ? reviewData.approved : true,
    createdAt: Date.now(),
  };

  // 1. Immediately cache locally
  const current = getLocalReviews();
  const updated = [newReview, ...current.filter((r) => r.id !== id)];
  saveLocalReviews(updated);

  // 2. Persist to Firestore asynchronously
  try {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    await setDoc(docRef, newReview);
  } catch (err) {
    console.warn('Note: Saved review to local memory; Firestore sync bypassed:', err);
  }

  // 3. Dispatch live update events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('b4p_reviews_changed', { detail: newReview }));
    window.dispatchEvent(new Event('b4p_store_data_changed'));
  }

  return newReview;
}

export const addReview = submitReview;

export async function updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
  const current = getLocalReviews();
  const updated = current.map((r) => (r.id === reviewId ? { ...r, ...updates } : r));
  saveLocalReviews(updated);

  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(docRef, updates);
  } catch (err) {
    console.warn('Firestore update failed, updated locally:', err);
  }
}

export async function updateReviewStatus(reviewId: string, approved: boolean): Promise<void> {
  const current = getLocalReviews();
  const updated = current.map((r) => (r.id === reviewId ? { ...r, approved } : r));
  saveLocalReviews(updated);

  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(docRef, { approved });
  } catch (err) {
    console.warn('Firestore update status failed, updated locally:', err);
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  markReviewDeleted(reviewId);
  const current = getLocalReviews();
  const updated = current.filter((r) => r.id !== reviewId);
  saveLocalReviews(updated);

  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete failed, updated locally:', err);
  }
}

export async function deleteAllReviews(): Promise<void> {
  const current = getLocalReviews();
  for (const r of current) {
    markReviewDeleted(r.id);
  }
  saveLocalReviews([]);
  try {
    const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('Firestore bulk delete review fallback:', err);
  }
}
