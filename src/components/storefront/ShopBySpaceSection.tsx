import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { PlantImage } from '../../utils/imageFallback';

interface ShopBySpaceProps {
  navigate: (path: string) => void;
}

export const ShopBySpaceSection: React.FC<ShopBySpaceProps> = ({ navigate }) => {
  const spaces = [
    {
      title: 'Living Room',
      subtitle: 'Sculptural & statement tropicals',
      image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
      spaceParam: 'Living Room',
    },
    {
      title: 'Bedroom & Night Air',
      subtitle: 'CO2-absorbing night oxygen plants',
      image: 'https://images.unsplash.com/photo-1599598425947-320d43702580?auto=format&fit=crop&w=600&q=80',
      spaceParam: 'Bedroom',
    },
    {
      title: 'Work Desk & Cabin',
      subtitle: 'Stress-reducing compact focus greens',
      image: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=600&q=80',
      spaceParam: 'Office Desk',
    },
    {
      title: 'Balcony & Veranda',
      subtitle: 'Sun-thriving blooms & climbing foliage',
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
      spaceParam: 'Balcony',
    },
  ];

  return (
    <section className="py-16 bg-[#FDFCF9] border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] font-bold text-[#2D4A27] uppercase tracking-[0.25em] block">
            Space-Specific Botanical Styling
          </span>
          <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
            Shop by Living Space
          </h2>
          <p className="text-xs text-[#5A5A5A] mt-2 font-light">
            Every room has a unique micro-climate. Choose plants tailored precisely to your light and humidity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((space) => (
            <div
              key={space.title}
              onClick={() => navigate(`/plants?space=${encodeURIComponent(space.spaceParam)}`)}
              className="group relative overflow-hidden aspect-[4/5] cursor-pointer border border-[#E5E2D9] transition-all hover:border-[#2D4A27]/60"
            >
              <PlantImage
                src={space.image}
                alt={space.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/30 to-transparent flex flex-col justify-end p-6 text-white">
                <h3 className="font-serif text-xl font-bold text-[#FDFCF9] group-hover:text-[#A3B899] transition-colors">
                  {space.title}
                </h3>
                <p className="text-xs text-[#D5D2C9] mt-1 font-light">
                  {space.subtitle}
                </p>
                <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#A3B899] flex items-center gap-1">
                  Shop Space &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
