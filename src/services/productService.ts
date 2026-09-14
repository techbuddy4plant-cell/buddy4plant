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

const emitStoreDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('b4p_store_data_changed', { detail: { type: 'products' } }));
  }
};

const getLocalProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading products from localStorage:', err);
  }
  return INITIAL_PRODUCTS;
};

const setLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
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
    }
  } catch (error) {
    console.warn('Firestore seeding check fallback (offline/permission fallback):', error);
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    await seedProductsIfEmpty();
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (!snap.empty) {
      const remoteProducts = snap.docs.map((d) => sanitizeProduct({ id: d.id, ...d.data() } as Product));
      setLocalProducts(remoteProducts);
      return remoteProducts;
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
  const found = all.find((p) => p.slug === slug || p.id === slug);
  return found ? sanitizeProduct(found) : null;
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
    plantSize: (product.plantSize as any) || 'Medium (9-15")',
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

  // 1. Update localStorage instantly
  const current = getLocalProducts();
  const existingIdx = current.findIndex((p) => p.id === id);
  let updatedList: Product[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = productData;
  } else {
    updatedList = [productData, ...current];
  }
  setLocalProducts(updatedList);

  // 2. Sync to Firestore in background
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(docRef, productData, { merge: true });
  } catch (err) {
    console.warn('Firestore sync failed, saved locally:', err);
  }

  return id;
}

export async function deleteProduct(id: string): Promise<void> {
  // 1. Update localStorage instantly
  const current = getLocalProducts();
  const updatedList = current.filter((p) => p.id !== id);
  setLocalProducts(updatedList);

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete failed, removed locally:', err);
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
