import React, { useState, useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../common/ProductCard';
import { Product } from '../../types';
import { getProducts } from '../../services/productService';
import { Heart, Sparkles, ArrowRight, Leaf } from 'lucide-react';

interface WishlistPageProps {
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ navigate, onQuickView }) => {
  const { wishlistIds } = useWishlist();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then((prods) => {
      setAllProducts(prods);
      setLoading(false);
    });
  }, []);

  const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-16 text-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block mb-2">
            Reserved Flora
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#141414] tracking-tight">
            Saved Botanicals
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5C5C] mt-3 font-normal leading-relaxed">
            Your personal curation of living houseplants and artisanal planters for upcoming spaces.
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs text-[#7A7A7A]">
            <div className="w-8 h-8 border-2 border-[#1F3B22] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Gathering your saved flora...
          </div>
        ) : wishlistedProducts.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto bg-[#FAF9F5] border border-[#E5E2D9] rounded-3xl p-12 text-center shadow-sm animate-fadeIn">
            <div className="w-16 h-16 bg-[#F0EDE4] border border-[#DDD9CF] text-[#1F3B22] rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Heart className="w-7 h-7 text-[#1F3B22]" />
            </div>
            <h2 className="font-editorial font-bold text-2xl text-[#141414]">Your Wishlist is Empty</h2>
            <p className="text-xs sm:text-sm text-[#616161] mt-2.5 leading-relaxed">
              Explore our nursery collection and tap the heart icon on any plant to save it to your personal curation.
            </p>
            <button
              onClick={() => navigate('/plants')}
              className="mt-7 pill-btn-dark px-7 py-3 text-xs uppercase tracking-wider font-bold shadow-md hover:shadow-lg"
            >
              Explore Living Plants &rarr;
            </button>
          </div>
        ) : (
          /* Wishlist Grid */
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E5DC] text-xs">
              <span className="text-[#5C5C5C]">
                Showing <strong className="text-[#141414] font-semibold">{wishlistedProducts.length}</strong> saved {wishlistedProducts.length === 1 ? 'specimen' : 'specimens'}
              </span>
              <button
                onClick={() => navigate('/plants')}
                className="pill-btn-light text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                + Browse More Flora
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {wishlistedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigate={navigate}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
