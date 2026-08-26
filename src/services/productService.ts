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

// Check and seed initial products if collection is empty
export async function seedProductsIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(query(colRef, limit(1)));
    if (snap.empty) {
      console.log('Seeding initial plant catalogue to Firestore...');
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
      console.log('Catalogue seeded successfully!');
    }
  } catch (error) {
    console.warn('Firestore seeding check fallback (offline/permission fallback):', error);
  }
}

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

export async function getAllProducts(): Promise<Product[]> {
  try {
    await seedProductsIfEmpty();
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (!snap.empty) {
      return snap.docs.map((d) => sanitizeProduct({ id: d.id, ...d.data() } as Product));
    }
    return INITIAL_PRODUCTS.map(sanitizeProduct);
  } catch (error) {
    console.warn('Falling back to local catalog:', error);
    return INITIAL_PRODUCTS.map(sanitizeProduct);
  }
}

export async function getProducts(category?: string): Promise<Product[]> {
  const all = await getAllProducts();
  if (category && category !== 'all') {
    return all.filter((p) => p.category === category);
  }
  return all;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(colRef, where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return sanitizeProduct({ id: d.id, ...d.data() } as Product);
    }
    const found = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return found ? sanitizeProduct(found) : null;
  } catch (error) {
    console.warn('Error fetching product by slug:', error);
    const found = INITIAL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    return found ? sanitizeProduct(found) : null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return sanitizeProduct({ id: snap.id, ...snap.data() } as Product);
    }
    const found = INITIAL_PRODUCTS.find((p) => p.id === id);
    return found ? sanitizeProduct(found) : null;
  } catch (error) {
    console.warn('Error fetching product by id:', error);
    const found = INITIAL_PRODUCTS.find((p) => p.id === id);
    return found ? sanitizeProduct(found) : null;
  }
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

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(docRef, productData, { merge: true });
    return id;
  } catch (err) {
    console.error('Error saving product to Firestore:', err);
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting product from Firestore:', err);
    throw err;
  }
}

export async function updateProductStock(id: string, newStock: number): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
      stock: Math.max(0, newStock),
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Error updating product stock:', err);
  }
}

export async function deductProductStock(productId: string, quantity: number): Promise<void> {
  try {
    const prod = await getProductById(productId);
    if (prod) {
      const remaining = Math.max(0, prod.stock - quantity);
      await updateProductStock(productId, remaining);
    }
  } catch (err) {
    console.error('Error deducting product stock:', err);
  }
}
