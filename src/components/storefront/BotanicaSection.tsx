import React from 'react';
import { ArrowRight, Leaf } from 'lucide-react';

interface BotanicaSectionProps {
  navigate: (path: string) => void;
}

export const BotanicaSection: React.FC<BotanicaSectionProps> = ({ navigate }) => {
  return (
    <section className="py-20 lg:py-32 bg-[#F4F3ED] border-b border-[#E8E5DC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text & Editorial CTA */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Small Botanica label */}
            <span className="text-[11px] font-bold text-[#556052] uppercase tracking-[0.24em] mb-4 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-[#1F3B22]" />
              Botanica &amp; Soil Nutrition
            </span>

            {/* Bold Headline */}
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#141414] leading-[1.06]">
              Slow-grown.
              <br />
              Nurtured weekly.
            </h2>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg text-[#525252] font-normal leading-relaxed max-w-md">
              Organic plant food and microbiome fertilizers crafted from what takes nature years to form.
            </p>

            {/* Forest Green Pill Button */}
            <div className="mt-8">
              <button
                onClick={() => navigate('/plants/plant-care')}
                className="pill-btn-dark px-8 py-3.5 text-xs uppercase tracking-widest font-bold shadow-md hover:shadow-lg"
              >
                Shop Organic Plant Food
              </button>
            </div>
          </div>

          {/* Right Column: Stone Slab Visual with Floating Action Arrow */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden border border-[#DED9CC] bg-[#EAE7DE] shadow-xl group">
              <img
                src="/editorial/botanica-stone-slab.jpg"
                alt="Slow-grown organic plant nutrition balm and living botanical care on stone slab"
                className="w-full h-auto object-cover transform transition-transform duration-700 ease-out group-hover:scale-102"
                loading="lazy"
              />

              {/* Floating Circular Arrow Button */}
              <button
                onClick={() => navigate('/plants/plant-care')}
                aria-label="Explore organic plant food collections"
                className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1F3B22] text-white flex items-center justify-center shadow-xl hover:bg-[#162B19] hover:scale-110 active:scale-95 transition-all duration-300 z-10"
              >
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
