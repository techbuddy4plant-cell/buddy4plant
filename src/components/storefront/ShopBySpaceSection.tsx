import { useStoreSettings } from '../../context/StoreSettingsContext';
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PlantImage } from '../../utils/imageFallback';

interface ShopBySpaceProps {
  navigate: (path: string) => void;
}

export const ShopBySpaceSection: React.FC<ShopBySpaceProps> = ({ navigate }) => {
  const { homepageCMS } = useStoreSettings();
  const spaces = [
    {
      title: 'Living Room Sanctuary',
      subtitle: 'Sculptural & statement foliage',
      image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
      spaceParam: 'Living Room',
    },
    {
      title: 'Bedroom Oasis',
      subtitle: 'Night-oxygen restorative plants',
      image: 'https://images.unsplash.com/photo-1599598425947-320d43702580?auto=format&fit=crop&w=600&q=80',
      spaceParam: 'Bedroom',
    },
    {
      title: 'Work Desk & Study',
      subtitle: 'Stress-reducing focus companions',
      image: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=600&q=80',
      spaceParam: 'Office Desk',
    },
    {
      title: 'Sunlit Veranda',
      subtitle: 'Sun-thriving resilient greens',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
      spaceParam: 'Balcony',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-transparent border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block">
            Space-Specific Botanical Curation
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] mt-2 tracking-tight">
            {homepageCMS.livingSpacesTitle || 'Shop by Living Space'}
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-3 font-normal leading-relaxed">
            {homepageCMS.livingSpacesSubtitle || 'Every room possesses its own natural light and humidity rhythm. Select flora calibrated to thrive.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {spaces.map((space) => (
            <div
              key={space.title}
              onClick={() => navigate(`/plants?space=${encodeURIComponent(space.spaceParam)}`)}
              className="group relative overflow-hidden aspect-[4/5] rounded-3xl cursor-pointer border border-[#E0DDD3] shadow-xs hover:shadow-xl transition-all duration-500"
            >
              <PlantImage
                src={space.image}
                alt={space.title}
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-between p-6 text-white">
                <div className="self-end">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#1F3B22] group-hover:scale-110 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="font-editorial text-xl font-bold text-white group-hover:text-[#E0E5E2] transition-colors">
                    {space.title}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 font-light">
                    {space.subtitle}
                  </p>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#B5D6B2] inline-block">
                    Explore Flora &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
