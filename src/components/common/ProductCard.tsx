import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Sun } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { PlantImage } from '../../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isLiked = isInWishlist(product.id);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-[#FAF9F5] rounded-3xl border border-[#E5E2D9] overflow-hidden transition-all duration-500 flex flex-col justify-between hover:border-[#1F3B22]/40 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full bg-[#F3F1EB] overflow-hidden cursor-pointer">
        <PlantImage
          src={product.images[0]}
          alt={product.name}
          onClick={() => navigate(`/product/${product.slug}`)}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
        />

        {/* Secondary image hover effect if available */}
        {product.images[1] && (
          <PlantImage
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            onClick={() => navigate(`/product/${product.slug}`)}
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
          />
        )}

        {/* Badges Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.bestseller && (
            <span className="bg-[#1F3B22] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-[0.16em] flex items-center gap-1 shadow-xs">
              <span className="text-amber-300">★</span> Botanical Pick
            </span>
          )}
          {product.newArrival && (
            <span className="bg-[#141414] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-[0.16em] shadow-xs">
              New Harvest
            </span>
          )}
          {discountPercent && (
            <span className="bg-[#8A5B38] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-[0.16em] shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-[#6B6B6B] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-[0.16em]">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button Top Right */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 border border-black/5 shadow-xs ${
            isLiked
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 backdrop-blur-xs text-[#4A4A4A] hover:text-[#1F3B22] hover:bg-white hover:scale-110'
          }`}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Quick View Button Overlay */}
        {onQuickView && !isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 pill-btn-light text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Eye className="w-3 h-3" />
            Quick View
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Botanical tags / Light hint */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#787878] mb-1.5">
            <span className="truncate flex items-center gap-1">
              <Sun className="w-3 h-3 text-[#1F3B22]" />
              {product.lightRequirement}
            </span>
            <span>•</span>
            <span className="truncate">{product.plantSize}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigate(`/product/${product.slug}`)}
            className="font-editorial font-bold text-[#141414] text-base leading-snug group-hover:text-[#1F3B22] transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#636363] mt-1 line-clamp-1">
            {product.shortDescription}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-[#1F3B22] text-xs">
              <Star className="w-3 h-3 fill-[#1F3B22] text-[#1F3B22]" />
              <span className="ml-1 font-semibold text-[#141414]">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-[#7A7A7A]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3.5 border-t border-[#E8E5DD] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#141414]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-[#8A8A8A] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] font-bold text-[#8A5B38] uppercase tracking-wider block mt-0.5">
                Only {product.stock} available
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
              isOutOfStock
                ? 'bg-[#EAE8E4] text-[#8A8A8A] cursor-not-allowed'
                : 'bg-[#1F3B22] text-white hover:bg-[#162B19] shadow-xs active:scale-90 hover:scale-105'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
