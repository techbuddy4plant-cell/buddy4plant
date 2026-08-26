import React, { useState, useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../common/ProductCard';
import { Product } from '../../types';
import { getProducts } from '../../services/productService';
import { Heart, Sparkles } from 'lucide-react';

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
    <div className="bg-[#FDFCF9] min-h-screen py-12 text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EBF3EC] border border-[#2D4A27]/30 text-[#2D4A27] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-3 cartoon-hover-pop">
            <Heart className="w-3.5 h-3.5 fill-[#2D4A27] text-[#2D4A27]" />
            Saved Botanicals
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            Your Plant Wishlist
          </h1>
          <p className="text-xs text-[#5A5A5A] mt-2 font-light">
            Keep track of your favorite houseplants, pots, and care essentials for future orders.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-[#5A5A5A]">
            <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[#2D4A27] mb-2 block" />
            Loading your wishlist items...
          </div>
        ) : wishlistedProducts.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto bg-white border border-[#E5E2D9] rounded-2xl p-10 text-center shadow-xs animate-fadeIn">
            <div className="w-16 h-16 bg-[#F5F2EB] border border-[#E5E2D9] text-[#2D4A27] rounded-full flex items-center justify-center mx-auto text-2xl mb-4 animate-cartoon-float">
              <i className="fa-regular fa-heart text-[#2D4A27]" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Your Wishlist is Empty</h2>
            <p className="text-xs text-[#5A5A5A] mt-2 leading-relaxed font-light">
              Explore our nursery collection and click the heart icon on any plant to save it for later.
            </p>
            <button
              onClick={() => navigate('/plants')}
              className="mt-6 px-6 py-3 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cartoon-hover-pop"
            >
              Explore Plant Catalogue &rarr;
            </button>
          </div>
        ) : (
          /* Wishlist Grid */
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E5E2D9] text-xs">
              <span className="font-semibold text-[#5A5A5A]">
                Showing <strong className="text-[#1A1A1A]">{wishlistedProducts.length}</strong> saved items
              </span>
              <button
                onClick={() => navigate('/plants')}
                className="text-[#2D4A27] font-bold hover:underline"
              >
                + Add More Plants
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
