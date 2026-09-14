import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialCategories';

const CATEGORIES_COLLECTION = 'categories';
const LOCAL_STORAGE_KEY = 'b4p_categories_db';

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'categories' } }));
  }
};

const getLocalCategories = (): Category[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading categories from localStorage:', err);
  }
  return INITIAL_CATEGORIES;
};

const setLocalCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
    emitStoreDataChanged();
  } catch (err) {
    console.warn('Error saving categories to localStorage:', err);
  }
};

const sanitizeCategory = (cat: Category): Category => {
  let img = cat.image || '';
  if (img.includes('1583324113626') || img.includes('70df0f4deaab')) {
    img = 'https://images.unsplash.com/photo-1517196084881-5e43a9c7d0af?auto=format&fit=crop&w=600&q=80';
  }
  return {
    ...cat,
    image: img || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
  };
};

export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const cat of INITIAL_CATEGORIES) {
        const docRef = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(docRef, cat);
      }
      await batch.commit();
    }
  } catch (error) {
    console.warn('Category seeding error/fallback:', error);
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    await seedCategoriesIfEmpty();
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (!snap.empty) {
      const cats = snap.docs.map((d) => sanitizeCategory({ id: d.id, ...d.data() } as Category));
      const sorted = cats.sort((a, b) => (a.order || 0) - (b.order || 0));
      setLocalCategories(sorted);
      return sorted;
    }
  } catch (error) {
    console.warn('Falling back to local categories:', error);
  }
  return getLocalCategories().map(sanitizeCategory);
}

export const getCategories = getAllCategories;

export async function saveCategory(category: Partial<Category> & { name: string }): Promise<string> {
  const id = category.id || category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = category.slug || id;

  const catData: Category = {
    id,
    name: category.name,
    slug,
    description: category.description || '',
    image: category.image || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
    featured: Boolean(category.featured),
    order: category.order !== undefined ? Number(category.order) : 1,
    subCategories: category.subCategories || [],
    active: category.active !== undefined ? category.active : true,
  };

  // 1. Update localStorage instantly
  const current = getLocalCategories();
  const existingIdx = current.findIndex((c) => c.id === id);
  let updatedList: Category[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = catData;
  } else {
    updatedList = [...current, catData];
  }
  setLocalCategories(updatedList);

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await setDoc(docRef, catData, { merge: true });
  } catch (err) {
    console.warn('Firestore category save failed, saved locally:', err);
  }

  return id;
}

export async function deleteCategory(id: string): Promise<void> {
  // 1. Update localStorage instantly
  const current = getLocalCategories();
  const updatedList = current.filter((c) => c.id !== id);
  setLocalCategories(updatedList);

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore category delete failed, removed locally:', err);
  }
}
