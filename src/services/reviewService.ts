import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Review } from '../types';
import { INITIAL_REVIEWS } from '../data/initialSettings';

const REVIEWS_COLLECTION = 'reviews';

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
    console.warn('Reviews seed error:', err);
  }
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    await seedReviewsIfEmpty();
    const colRef = collection(db, REVIEWS_COLLECTION);
    const q = query(colRef, where('productId', '==', productId), where('approved', '==', true));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
    }
    return INITIAL_REVIEWS.filter((r) => r.productId === productId);
  } catch (err) {
    return INITIAL_REVIEWS.filter((r) => r.productId === productId);
  }
}

export async function getAllReviews(): Promise<Review[]> {
  try {
    await seedReviewsIfEmpty();
    const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
    }
    return INITIAL_REVIEWS;
  } catch (err) {
    return INITIAL_REVIEWS;
  }
}

export async function getRecentReviews(): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews.filter((r) => r.approved).slice(0, 6);
}

export async function submitReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'> & { approved?: boolean }): Promise<Review> {
  const id = `rev-${Date.now()}`;
  const newReview: Review = {
    ...reviewData,
    id,
    approved: reviewData.approved ?? true, // Auto-approve or queue for moderation
    createdAt: Date.now(),
  };

  try {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    await setDoc(docRef, newReview);
  } catch (err) {
    console.warn('Error saving review to Firestore:', err);
  }
  return newReview;
}

export const addReview = submitReview;

export async function updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(docRef, updates);
  } catch (err) {
    console.error('Error updating review:', err);
    throw err;
  }
}

export async function updateReviewStatus(reviewId: string, approved: boolean): Promise<void> {
  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(docRef, { approved });
  } catch (err) {
    console.error('Error updating review status:', err);
    throw err;
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const docRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting review:', err);
    throw err;
  }
}
