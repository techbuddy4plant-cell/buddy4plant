import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface HeroBannerProps {
  navigate: (path: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ navigate }) => {
  const { homepageCMS } = useStoreSettings();

  return (
    <section className="relative bg-[#FBFBFA] text-[#141414] overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-16 border-b border-[#EAE8E3]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Centered Editorial Headline tailored for Plants & Organic Plant Food */}
        <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#141414] leading-[1.05] max-w-3xl mx-auto">
          {homepageCMS.heroTitle || 'The roots remember what the soil provides.'}
        </h1>

        {/* Centered Editorial Subtitle */}
        <p className="mt-5 sm:mt-6 text-xs sm:text-sm md:text-base text-[#525252] font-normal leading-relaxed max-w-2xl mx-auto">
          {homepageCMS.heroSubtitle ||
            'A slow-release botanical elixir crafted from cold-pressed kelp, mycorrhizal bio-actives, and vermicompost humus. Feeds roots deep, settles clean. Nurture weekly after watering on damp soil for lush leaves and resilient blooms.'}
        </p>

        {/* Centered Pill Button */}
        <div className="mt-7 flex justify-center">
          <button
            id="hero-see-collections-btn"
            onClick={() => navigate('/plants')}
            className="pill-btn-light px-8 py-3.5 text-xs uppercase tracking-widest font-bold shadow-xs hover:shadow-md flex items-center gap-2"
          >
            {homepageCMS.heroPrimaryButtonText || 'Shop Plants & Organic Food'}
            <ArrowRight className="w-3.5 h-3.5 text-[#1F3B22]" />
          </button>
        </div>
      </div>

      {/* Hero Visual: Moss-Covered Branch with Botanical Jar */}
      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 mt-8 sm:mt-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E3DFD5] bg-[#F7F6F2] group">
          <img
            src="/editorial/hero-botanical-branch.jpg"
            alt="buddy4plant organic plant elixir resting on lush moss branch"
            className="w-full h-auto object-cover max-h-[620px] transform transition-transform duration-1000 ease-out group-hover:scale-102"
          />

          {/* Micro overlay tag */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white/95 text-[10px] font-medium tracking-wider uppercase border border-white/20 flex items-center gap-1.5">
            <Leaf className="w-3 h-3 text-[#A3B899]" />
            Cold-Pressed Bio-Active Plant Nutrition &bull; 100% Organic &amp; Peat-Free
          </div>
        </div>
      </div>
    </section>
  );
};
