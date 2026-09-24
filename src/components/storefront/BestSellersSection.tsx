import React from 'react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

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
  const activeProducts = products.filter((p) => p.active !== false);
  const explicitBestsellers = activeProducts.filter((p) => p.bestseller);
  const bestsellers = explicitBestsellers.length > 0
    ? explicitBestsellers.slice(0, 4)
    : activeProducts.slice(0, 4);

  if (bestsellers.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-[#F8F7F3] border-b border-[#E8E5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em]">
              <Sparkles className="w-3.5 h-3.5 text-[#1F3B22]" />
              Signature Botanical Cultivars
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] mt-2 tracking-tight">
              Our Bestselling Living Greens
            </h2>
          </div>
          <button
            onClick={() => navigate('/plants?sortBy=bestseller')}
            className="pill-btn-light self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 group"
          >
            Explore All Best Sellers
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
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
