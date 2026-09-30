import { Product } from '../types';
import { PLANT_CATALOGUE } from './plantCatalogue';
import { POT_CATALOGUE } from './potCatalogue';
import { CARE_CATALOGUE } from './careCatalogue';
import { CORPORATE_HAMPERS, GIFT_TAGS } from './giftingCatalogue';

/** Everything the store sells by default: plants + pots & planters + plant care. */
export const STORE_CATALOGUE: Product[] = [...PLANT_CATALOGUE, ...POT_CATALOGUE, ...CARE_CATALOGUE, ...CORPORATE_HAMPERS].map((p) =>
  GIFT_TAGS[p.id] ? { ...p, tags: Array.from(new Set([...(p.tags || []), ...GIFT_TAGS[p.id], 'gifting'])) } : p
);

/** Products a brand-new store starts with. */
export const INITIAL_PRODUCTS: Product[] = STORE_CATALOGUE;

/**
 * Old sample/demo products that are removed from existing stores automatically.
 * Any product whose id starts with "cat-" (the earlier test catalogue) is removed too.
 */
export const LEGACY_DEMO_PRODUCT_IDS: string[] = ['vermicompost-best-topsoil-enricher', 'peace-lily-deluxe', 'snake-plant-laurentii', 'money-plant-golden', 'zz-plant-emerald', 'monstera-deliciosa-swiss', 'areca-palm-purifier', 'jade-plant-crassula', 'calathea-medallion-peacock', 'anthurium-red-flame', 'boston-fern-cascade', 'trio-purifier-combo', 'ceramic-artisan-planter-set', 'organic-neem-care-kit', 'organic-plant-food-elixir', 'pure-cold-pressed-neem-oil', 'bio-active-potting-soil-mix', 'aglaonema-pink-princess', 'balcony-bloomer-duo', 'low-light-sanctuary-set', 'beginner-zero-stress-pack'];
