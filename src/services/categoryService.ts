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

export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      console.log('Seeding initial categories to Firestore...');
      const batch = writeBatch(db);
      for (const cat of INITIAL_CATEGORIES) {
        const docRef = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(docRef, cat);
      }
      await batch.commit();
      console.log('Categories seeded successfully!');
    }
  } catch (error) {
    console.warn('Category seeding error/fallback:', error);
  }
}

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

export async function getAllCategories(): Promise<Category[]> {
  try {
    await seedCategoriesIfEmpty();
    const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    if (!snap.empty) {
      const cats = snap.docs.map((d) => sanitizeCategory({ id: d.id, ...d.data() } as Category));
      return cats.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return INITIAL_CATEGORIES.map(sanitizeCategory);
  } catch (error) {
    console.warn('Falling back to local categories:', error);
    return INITIAL_CATEGORIES.map(sanitizeCategory);
  }
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

  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await setDoc(docRef, catData, { merge: true });
    return id;
  } catch (err) {
    console.error('Error saving category to Firestore:', err);
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting category from Firestore:', err);
    throw err;
  }
}
