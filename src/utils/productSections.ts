import type { Product } from '../types';

/** Category slugs for each admin / storefront section (single source of truth). */
export const POT_CATEGORY_SLUGS = ['pots-planters', 'plastic-pots', 'ceramic-pots', 'hanging-planters', 'planter-stands', 'terracotta-pots', 'self-watering', 'metal-planters'];
export const CARE_CATEGORY_SLUGS = ['plant-care', 'fertilizers', 'potting-soil', 'pest-control', 'garden-tools', 'watering-tools', 'garden-decor', 'growth-boosters'];
export const GIFTING_CATEGORY_SLUGS = ['gifting', 'corporate-gifting', 'festive-gifting', 'green-gifting', 'combos'];

export type ProductSection = 'plants' | 'pots-planters' | 'plant-care' | 'gifting';

/** Main section of a product, decided by its category (not by words in its name). */
export function getProductSection(p: Pick<Product, 'category'>): ProductSection {
  const cat = (p.category || '').toLowerCase();
  if (POT_CATEGORY_SLUGS.includes(cat)) return 'pots-planters';
  if (CARE_CATEGORY_SLUGS.includes(cat)) return 'plant-care';
  if (GIFTING_CATEGORY_SLUGS.includes(cat)) return 'gifting';
  return 'plants';
}

/** Products shown in the Gifting section: gifting categories plus anything tagged for gifting. */
export function isGiftingProduct(p: Pick<Product, 'category' | 'tags'>): boolean {
  return getProductSection(p) === 'gifting' || (p.tags || []).some((t) => GIFTING_CATEGORY_SLUGS.includes(t));
}
