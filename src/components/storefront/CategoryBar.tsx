import React from 'react';
import { Category, Product } from '../../types';

interface CategoryBarProps {
  categories: Category[];
  products?: Product[];
  navigate: (path: string) => void;
}

/**
 * Home page "Our Categories": illustrated round icons on the dark green band.
 * Each circle is linked to a collection (by slug), so switching that collection off in
 * Admin > Collections hides its circle.
 */
const HOME_CATEGORIES: { slug: string; label: string; path: string; icon: string }[] = [
  { slug: 'indoor-plants', label: 'Plants', path: '/plants', icon: '/categories/cat-plants.png' },
  { slug: 'pots-planters', label: 'Pots', path: '/plants/pots-planters', icon: '/categories/cat-pots.png' },
  { slug: 'potting-soil', label: 'Soils', path: '/plants/potting-soil', icon: '/categories/cat-soils.png' },
  { slug: 'fertilizers', label: 'Fertilisers', path: '/plants/fertilizers', icon: '/categories/cat-fertilisers.png' },
  { slug: 'garden-tools', label: 'Garden Tools', path: '/plants/garden-tools', icon: '/categories/cat-garden-tools.png' },
  { slug: 'pest-control', label: 'Pest Control Solutions', path: '/plants/pest-control', icon: '/categories/cat-pest-control.png' },
  { slug: 'garden-decor', label: 'Gardening Decor', path: '/plants/garden-decor', icon: '/categories/cat-garden-decor.png' },
  { slug: 'green-gifting', label: 'Gifting', path: '/gifting', icon: '/categories/cat-gifting.png' },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, navigate }) => {
  const bySlug = new Map<string, Category>(categories.map((c) => [c.slug, c] as [string, Category]));
  const tiles = HOME_CATEGORIES.filter((t) => bySlug.get(t.slug)?.active !== false);

  return (
    <section
      className="b4p-fixed-theme relative overflow-hidden bg-[#0F3521] py-12 sm:py-16"
      aria-labelledby="home-categories-title"
    >
      {/* corner leaves */}
      <img src="/categories/leaves-top-right.png" alt="" aria-hidden="true" className="pointer-events-none absolute right-0 top-0 w-20 sm:w-28 lg:w-36 select-none" />
      <img src="/categories/leaves-bottom-left.png" alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 w-20 sm:w-28 lg:w-36 select-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="home-categories-title"
          className="flex items-center justify-center gap-3 sm:gap-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight"
        >
          <img src="/categories/flourish-left.png" alt="" aria-hidden="true" className="h-7 sm:h-10 lg:h-12 w-auto" />
          <span>
            <span className="text-[#FBF7E7]">Our</span> <span className="text-[#C3DE7A]">Categories</span>
          </span>
          <img src="/categories/flourish-right.png" alt="" aria-hidden="true" className="h-7 sm:h-10 lg:h-12 w-auto" />
        </h2>
        <p className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-[#C9D6C0]">Click to browse</p>

        {/* One row of round icons - scrolls sideways on smaller screens */}
        <div
          className="mt-9 sm:mt-12 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:gap-5 lg:overflow-visible lg:[grid-template-columns:repeat(var(--tiles),minmax(0,1fr))]"
          style={{ ['--tiles' as string]: tiles.length } as React.CSSProperties}
        >
          {tiles.map((t) => (
            <a
              key={t.slug}
              href={t.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(t.path);
              }}
              className="group snap-start shrink-0 w-[96px] sm:w-[124px] lg:w-auto flex flex-col items-center text-center focus:outline-none"
            >
              <span className="block w-[88px] h-[88px] sm:w-[116px] sm:h-[116px] lg:w-full lg:h-auto lg:aspect-square lg:max-w-[148px] rounded-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] group-focus-visible:ring-4 group-focus-visible:ring-[#C3DE7A]">
                <img src={t.icon} alt="" aria-hidden="true" loading="lazy" className="h-full w-full select-none" draggable={false} />
              </span>
              <span className="mt-3 text-[13px] sm:text-base font-medium leading-snug text-[#FBF7E7] group-hover:text-white">{t.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
