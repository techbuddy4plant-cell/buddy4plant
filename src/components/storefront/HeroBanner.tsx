import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Leaf,
  Droplets,
  Sparkles,
  ShieldCheck,
  Truck,
  Star,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Bot
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface HeroBannerProps {
  navigate: (path: string) => void;
}

interface Slide {
  id: number;
  tag: string;
  headline: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaPath: string;
  secondaryCtaText: string;
  secondaryCtaPath: string;
  image: string;
  imageAlt: string;
  badge: string;
  hotspots: {
    top: string;
    left: string;
    label: string;
    sublabel: string;
  }[];
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    tag: "India's Premier Live Plants & Planters Destination",
    headline: 'Adding Life to Your Spaces.',
    subtitle:
      'Lush, nursery-grown houseplants potted in intelligent self-watering planters and enriched with 100% cold-pressed organic bio-nutrients. Delivered safely with a 7-day fresh guarantee.',
    primaryCtaText: 'Shop Live Houseplants',
    primaryCtaPath: '/plants',
    secondaryCtaText: 'Organic Plant Care & Pots',
    secondaryCtaPath: '/plants/plant-care',
    image: '/editorial/kyari-living-plants-hero.jpg',
    imageAlt: 'Lush indoor houseplants in self-watering ceramic planters with organic plant elixir',
    badge: '100% Healthy Plant Guarantee • Pre-Potted & Ready to Unbox',
    hotspots: [
      {
        top: '38%',
        left: '46%',
        label: 'Monstera Deliciosa',
        sublabel: 'NASA Air-Purifier'
      },
      {
        top: '68%',
        left: '48%',
        label: 'Self-Watering Planter',
        sublabel: '10-Day Sub-Irrigation'
      },
      {
        top: '74%',
        left: '58%',
        label: 'Cold-Pressed Plant Elixir',
        sublabel: '100% Organic Microbes'
      }
    ]
  },
  {
    id: 2,
    tag: 'Bio-Active Organic Plant Nutrition',
    headline: 'The Roots Remember What Soil Provides.',
    subtitle:
      'Slow-release botanical elixirs crafted from cold-pressed kelp, mycorrhizal bio-actives, and vermicompost humus. Feeds root systems deep for glossy foliage and disease-free growth.',
    primaryCtaText: 'Shop Organic Plant Food',
    primaryCtaPath: '/plants/plant-care',
    secondaryCtaText: 'Explore Living Flora',
    secondaryCtaPath: '/plants',
    image: '/editorial/hero-botanical-branch.jpg',
    imageAlt: 'Artisanal organic bio-nutrition jar on curved moss branch',
    badge: '100% Chemical & Peat-Free • Root Shock Shield',
    hotspots: [
      {
        top: '48%',
        left: '54%',
        label: 'Aged Bio-Humus Elixir',
        sublabel: 'Unlocks Soil Nutrition'
      }
    ]
  },
  {
    id: 3,
    tag: 'Turnkey Biophilic Green Design',
    headline: 'Custom Balconies & Living Green Spaces.',
    subtitle:
      'Transform your apartment balconies, terrace gardens, and commercial spaces with living architectural foliage, custom vertical drainage, and automated drip setups.',
    primaryCtaText: 'Explore Projects Portfolio',
    primaryCtaPath: '/projects',
    secondaryCtaText: 'Book Green Consultation',
    secondaryCtaPath: '/projects',
    image: '/editorial/botanica-stone-slab.jpg',
    imageAlt: 'Travertine stone slab with organic plant nutrition ingredients',
    badge: 'Curated Flora Installations • 250+ Spaces Styled',
    hotspots: [
      {
        top: '40%',
        left: '50%',
        label: 'Urban Balcony Sanctuary',
        sublabel: 'Turnkey Consultation'
      }
    ]
  }
];

const QUICK_CATEGORIES = [
  { label: 'All Plants', icon: '🌿', path: '/plants' },
  { label: 'Air Purifiers', icon: '🌬️', path: '/plants/air-purifying' },
  { label: 'Low Maintenance', icon: '🌱', path: '/plants/low-maintenance' },
  { label: 'Pots & Planters', icon: '🪴', path: '/plants/pots-planters' },
  { label: 'Organic Plant Food', icon: '🧪', path: '/plants/plant-care' },
  { label: 'Combos & Gifts', icon: '🎁', path: '/plants/combos' },
  { label: '🌿 Projects', icon: '✨', path: '/projects' }
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ navigate }) => {
  const { homepageCMS } = useStoreSettings();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  // Auto-slide carousel unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const slide = HERO_SLIDES[currentSlideIndex];

  return (
    <div className="bg-transparent text-[#1D3A24] overflow-hidden">
      {/* Kyari-Style Hero Announcement Strip */}
      <div className="bg-[#1F3B22] text-[#E8F0E7] py-2 px-4 text-center text-[11px] sm:text-xs font-semibold tracking-wide flex items-center justify-center gap-2 border-b border-[#2C5230]">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>India&apos;s #1 Nursery &amp; Organic Plant Food Destination</span>
        <span className="hidden md:inline text-white/50">&bull;</span>
        <span className="hidden md:inline text-[#CBE3CA]">Free Safe Pan-India Delivery on Orders ₹499+</span>
        <button
          onClick={() => navigate('/plants')}
          className="underline font-bold text-white ml-2 hover:text-[#A8E6CF] transition-colors"
        >
          Shop Now &rarr;
        </button>
      </div>

      {/* Main Kyari-Inspired Hero Section */}
      <section
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10 sm:pb-16"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Compelling D2C Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
            {/* Tag / Category Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2E9] border border-[#C5DAC3] text-[#1F3B22] text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>{slide.tag}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142B1A] leading-[1.08] tracking-tight">
              {slide.headline}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-[#4C5E50] leading-relaxed max-w-xl font-normal">
              {slide.subtitle}
            </p>

            {/* Dual CTAs (Kyari style) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-primary-cta"
                onClick={() => navigate(slide.primaryCtaPath)}
                className="px-7 py-3.5 bg-[#1F3B22] hover:bg-[#162D19] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
              >
                <span>{slide.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </button>

              <button
                id="hero-secondary-cta"
                onClick={() => navigate(slide.secondaryCtaPath)}
                className="px-6 py-3.5 bg-white hover:bg-[#F2F7F2] text-[#1F3B22] border border-[#CBDCC9] rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xs hover:border-[#1F3B22] flex items-center gap-2"
              >
                <span>{slide.secondaryCtaText}</span>
              </button>
            </div>

            {/* Social Proof & Trust Metrics (Shark Tank / Customer Rating) */}
            <div className="pt-4 border-t border-[#E5EDE4] flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Star Rating & Avatars */}
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                    alt="Customer avatar"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                    alt="Customer avatar"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                    alt="Customer avatar"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-xs font-bold text-[#1F3B22]">4.9 / 5</span>
                  </div>
                  <p className="text-[10px] text-[#607664] font-medium">
                    15,000+ Happy Plant Parents
                  </p>
                </div>
              </div>

              {/* Transit Safe Badge */}
              <div className="flex items-center gap-2 text-xs text-[#2D5A34] font-semibold bg-[#EBF4EB] px-3 py-1.5 rounded-lg border border-[#D0E5CE]">
                <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                <span>Zero Transit Damage Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lifestyle Hero Visual with Interactive Hotspots */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E5EDE4] bg-[#F0F5F0] group">
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className="w-full h-auto object-cover max-h-[500px] sm:max-h-[560px] transform transition-transform duration-700 ease-out group-hover:scale-102"
              />

              {/* Floating Hotspots on Image */}
              {slide.hotspots.map((spot, idx) => (
                <div
                  key={idx}
                  className="absolute z-20 group/spot"
                  style={{ top: spot.top, left: spot.left }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(activeHotspot === idx ? null : idx)}
                    className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 shadow-lg border border-[#1F3B22]/30 flex items-center justify-center text-[#1F3B22] font-bold text-xs hover:scale-110 transition-transform"
                    aria-label={spot.label}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F3B22] animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F3B22]" />
                  </button>

                  {/* Hotspot Tooltip */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-[#142B1A]/95 backdrop-blur-md text-white p-2.5 rounded-xl text-left shadow-xl pointer-events-none transition-all duration-200 ${
                      activeHotspot === idx
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95 group-hover/spot:opacity-100 group-hover/spot:scale-100'
                    }`}
                  >
                    <p className="text-[11px] font-bold leading-tight text-[#E8F8EA]">{spot.label}</p>
                    <p className="text-[9px] text-[#A6CDB0] mt-0.5">{spot.sublabel}</p>
                  </div>
                </div>
              ))}

              {/* Bottom Feature Pill Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
                <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md text-white/95 text-[11px] font-medium tracking-wide border border-white/20 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-3.5 h-3.5 text-[#9FE5A5]" />
                    <span className="truncate">{slide.badge}</span>
                  </div>
                  <button
                    onClick={() => navigate('/plants')}
                    className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 hover:text-white"
                  >
                    Explore &rarr;
                  </button>
                </div>
              </div>

              {/* Slide Navigation Arrows */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                <button
                  onClick={() =>
                    setCurrentSlideIndex(
                      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                    )
                  }
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1F3B22] backdrop-blur-sm shadow flex items-center justify-center transition-all"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)
                  }
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1F3B22] backdrop-blur-sm shadow flex items-center justify-center transition-all"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Pagination Dots */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlideIndex === idx
                      ? 'w-8 bg-[#1F3B22]'
                      : 'w-2 bg-[#D1DEC0] hover:bg-[#A3B899]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kyari-Style Quick Category Pills Bar */}
      <div className="border-y border-[#E6EDE5] bg-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#68826D] shrink-0 mr-2 flex items-center gap-1">
              Explore Collections:
            </span>
            {QUICK_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => navigate(cat.path)}
                className="shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2A4830] bg-[#F4F8F4] hover:bg-[#1F3B22] hover:text-white border border-[#DCE8DC] transition-all shadow-2xs"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kyari-Style 4-Pillar Trust Proposition Bar */}
      <section className="bg-transparent border-b border-black/10 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Safe Pan-India Delivery */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3EDE2] shadow-2xs flex items-start gap-3.5 hover:border-[#1F3B22]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#EAF5EB] text-[#1F3B22] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#142B1A] leading-snug">
                  Safe Pan-India Transit
                </h4>
                <p className="text-[11px] text-[#617665] mt-1 leading-relaxed">
                  Engineered ventilated packaging for guaranteed zero leaf breakage.
                </p>
              </div>
            </div>

            {/* 2. Self-Watering Technology */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3EDE2] shadow-2xs flex items-start gap-3.5 hover:border-[#1F3B22]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#E5F3F7] text-[#0A5D75] flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#142B1A] leading-snug">
                  Self-Watering Planters
                </h4>
                <p className="text-[11px] text-[#617665] mt-1 leading-relaxed">
                  Sub-irrigation reservoirs keep roots hydrated for 10–14 days.
                </p>
              </div>
            </div>

            {/* 3. 100% Organic Soil Nutrition */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3EDE2] shadow-2xs flex items-start gap-3.5 hover:border-[#1F3B22]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#F6F1E6] text-[#7A5B18] flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#142B1A] leading-snug">
                  100% Organic Nutrition
                </h4>
                <p className="text-[11px] text-[#617665] mt-1 leading-relaxed">
                  Cold-pressed kelp & mycorrhizae for lush leaf chlorophyll.
                </p>
              </div>
            </div>

            {/* 4. Free WhatsApp Plant Doctor */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3EDE2] shadow-2xs flex items-start gap-3.5 hover:border-[#1F3B22]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] text-[#1B803E] flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#142B1A] leading-snug">
                  Free Plant Doctor Help
                </h4>
                <p className="text-[11px] text-[#617665] mt-1 leading-relaxed">
                  Direct WhatsApp guidance from certified horticulturists anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
