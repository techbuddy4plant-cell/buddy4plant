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

export function getLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function saveLocalReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('b4p_reviews_changed'));
      window.dispatchEvent(new Event('b4p_store_data_changed'));
    }
  } catch (err) {
    console.warn('Error saving reviews to localStorage:', err);
  }
}

export async function seedReviewsIfEmpty(): Promise<void> {
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
    }
  } catch (err) {
    console.warn('Reviews seed warning (using local store):', err);
  }
}

export async function getAllReviews(): Promise<Review[]> {
  const local = getLocalReviews();
  try {
    await seedReviewsIfEmpty();
    const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
    if (!snap.empty) {
      const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
      const map = new Map<string, Review>();
      local.forEach((r) => map.set(r.id, r));
      remote.forEach((r) => map.set(r.id, r));
      const merged = Array.from(map.values());
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        // ignore
      }
      return merged;
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
