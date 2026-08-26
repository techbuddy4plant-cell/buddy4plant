import React from 'react';
import { Category } from '../../types';
import { ArrowRight } from 'lucide-react';
import { PlantImage } from '../../utils/imageFallback';

interface CategoryBarProps {
  categories: Category[];
  navigate: (path: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, navigate }) => {
  const activeCategories = categories.filter((c) => c.active);

  return (
    <section className="py-14 bg-[#FDFCF9] border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold text-[#2D4A27] uppercase tracking-[0.25em] block">
              Curated Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A1A1A] mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => navigate('/plants')}
            className="text-[11px] font-bold uppercase tracking-wider text-[#2D4A27] hover:text-[#1F341C] flex items-center gap-1 group"
          >
            View All ({activeCategories.length})
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Category Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {activeCategories.slice(0, 10).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/plants/${cat.slug}`)}
              className="group relative bg-[#F5F2EB] p-4 border border-[#E5E2D9] hover:border-[#2D4A27]/50 hover:shadow-xs transition-all cursor-pointer flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border border-[#E5E2D9] group-hover:border-[#2D4A27] transition-colors bg-white">
                <PlantImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-serif font-bold text-xs sm:text-sm text-[#1A1A1A] group-hover:text-[#2D4A27] transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] text-[#7A7A7A] mt-0.5 line-clamp-1 uppercase tracking-wider">
                {cat.subCategories?.slice(0, 2).join(' • ') || 'Explore collection'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
