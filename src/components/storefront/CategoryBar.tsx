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
    <section className="py-18 sm:py-24 bg-[#FDFCF9] border-b border-[#EAE8E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block">
              Curated Botanical Line
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] mt-2 tracking-tight">
              Shop by Botanical Family
            </h2>
          </div>
          <button
            onClick={() => navigate('/plants')}
            className="pill-btn-light self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 group"
          >
            Explore All ({activeCategories.length})
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Category Cards with Editorial Rounded Aesthetics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {activeCategories.slice(0, 10).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/plants/${cat.slug}`)}
              className="group relative bg-[#F7F6F2] p-5 rounded-3xl border border-[#E5E2D9] hover:border-[#1F3B22]/40 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3.5 border border-[#E0DDD3] group-hover:border-[#1F3B22] transition-colors bg-white shadow-xs">
                <PlantImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
              </div>
              <h3 className="font-editorial font-bold text-xs sm:text-sm text-[#141414] group-hover:text-[#1F3B22] transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] text-[#6E6E6E] mt-1 line-clamp-1 uppercase tracking-wider font-medium">
                {cat.subCategories?.slice(0, 2).join(' • ') || 'Curated species'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
