import React, { useState } from 'react';
import { ArrowUpRight, X, Sparkles, Check, Droplets, Leaf } from 'lucide-react';

interface WhatsInsideSectionProps {
  navigate: (path: string) => void;
}

interface IngredientItem {
  id: string;
  name: string;
  botanicalName: string;
  tagline: string;
  description: string;
  benefits: string[];
  harvestOrigin: string;
  image: string;
  hasDots?: boolean;
}

const INGREDIENTS: IngredientItem[] = [
  {
    id: 'humus',
    name: 'Aged Bio-Humus & Bark Complex',
    botanicalName: 'Humic & Fulvic Bio-Actives',
    tagline: 'Calms root stress & unlocks micro-nutrients',
    description:
      'Ethically harvested composted timber bark and natural forest humus, rich in humic and fulvic acids. Essential for loosening compacted pot soil, stimulating root hair branching, and enabling cellular nutrient transport.',
    benefits: ['Accelerates deep root branching', 'Prevents transplant stress & leaf drop', 'Unlocks organic micronutrients in soil'],
    harvestOrigin: 'Sustainable Forest Reserve, Western Ghats',
    image: '/editorial/ingredient-sandalwood.jpg',
  },
  {
    id: 'kelp-moss',
    name: 'Cold-Pressed Kelp & Moss Elixir',
    botanicalName: 'Ascophyllum Nodosum & Moss Culture',
    tagline: 'Natural auxins for lush foliage & heat resilience',
    description:
      'Cold-extracted from coastal kelp and deep forest moss. Naturally concentrated in botanical auxins, cytokines, and 60+ trace minerals that build thick, glossy leaves resilient to indoor AC and dry air.',
    benefits: ['Intensifies chlorophyll & glossy leaf sheen', 'Builds immunity against dry indoor air', 'Gentle non-burning liquid nutrition'],
    harvestOrigin: 'Alpine Cloud Forest & Organic Seaweed Reserve',
    image: '/editorial/ingredient-moss.jpg',
    hasDots: true,
  },
  {
    id: 'neem-nectar',
    name: 'Golden Cold-Pressed Neem Nectar',
    botanicalName: 'Azadirachta Indica & Karanja Seed',
    tagline: 'Organic pest shield & root microbiome protector',
    description:
      'A dense, golden active cold-pressed elixir from pure neem kernels and karanja seeds. Provides a natural systemic organic shield against mealybugs, spider mites, and root gnats while feeding beneficial mycorrhizae.',
    benefits: ['Repels mealybugs, aphids & gnats naturally', 'Restores natural waxy leaf protection', '100% pet-friendly & safe for indoor use'],
    harvestOrigin: 'Certified Organic Farmland, Karnataka',
    image: '/editorial/ingredient-nectar-oil.jpg',
  },
];

import { useStoreSettings } from '../../context/StoreSettingsContext';

export const WhatsInsideSection: React.FC<WhatsInsideSectionProps> = ({ navigate }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientItem | null>(null);
  const [activeDot, setActiveDot] = useState(1);
  const { homepageCMS } = useStoreSettings();

  const sectionTitle = homepageCMS.whatsInsideTitle || "What's inside";
  const sectionSubtitle =
    homepageCMS.whatsInsideSubtitle ||
    'Each organic nutrient was chosen because it works for living plants. Not because it looks good on a label.';

  return (
    <section className="py-20 lg:py-28 bg-transparent border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-xl">
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#141414] leading-[1.08]">
              {sectionTitle}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#525252] font-normal leading-relaxed">
              {sectionSubtitle}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => navigate('/plants/plant-care')}
              className="pill-btn-dark px-7 py-3 text-xs uppercase tracking-widest font-bold"
            >
              See Plant Food &amp; Care
            </button>
          </div>
        </div>

        {/* 3 Arched Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {INGREDIENTS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedIngredient(item)}
              className="group relative cursor-pointer flex flex-col bg-[#F3F2EC] rounded-t-[44px] rounded-b-[24px] overflow-hidden border border-[#E5E2D9] transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5"
            >
              {/* Image Container with arched top */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EAE7E0]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle soft gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-60 transition-opacity" />

                {/* Top Right Square Action Badge with Diagonal Arrow */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/90 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center text-[#141414] transition-all duration-300 group-hover:bg-[#1F3B22] group-hover:text-white group-hover:scale-110">
                    <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>

                {/* Carousel Pagination Dots for Middle Card */}
                {item.hasDots && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-full">
                    {[0, 1, 2, 3, 4].map((dot) => (
                      <button
                        key={dot}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDot(dot);
                        }}
                        className={`transition-all rounded-full ${
                          activeDot === dot ? 'w-2.5 h-2.5 bg-white shadow-xs' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${dot + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Caption */}
              <div className="p-6 flex flex-col justify-between grow bg-[#F3F2EC]">
                <div>
                  <div className="text-[10px] font-bold text-[#63725F] uppercase tracking-[0.2em] mb-1">
                    {item.botanicalName}
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-[#141414] group-hover:text-[#1F3B22] transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs text-[#5C5C5C] leading-relaxed line-clamp-2">
                    {item.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E3DFD5] flex items-center justify-between text-[11px] font-semibold text-[#141414]">
                  <span className="text-[#7A7A7A]">Origin: {item.harvestOrigin}</span>
                  <span className="text-[#1F3B22] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read Bio-Notes &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Botanical Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="relative w-full max-w-2xl bg-[#FBFBFA] border border-[#DCD7CB] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIngredient(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#EAE7DF] hover:bg-[#DCD7CB] flex items-center justify-center text-[#141414] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
              <div className="w-full sm:w-1/2 aspect-square rounded-2xl overflow-hidden border border-[#E0DCCE] shadow-inner bg-[#EAE7DF]">
                <img
                  src={selectedIngredient.image}
                  alt={selectedIngredient.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full sm:w-1/2">
                <span className="inline-block text-[10px] font-bold text-[#1F3B22] uppercase tracking-[0.22em] mb-1.5">
                  {selectedIngredient.botanicalName}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#141414]">
                  {selectedIngredient.name}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                  {selectedIngredient.description}
                </p>

                <div className="mt-5 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#141414]">
                    Active Plant Benefits:
                  </div>
                  {selectedIngredient.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2 text-xs text-[#383838]">
                      <div className="w-4 h-4 rounded-full bg-[#1F3B22]/10 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#1F3B22]" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-[#E5E2D9] flex items-center justify-between gap-4">
                  <div className="text-[11px] text-[#6E6E6E]">
                    Sourced from <span className="font-semibold text-[#141414]">{selectedIngredient.harvestOrigin}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedIngredient(null);
                      navigate('/plants/plant-care');
                    }}
                    className="pill-btn-dark px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider"
                  >
                    Shop Plant Care
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
