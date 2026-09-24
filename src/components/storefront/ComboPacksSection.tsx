import React from 'react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';
import { Gift, ArrowRight } from 'lucide-react';

interface ComboPacksSectionProps {
  products: Product[];
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const ComboPacksSection: React.FC<ComboPacksSectionProps> = ({
  products,
  navigate,
  onQuickView,
}) => {
  const combos = products.filter((p) => {
    if (p.active === false) return false;
    const cat = (p.category || '').toLowerCase();
    const tags = (p.tags || []).map((t) => t.toLowerCase());
    return (
      cat.includes('combo') ||
      cat.includes('gift') ||
      tags.includes('combo pack') ||
      tags.includes('combo') ||
      tags.includes('bundle')
    );
  }).slice(0, 3);

  if (combos.length === 0) return null;

  return (
    <section className="py-16 bg-[#1A1A1A] text-[#FDFCF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#A3B899] uppercase tracking-[0.25em]">
              <Gift className="w-3.5 h-3.5" />
              Gift Boxes &amp; Turnkey Value Duos
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#FDFCF9] mt-1">
              Curated Plant Combos
            </h2>
          </div>
          <button
            onClick={() => navigate('/plants/combos')}
            className="mt-3 sm:mt-0 text-[11px] font-bold uppercase tracking-wider text-[#A3B899] hover:text-[#FDFCF9] flex items-center gap-1.5"
          >
            View All Combos &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {combos.map((product) => (
            <div key={product.id} className="text-[#1A1A1A]">
              <ProductCard
                product={product}
                navigate={navigate}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
