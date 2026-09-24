import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const LOCAL_STORAGE_KEY = 'b4p_products_db';
const DELETED_IDS_KEY = 'b4p_deleted_product_ids';
const SEEDED_FLAG_KEY = 'b4p_products_seeded';

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'products' } }));
  }
};

const getDeletedProductIds = (): Set<string> => {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

const markProductDeleted = (id: string) => {
  const set = getDeletedProductIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

const unmarkProductDeleted = (id: string) => {
  const set = getDeletedProductIds();
  set.delete(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
};

const getLocalProducts = (): Product[] => {
  const deletedIds = getDeletedProductIds();
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      // Valid array even if empty (length 0 means user deleted all items)
      if (Array.isArray(parsed)) {
        return parsed.filter((p) => p && p.id && !deletedIds.has(p.id));
      }
    }
  } catch (err) {
    console.warn('Error reading products from localStorage:', err);
  }

  // If already seeded/initialized before, don't resurrect demo items
  const isSeeded = typeof window !== 'undefined' ? localStorage.getItem(SEEDED_FLAG_KEY) : null;
  if (isSeeded === 'true') {
    return [];
  }

  return INITIAL_PRODUCTS.filter((p) => !deletedIds.has(p.id));
};

const setLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');
    emitStoreDataChanged();
  } catch (err) {
    console.warn('Error saving products to localStorage:', err);
  }
};

const sanitizeProduct = (p: Product): Product => {
  const sanitizedImages = (p.images || []).map((img) =>
    img.includes('1583324113626') || img.includes('70df0f4deaab')
      ? 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
      : img
  );
  return {
    ...p,
    images: sanitizedImages.length > 0 ? sanitizedImages : ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80']
  };
};

export async function seedProductsIfEmpty(): Promise<void> {
  // If products have already been seeded once, NEVER re-seed!
  if (typeof window !== 'undefined') {
    if (localStorage.getItem(SEEDED_FLAG_KEY) === 'true' || localStorage.getItem(LOCAL_STORAGE_KEY) !== null) {
      return;
    }
  }

  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const prod of INITIAL_PRODUCTS) {
        const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
        batch.set(docRef, {
          ...prod,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      await batch.commit();
      if (typeof window !== 'undefined') {
        localStorage.setItem(SEEDED_FLAG_KEY, 'true');
      }
    }
  } catch (error) {
    console.warn('Firestore seeding check fallback (offline/permission fallback):', error);
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const deletedIds = getDeletedProductIds();
  const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
  const isSeeded = typeof window !== 'undefined' ? localStorage.getItem(SEEDED_FLAG_KEY) === 'true' : false;

  // If local store explicitly exists and is empty, user deliberately deleted all products!
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
      await seedProductsIfEmpty();
    }
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (!snap.empty) {
      const remoteProducts = snap.docs
        .map((d) => sanitizeProduct({ id: d.id, ...d.data() } as Product))
        .filter((p) => !deletedIds.has(p.id));

      // If user locally has saved state, keep local items as authority
      if (saved !== null) {
        const local = getLocalProducts();
        if (local.length === 0 && isSeeded) {
          return [];
        }
        // Merge without resurrected deleted items and deduplicate by both ID and slug
        const localIds = new Set(local.map((p) => p.id));
        const localSlugs = new Set(local.map((p) => (p.slug || '').toLowerCase()));
        const combined = [...local];
        for (const rp of remoteProducts) {
          if (!localIds.has(rp.id) && !localSlugs.has((rp.slug || '').toLowerCase()) && !deletedIds.has(rp.id)) {
            combined.push(rp);
          }
        }
        // Only update local store if new items were actually added from remote
        if (combined.length !== local.length) {
          setLocalProducts(combined);
        }
        return combined;
      }

      setLocalProducts(remoteProducts);
      return remoteProducts;
    } else {
      if (saved !== null) {
        return getLocalProducts();
      }
    }
  } catch (error) {
    console.warn('Using local cache for products:', error);
  }
  return getLocalProducts().map(sanitizeProduct);
}

export async function getProducts(category?: string): Promise<Product[]> {
  const all = await getAllProducts();
  if (category && category !== 'all') {
    return all.filter((p) => p.category === category);
  }
  return all;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getAllProducts();
  const normalized = (slug || '').toLowerCase().trim();
  const matches = all.filter((p) => 
    (p.slug && p.slug.toLowerCase().trim() === normalized) || 
    (p.id && p.id.toLowerCase().trim() === normalized) ||
    (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === normalized)
  );
  if (!matches.length) return null;
  // Sort by updatedAt descending so newly saved variants take precedence
  matches.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return sanitizeProduct(matches[0]);
}

export async function getProductById(id: string): Promise<Product | null> {
  const all = await getAllProducts();
  const found = all.find((p) => p.id === id);
  return found ? sanitizeProduct(found) : null;
}

export async function saveProduct(product: Partial<Product> & { name: string; price: number }): Promise<string> {
  const id = product.id || product.slug || `prod-${Date.now()}`;
  const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const productData: Product = {
    id,
    name: product.name,
    slug,
    shortDescription: product.shortDescription || '',
    description: product.description || '',
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    stock: product.stock !== undefined ? Number(product.stock) : 10,
    sku: product.sku || `SKU-${Date.now().toString().slice(-6)}`,
    category: product.category || 'indoor-plants',
    subCategory: product.subCategory || '',
    images: product.images && product.images.length > 0 ? product.images : [
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'
    ],
    rating: product.rating || 5.0,
    reviewCount: product.reviewCount || 0,
    plantType: product.plantType || 'Indoor Plants',
    plantSize: product.plantSize || (product.weightVolume || 'Medium (9-15")'),
    availableSizes: product.availableSizes || [],
    weightVolume: product.weightVolume || '',
    weightOptions: product.weightOptions || [],
    variants: product.variants || [],
    lightRequirement: (product.lightRequirement as any) || 'Bright Indirect Light',
    wateringFrequency: (product.wateringFrequency as any) || 'Once a week',
    maintenanceLevel: (product.maintenanceLevel as any) || 'Easy',
    location: (product.location as any) || 'Living Room',
    indoorOutdoor: product.indoorOutdoor || 'Indoor',
    petFriendly: Boolean(product.petFriendly),
    featured: Boolean(product.featured),
    bestseller: Boolean(product.bestseller),
    newArrival: Boolean(product.newArrival),
    active: product.active !== undefined ? product.active : true,
    tags: product.tags || [],
    careInstructions: product.careInstructions || {
      light: 'Bright indirect daylight',
      water: 'Water when topsoil is dry',
      temperature: '18°C – 32°C',
      fertilizer: 'Organic fertilizer monthly',
      tips: 'Wipe leaves periodically'
    },
    updatedAt: Date.now(),
    createdAt: product.createdAt || Date.now(),
  };

  // 1. Unmark from deleted IDs if re-created
  unmarkProductDeleted(id);

  // 2. Update localStorage instantly matching by ID OR slug
  const current = getLocalProducts();
  const existingIdx = current.findIndex((p) => p.id === id || (p.slug && p.slug.toLowerCase() === slug.toLowerCase()));
  let updatedList: Product[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = productData;
  } else {
    updatedList = [productData, ...current];
  }
  setLocalProducts(updatedList);

  // 3. Sync to Firestore in background safely (strip undefined values so setDoc never throws)
  try {
    const cleanData = JSON.parse(JSON.stringify(productData, (_k, v) => (v === undefined ? null : v)));
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    console.warn('Firestore sync failed, saved locally:', err);
  }

  return id;
}

export async function deleteProduct(id: string): Promise<void> {
  // 1. Mark in persistent deleted set so remote Firestore cannot resurrect it
  markProductDeleted(id);

  // 2. Update localStorage instantly
  const current = getLocalProducts();
  const updatedList = current.filter((p) => p.id !== id);
  setLocalProducts(updatedList);

  // 3. Sync to Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete failed, removed locally:', err);
  }
}

export async function deleteAllProducts(): Promise<void> {
  const current = getLocalProducts();
  for (const p of current) {
    markProductDeleted(p.id);
  }
  setLocalProducts([]);
  try {
    localStorage.setItem(SEEDED_FLAG_KEY, 'true');
  } catch (e) {}
  emitStoreDataChanged();

  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('Firestore bulk delete fallback:', err);
  }
}

export async function updateProductStock(id: string, newStock: number): Promise<void> {
  const current = getLocalProducts();
  const prod = current.find((p) => p.id === id);
  if (prod) {
    prod.stock = Math.max(0, newStock);
    prod.updatedAt = Date.now();
    setLocalProducts(current);
  }

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
      stock: Math.max(0, newStock),
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Error updating product stock in Firestore:', err);
  }
}

export async function deductProductStock(productId: string, quantity: number): Promise<void> {
  const current = getLocalProducts();
  const prod = current.find((p) => p.id === productId);
  if (prod) {
    prod.stock = Math.max(0, prod.stock - quantity);
    prod.updatedAt = Date.now();
    setLocalProducts(current);
  }

  try {
    const prodRef = doc(db, PRODUCTS_COLLECTION, productId);
    const snap = await getDoc(prodRef);
    if (snap.exists()) {
      const data = snap.data() as Product;
      await updateDoc(prodRef, {
        stock: Math.max(0, (data.stock || 0) - quantity),
        updatedAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('Error deducting stock in Firestore:', err);
  }
}
