import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const WISHLIST_COLLECTION = 'wishlists';

export async function getUserWishlist(userId: string): Promise<string[]> {
  try {
    const docRef = doc(db, WISHLIST_COLLECTION, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().productIds || [];
    }
  } catch (err) {
    console.warn('Error reading user wishlist:', err);
  }
  return [];
}

export async function saveUserWishlist(userId: string, productIds: string[]): Promise<void> {
  try {
    const docRef = doc(db, WISHLIST_COLLECTION, userId);
    await setDoc(docRef, { productIds, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Error saving user wishlist:', err);
  }
}
