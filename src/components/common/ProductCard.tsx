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
      className="group relative bg-[#FAF9F5] rounded-2xl sm:rounded-3xl border border-[#E5E2D9] overflow-hidden transition-all duration-500 flex flex-col justify-between hover:border-[#1F3B22]/40 hover:shadow-xl hover:-translate-y-1"
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
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {product.bestseller && (
            <span className="bg-[#1F3B22] text-white text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <span className="text-amber-300">★</span> <span className="hidden xs:inline">Pick</span>
            </span>
          )}
          {product.newArrival && (
            <span className="bg-[#141414] text-white text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              New
            </span>
          )}
          {discountPercent && (
            <span className="bg-[#8A5B38] text-white text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-[#6B6B6B] text-white text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider">
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
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all z-10 border border-black/5 shadow-xs ${
            isLiked
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 backdrop-blur-xs text-[#4A4A4A] hover:text-[#1F3B22] hover:bg-white hover:scale-110'
          }`}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Quick View Button Overlay */}
        {onQuickView && !isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 pill-btn-light text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-3 sm:px-4 py-1 sm:py-1.5 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 shadow-md whitespace-nowrap"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Quick</span> View
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Botanical tags / Light hint OR Fertilizer Weight */}
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider text-[#787878] mb-1">
            {product.category === 'plant-care' || ['fertilizers', 'pest-control', 'potting-soil'].includes(product.category) || product.weightVolume || (product.variants && product.variants.length > 0) ? (
              <span className="truncate flex items-center gap-1 font-bold text-[#1F4522] bg-[#EBF7EE] border border-[#BDE8C6] px-1.5 py-0.5 rounded">
                Pack: {product.variants && product.variants.length > 1
                  ? `${product.variants[0].size} (+${product.variants.length - 1} sizes)`
                  : (product.weightVolume || (product.variants && product.variants[0]?.size) || product.plantSize || '1 KG')}
              </span>
            ) : (
              <>
                <span className="truncate flex items-center gap-0.5">
                  <Sun className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#1F3B22]" />
                  {product.lightRequirement}
                </span>
                <span>•</span>
                <span className="truncate">{product.plantSize || 'Medium'}</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigate(`/product/${product.slug}`)}
            className="font-editorial font-bold text-[#141414] text-xs sm:text-base leading-snug group-hover:text-[#1F3B22] transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-[11px] sm:text-xs text-[#636363] mt-0.5 line-clamp-1 hidden xs:block">
            {product.shortDescription}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 sm:mt-2">
            <div className="flex items-center text-[#1F3B22] text-[10px] sm:text-xs">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#1F3B22] text-[#1F3B22]" />
              <span className="ml-0.5 sm:ml-1 font-semibold text-[#141414]">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[10px] text-[#7A7A7A]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3.5 border-t border-[#E8E5DD] flex items-center justify-between gap-1">
          <div>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-xs sm:text-base font-bold text-[#141414]">
                {product.variants && product.variants.length > 1 ? 'From ' : ''}₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-[#8A8A8A] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8A5B38] uppercase tracking-wider block">
                {product.stock} left
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all flex items-center justify-center shrink-0 ${
              isOutOfStock
                ? 'bg-[#EAE8E4] text-[#8A8A8A] cursor-not-allowed'
                : 'bg-[#1F3B22] text-white hover:bg-[#162B19] shadow-xs active:scale-90 hover:scale-105'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
