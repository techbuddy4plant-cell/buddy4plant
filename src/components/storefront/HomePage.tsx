import React, { useState, useEffect } from 'react';
import { Product, Category, Review } from '../../types';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getRecentReviews } from '../../services/reviewService';
import { HeroBanner } from './HeroBanner';
import { setSeo, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '../../utils/seo';
import { BotanicaSection } from './BotanicaSection';
import { INITIAL_REVIEWS } from '../../data/initialSettings';
import { CategoryBar } from './CategoryBar';
import { BestSellersSection } from './BestSellersSection';
import { ShopBySpaceSection } from './ShopBySpaceSection';
import { TrustStrip } from './TrustStrip';
import { ComboPacksSection } from './ComboPacksSection';
import { CustomerReviewsSection } from './CustomerReviewsSection';
import { ProjectsSection } from './ProjectsSection';
import { MessageCircle, ArrowRight, Sparkles, ShieldCheck } from '../common/Icons';

import { useStoreSettings, storefrontBackground } from '../../context/StoreSettingsContext';

interface HomePageProps {
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, onQuickView }) => {
  const { homepageCMS, settings } = useStoreSettings();
  useEffect(() => {
    setSeo({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, path: '/' });
  }, []);
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

  const bgStyle = storefrontBackground(homepageCMS.siteBackground);

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
      {/* Unified Sylva Living Green 3D Hero Banner */}
      <HeroBanner navigate={navigate} />
      <TrustStrip />

      {/* Botanica Section - Slow-grown stone slab presentation */}
      <BotanicaSection navigate={navigate} />


      {/* Category Pills & Grid */}
      <CategoryBar categories={categories} products={products} navigate={navigate} />


      {/* Bestsellers Section */}
      <BestSellersSection
        products={products}
        navigate={navigate}
        onQuickView={onQuickView}
      />

      {/* Shop by Living Space */}
      <ShopBySpaceSection navigate={navigate} products={products} onQuickView={onQuickView} />

      {/* Combo Value Packs Section */}
      <ComboPacksSection
        products={products}
        navigate={navigate}
        onQuickView={onQuickView}
      />

      {/* Curated Botanical Projects Showcase */}
      <ProjectsSection navigate={navigate} />


      {/* Real Customer Stories & Reviews */}
      <CustomerReviewsSection reviews={reviews.filter((r) => !INITIAL_REVIEWS.some((d) => d.id === r.id))} />

    </div>
  );
};
