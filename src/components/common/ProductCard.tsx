import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Sun, Droplets } from 'lucide-react';
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
      className="group relative bg-white border border-[#E5E2D9] overflow-hidden transition-all duration-300 flex flex-col justify-between hover:border-[#2D4A27]/40"
    >
      {/* Image & Badges Container */}
      <div className="relative aspect-square w-full bg-[#F5F2EB] overflow-hidden cursor-pointer">
        <PlantImage
          src={product.images[0]}
          alt={product.name}
          onClick={() => navigate(`/product/${product.slug}`)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Secondary image hover effect if available */}
        {product.images[1] && (
          <PlantImage
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            onClick={() => navigate(`/product/${product.slug}`)}
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Badges Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.bestseller && (
            <span className="bg-[#2D4A27] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-[0.2em]">
              Bestseller
            </span>
          )}
          {product.newArrival && (
            <span className="bg-[#1A1A1A] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-[0.2em]">
              New
            </span>
          )}
          {discountPercent && (
            <span className="bg-[#8B5E3C] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-[0.2em]">
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-[#5A5A5A] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-[0.2em]">
              Out of Stock
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
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
            isLiked
              ? 'bg-rose-50 text-rose-600 shadow-xs'
              : 'bg-[#FDFCF9]/90 text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-white'
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
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#FDFCF9]/95 border border-[#E5E2D9] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-[#2D4A27] hover:text-white flex items-center gap-1.5"
          >
            <Eye className="w-3 h-3" />
            Quick View
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Botanical tags / Light hint */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#7A7A7A] mb-1.5">
            <span className="truncate flex items-center gap-1">
              <Sun className="w-3 h-3 text-[#2D4A27]" />
              {product.lightRequirement}
            </span>
            <span>•</span>
            <span className="truncate">{product.plantSize}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigate(`/product/${product.slug}`)}
            className="font-serif font-bold text-[#1A1A1A] text-base leading-snug group-hover:text-[#2D4A27] transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#5A5A5A] mt-1 line-clamp-1">
            {product.shortDescription}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-[#2D4A27] text-xs">
              <Star className="w-3 h-3 fill-[#2D4A27] text-[#2D4A27]" />
              <span className="ml-1 font-semibold text-[#1A1A1A]">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-[#7A7A7A]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#1A1A1A]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-[#8A8A8A] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider block">
                Only {product.stock} left!
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`p-2.5 transition-all flex items-center justify-center ${
              isOutOfStock
                ? 'bg-[#EAE8E4] text-[#8A8A8A] cursor-not-allowed'
                : 'bg-[#2D4A27] text-white hover:bg-[#1F341C] shadow-xs active:scale-95'
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
