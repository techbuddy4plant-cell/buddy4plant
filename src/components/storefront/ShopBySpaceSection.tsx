import React, { useMemo, useState } from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';

interface ShopBySpaceProps {
  navigate: (path: string) => void;
  products?: Product[];
  onQuickView?: (product: Product) => void;
}

/** Rooms, matched the same way as the /plants/location-... pages (location tag, or the product's "location" field). */
const SPACES = [
  { label: 'Living Room', slug: 'location-living-room', field: 'Living Room' },
  { label: 'Bedroom', slug: 'location-bedroom', field: 'Bedroom' },
  { label: 'Work Desk', slug: 'location-workspace', field: 'Office Desk' },
  { label: 'Balcony', slug: 'location-balcony', field: 'Balcony' },
];

const NON_PLANT = /pots|planter|plant-care|fertiliz|soil|pest|tools|watering|decor|gifting|growth/;

const inSpace = (p: Product, s: (typeof SPACES)[number]) =>
  (p.tags || []).some((t) => t.toLowerCase() === s.slug) ||
  (!(p.tags || []).some((t) => t.startsWith('location-')) && p.location === s.field);

/** Home page "Shop by Living Space": real products for each room, switched with tabs. */
export const ShopBySpaceSection: React.FC<ShopBySpaceProps> = ({ navigate, products = [], onQuickView }) => {
  const { homepageCMS } = useStoreSettings();

  const bySpace = useMemo(() => {
    const plants = products.filter((p) => p.active !== false && p.stock > 0 && !NON_PLANT.test(p.category) && p.images?.length);
    return SPACES.map((s) => ({
      ...s,
      items: plants
        .filter((p) => inSpace(p, s))
        .sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller) || Number(!!b.featured) - Number(!!a.featured)),
    })).filter((s) => s.items.length > 0);
  }, [products]);

  const [active, setActive] = useState(0);
  if (bySpace.length === 0) return null;
  const current = bySpace[Math.min(active, bySpace.length - 1)];

  return (
    <section className="py-16 sm:py-24 bg-transparent" aria-labelledby="shop-by-space-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 id="shop-by-space-title" className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#141414] tracking-tight">
            {homepageCMS.livingSpacesTitle || 'Shop by Living Space'}
          </h2>
          <p className="text-sm sm:text-base text-[#5A5A5A] mt-3 leading-relaxed">
            {homepageCMS.livingSpacesSubtitle || 'Plants picked for the light and space of each room.'}
          </p>
        </div>

        {/* Room tabs */}
        <div className="mt-8 flex justify-center">
          <div role="tablist" aria-label="Rooms" className="flex max-w-full gap-1.5 overflow-x-auto rounded-full bg-[#F1ECE2] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {bySpace.map((s, i) => (
              <button
                key={s.slug}
                role="tab"
                aria-selected={s.slug === current.slug}
                onClick={() => setActive(i)}
                className={`shrink-0 rounded-full px-4 sm:px-6 py-2.5 text-sm font-semibold transition-colors ${
                  s.slug === current.slug ? 'bg-[#13301B] text-white shadow-sm' : 'text-[#4A4A4A] hover:text-[#13301B]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div key={current.slug} className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-fadeIn">
          {current.items.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} navigate={navigate} onQuickView={onQuickView} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(`/plants/${current.slug}`)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#13301B] px-7 py-3 text-sm font-semibold text-[#13301B] transition-colors hover:bg-[#13301B] hover:text-white"
          >
            View all {current.label} plants
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
