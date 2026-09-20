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
const DELETED_IDS_KEY = 'b4p_deleted_category_ids';
const SEEDED_FLAG_KEY = 'b4p_categories_seeded';

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'categories' } }));
  }
};

const getDeletedCategoryIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

const markCategoryDeleted = (id: string) => {
  const set = getDeletedCategoryIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

const unmarkCategoryDeleted = (id: string) => {
  const set = getDeletedCategoryIds();
  set.delete(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

const getLocalCategories = (): Category[] => {
  const deletedIds = getDeletedCategoryIds();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => c && c.id && !deletedIds.has(c.id));
      }
    }
  } catch (err) {
    console.warn('Error reading categories from localStorage:', err);
  }

  const isSeeded = typeof window !== 'undefined' ? localStorage.getItem(SEEDED_FLAG_KEY) : null;
  if (isSeeded === 'true') {
    return [];
  }

  return INITIAL_CATEGORIES.filter((c) => !deletedIds.has(c.id));
};

const setLocalCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');
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
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(SEEDED_FLAG_KEY) === 'true' || localStorage.getItem(LOCAL_STORAGE_KEY) !== null) {
      return;
    }
  }

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
      if (typeof window !== 'undefined') {
        localStorage.setItem(SEEDED_FLAG_KEY, 'true');
      }
    }
  } catch (error) {
    console.warn('Category seeding error/fallback:', error);
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const deletedIds = getDeletedCategoryIds();
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
      await seedCategoriesIfEmpty();
    }
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (!snap.empty) {
      const cats = snap.docs
        .map((d) => sanitizeCategory({ id: d.id, ...d.data() } as Category))
        .filter((c) => !deletedIds.has(c.id));
      const sorted = cats.sort((a, b) => (a.order || 0) - (b.order || 0));

      if (saved !== null) {
        const local = getLocalCategories();
        if (local.length === 0 && isSeeded) {
          return [];
        }
        const localIds = new Set(local.map((c) => c.id));
        const combined = [...local];
        for (const rc of sorted) {
          if (!localIds.has(rc.id) && !deletedIds.has(rc.id)) {
            combined.push(rc);
          }
        }
        setLocalCategories(combined);
        return combined;
      }

      setLocalCategories(sorted);
      return sorted;
    } else {
      if (saved !== null) {
        return getLocalCategories();
      }
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

  // 1. Unmark deleted if re-created
  unmarkCategoryDeleted(id);

  // 2. Update localStorage instantly
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

  // 3. Sync to Firestore in background
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await setDoc(docRef, catData, { merge: true });
  } catch (err) {
    console.warn('Firestore category save failed, saved locally:', err);
  }

  return id;
}

export async function deleteCategory(id: string): Promise<void> {
  markCategoryDeleted(id);

  const current = getLocalCategories();
  const updatedList = current.filter((c) => c.id !== id);
  setLocalCategories(updatedList);

  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore category delete failed, removed locally:', err);
  }
}

export async function deleteAllCategories(): Promise<void> {
  const current = getLocalCategories();
  for (const c of current) {
    markCategoryDeleted(c.id);
  }
  setLocalCategories([]);
  try {
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  } catch (e) {}
  emitStoreDataChanged();

  try {
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('Firestore deleteAllCategories warning:', err);
  }
}
