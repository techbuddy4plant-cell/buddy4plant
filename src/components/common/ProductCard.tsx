import React from 'react';
import { Heart, ShoppingBag, Eye } from './Icons';
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

  const open = () => navigate(`/product/${product.slug}`);
  const POT_CATS = ['pots-planters', 'plastic-pots', 'ceramic-pots', 'hanging-planters', 'planter-stands', 'self-watering', 'terracotta-pots', 'metal-planters'];
  const CARE_CATS = ['plant-care', 'fertilizers', 'potting-soil', 'pest-control', 'garden-tools', 'watering-tools', 'garden-decor', 'growth-boosters'];
  const meta = POT_CATS.includes(product.category)
    ? [
        product.material || 'Planter',
        product.variants && product.variants.length > 1 ? `${product.variants.length} sizes` : '',
        product.colorOptions && product.colorOptions.length > 1 ? `${product.colorOptions.length} colours` : '',
      ]
    : CARE_CATS.includes(product.category) || product.weightVolume || (product.variants && product.variants.length > 0)
      ? [
          product.variants && product.variants.length > 1
            ? `${product.variants[0].size} (+${product.variants.length - 1} sizes)`
            : product.weightVolume || (product.variants && product.variants[0]?.size) || product.plantSize || '1 KG',
        ]
      : [product.lightRequirement, product.plantSize || 'Medium'];

  return (
    <div
      id={`product-card-${product.id}`}
      className="@container group relative flex flex-col overflow-hidden rounded-[22px] sm:rounded-[26px] bg-white shadow-[0_8px_24px_-12px_rgba(20,40,25,0.16)] ring-1 ring-[#E8DFD3] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-16px_rgba(20,40,25,0.28)]"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#EFE9DF] cursor-pointer" onClick={open}>
        <PlantImage
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        {product.images[1] && (
          <PlantImage
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
          />
        )}

        {/* Top left: status badge */}
        <div className="absolute left-2.5 top-2.5 sm:left-3.5 sm:top-3.5 z-10 flex flex-col items-start gap-1.5">
          {isOutOfStock ? (
            <span className="rounded-full bg-[#4A4A4A] px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              Sold Out
            </span>
          ) : product.bestseller ? (
            <span className="rounded-full bg-[#FCD34D] px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#182018] shadow-xs">
              Bestseller
            </span>
          ) : product.newArrival ? (
            <span className="rounded-full bg-[#16341F] px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              New
            </span>
          ) : null}
        </div>

        {/* Top right: discount badge */}
        {discountPercent && (
          <span className="absolute right-2.5 top-2.5 sm:right-3.5 sm:top-3.5 z-10 rounded-full bg-[#DC4437] px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
            {discountPercent}% Off
          </span>
        )}

        {/* Bottom right: wishlist & quick add */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3.5 sm:right-3.5 z-10 flex items-center gap-1.5">
          <button
            id={`wishlist-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full shadow-md transition-all hover:scale-105 active:scale-95 ${
              isLiked ? 'bg-rose-50 text-rose-600' : 'bg-white/95 text-[#16341F] hover:bg-white'
            }`}
            aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
          <button
            id={`add-to-cart-btn-${product.id}`}
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full shadow-md transition-all ${
              isOutOfStock ? 'cursor-not-allowed bg-white/80 text-[#9A9A9A]' : 'bg-white/95 text-[#16341F] hover:bg-white hover:scale-105 active:scale-95'
            }`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Bottom left: quick view (desktop hover) */}
        {onQuickView && !isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3.5 left-3.5 z-10 hidden items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#16341F] shadow-md opacity-0 transition-all group-hover:opacity-100 hover:bg-white sm:flex"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <p className="mb-1 truncate text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E8168]">
          {meta.filter(Boolean).join(' · ')}
        </p>
        <h3
          onClick={open}
          className="cursor-pointer font-serif text-[15px] sm:text-xl font-medium leading-snug text-[#182018] line-clamp-2 transition-colors group-hover:text-[#16341F]"
        >
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="mt-1.5 text-xs sm:text-[14px] leading-relaxed text-[#5C554B] line-clamp-1">{product.shortDescription}</p>
        )}

        <div className="mt-auto pt-3.5 sm:pt-4 flex flex-col gap-2.5 @min-[250px]:flex-row @min-[250px]:items-center @min-[250px]:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-base sm:text-xl font-bold text-[#182018]">
                {product.variants && product.variants.length > 1 ? <span className="text-xs font-normal text-[#7A746B]">From </span> : null}
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs sm:text-sm text-[#9A9388] line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#C25827]">Only {product.stock} left</span>
            )}
          </div>
          <button
            type="button"
            onClick={open}
            className="shrink-0 rounded-full bg-[#16341F] px-4 sm:px-5 py-2.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-[#20492C] shadow-xs active:scale-95"
          >
            View Product
          </button>
        </div>
      </div>
    </div>
  );
};
