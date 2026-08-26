import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Droplets } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { PlantImage, DEFAULT_PLANT_IMAGE } from '../../utils/imageFallback';

interface HeroBannerProps {
  navigate: (path: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ navigate }) => {
  const { homepageCMS } = useStoreSettings();

  return (
    <section className="relative overflow-hidden bg-[#1A1A1A] text-[#FDFCF9]">
      {/* Background Cinematic Image with Natural Editorial Overlay */}
      <div className="absolute inset-0 z-0">
        <PlantImage
          src={homepageCMS.heroImage || DEFAULT_PLANT_IMAGE}
          alt="Lush botanical nursery plants"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/85 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col justify-center min-h-[560px]">
        <div className="max-w-2xl">
          {/* Badge */}
          {homepageCMS.heroBadge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2D4A27]/80 border border-[#2D4A27] text-[#A3B899] text-[10px] font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-[#A3B899]" />
              {homepageCMS.heroBadge}
            </div>
          )}

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#FDFCF9] leading-[1.12]">
            {homepageCMS.heroTitle ? (
              homepageCMS.heroTitle
            ) : (
              <>
                Bring Home a Little More <span className="italic font-light text-[#E0E5E2]">Green</span>.
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-[#D5D2C9] font-light leading-relaxed max-w-xl">
            {homepageCMS.heroSubtitle ||
              'Hand-nurtured botanical plants, artisanal planters, and organic care kits crafted for serene Indian homes.'}
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              id="hero-shop-plants-btn"
              onClick={() => navigate(homepageCMS.heroPrimaryButtonLink || '/plants')}
              className="px-8 py-3.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm active:scale-98"
            >
              {homepageCMS.heroPrimaryButtonText || 'Shop All Plants'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="hero-explore-combos-btn"
              onClick={() => navigate(homepageCMS.heroSecondaryButtonLink || '/plants/combos')}
              className="px-8 py-3.5 bg-transparent hover:bg-white/10 border border-[#E5E2D9]/40 text-[#FDFCF9] font-bold text-[11px] uppercase tracking-widest transition-all active:scale-98"
            >
              {homepageCMS.heroSecondaryButtonText || 'Explore Curated Combos'}
            </button>
          </div>

          {/* Micro trust stats */}
          <div className="mt-12 pt-8 border-t border-[#333333] grid grid-cols-3 gap-6 text-xs text-[#D5D2C9]">
            <div>
              <div className="font-serif font-bold text-2xl text-[#FDFCF9]">100%</div>
              <div className="text-[#8A8A8A] text-[11px] mt-0.5 tracking-wider uppercase">Transit Health Guarantee</div>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl text-[#FDFCF9]">50,000+</div>
              <div className="text-[#8A8A8A] text-[11px] mt-0.5 tracking-wider uppercase">Happy Green Spaces</div>
            </div>
            <div>
              <div className="font-serif font-bold text-2xl text-[#FDFCF9]">Free</div>
              <div className="text-[#8A8A8A] text-[11px] mt-0.5 tracking-wider uppercase">Plant Doctor WhatsApp</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
