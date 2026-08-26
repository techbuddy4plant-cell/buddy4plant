import React from 'react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';
import { ArrowRight, Flame } from 'lucide-react';

interface BestSellersSectionProps {
  products: Product[];
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({
  products,
  navigate,
  onQuickView,
}) => {
  const bestsellers = products.filter((p) => p.bestseller && p.active).slice(0, 4);

  if (bestsellers.length === 0) return null;

  return (
    <section className="py-16 bg-[#F5F2EB]/60 border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8B5E3C] uppercase tracking-[0.25em]">
              <Flame className="w-3.5 h-3.5 text-[#8B5E3C] fill-[#8B5E3C]" />
              Most Loved By Indian Plant Parents
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A] mt-1">
              Our Bestselling Greens
            </h2>
          </div>
          <button
            onClick={() => navigate('/plants?sortBy=bestseller')}
            className="mt-3 sm:mt-0 text-[11px] font-bold uppercase tracking-wider text-[#2D4A27] hover:text-[#1F341C] flex items-center gap-1.5 group"
          >
            Explore All Best Sellers &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              navigate={navigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
