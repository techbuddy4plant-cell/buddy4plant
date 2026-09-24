import React, { useState, useEffect } from 'react';
import { Product, Category, Review } from '../../types';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getRecentReviews } from '../../services/reviewService';
import { HeroBanner } from './HeroBanner';
import { BotanicaSection } from './BotanicaSection';
import { WhatsInsideSection } from './WhatsInsideSection';
import { CategoryBar } from './CategoryBar';
import { BestSellersSection } from './BestSellersSection';
import { ShopBySpaceSection } from './ShopBySpaceSection';
import { ComboPacksSection } from './ComboPacksSection';
import { WhyChooseUs } from './WhyChooseUs';
import { CustomerReviewsSection } from './CustomerReviewsSection';
import { ProjectsSection } from './ProjectsSection';
import { MessageCircle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

import { useStoreSettings } from '../../context/StoreSettingsContext';

interface HomePageProps {
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, onQuickView }) => {
  const { homepageCMS, settings } = useStoreSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([getProducts(), getCategories(), getRecentReviews()]).then(
      ([pList, cList, rList]) => {
        setProducts(pList);
        setCategories(cList);
        setReviews(rList);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    loadData();

    const handleDataChanged = () => {
      loadData();
    };
    window.addEventListener('b4p_store_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('b4p_store_data_changed', handleDataChanged);
    };
  }, []);

  const bgStyle = homepageCMS.siteBackground || '#FDFCF9';

  return (
    <div
      className="min-h-screen text-[#1A1A1A] transition-colors duration-300"
      style={{
        backgroundColor: bgStyle.startsWith('http') || bgStyle.startsWith('data:') ? undefined : bgStyle,
        backgroundImage: bgStyle.startsWith('http') || bgStyle.startsWith('data:') ? `url(${bgStyle})` : undefined,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Hero Banner - Exact Thornfield Editorial Match */}
      <HeroBanner navigate={navigate} />

      {/* Botanica Section - Slow-grown stone slab presentation */}
      <BotanicaSection navigate={navigate} />

      {/* What's Inside Section - Arched botanical ingredient cards */}
      <WhatsInsideSection navigate={navigate} />

      {/* Category Pills & Grid */}
      <CategoryBar categories={categories} navigate={navigate} />

      {/* Bestsellers Section */}
      <BestSellersSection
        products={products}
        navigate={navigate}
        onQuickView={onQuickView}
      />

      {/* Shop by Living Space */}
      <ShopBySpaceSection navigate={navigate} />

      {/* Combo Value Packs Section */}
      <ComboPacksSection
        products={products}
        navigate={navigate}
        onQuickView={onQuickView}
      />

      {/* Curated Botanical Projects Showcase */}
      <ProjectsSection navigate={navigate} />

      {/* Why Choose Us Standard */}
      <WhyChooseUs />

      {/* Real Customer Stories & Reviews */}
      <CustomerReviewsSection reviews={reviews} />

      {/* WhatsApp Plant Doctor Consultation Banner */}
      <section className="py-16 bg-transparent border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1A1A1A] border border-[#2D4A27]/40 p-8 sm:p-12 text-[#FDFCF9] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2D4A27] border border-[#2D4A27] text-[#A3B899] text-[10px] font-bold uppercase tracking-[0.25em] mb-4">
                <Sparkles className="w-3 h-3 text-[#A3B899]" />
                Complimentary Service
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#FDFCF9]">
                Got Questions About Your Houseplants?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#D5D2C9] leading-relaxed font-light">
                Chat 1-on-1 with certified horticulturists for watering diagnosis, repotting guidance, and light positioning tips.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href={`https://wa.me/${(settings.whatsappSupportNumber || '919876543210').replace(/[^0-9]/g, '')}?text=Hi%20Plant%20Doctor,%20I%20would%20like%20guidance%20for%20my%20plants`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                Chat on WhatsApp Now
              </a>
              <button
                onClick={() => navigate('/plant-doctor')}
                className="px-6 py-3.5 bg-transparent hover:bg-white/10 border border-[#E5E2D9]/40 text-[#FDFCF9] text-[11px] uppercase tracking-wider font-bold transition-colors text-center"
              >
                Self-Help Guide &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
