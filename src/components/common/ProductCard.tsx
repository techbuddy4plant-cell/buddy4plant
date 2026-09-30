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
      className="@container group relative flex flex-col overflow-hidden rounded-[18px] sm:rounded-[22px] bg-white shadow-[0_10px_30px_-18px_rgba(19,48,27,0.35)] ring-1 ring-[#ECE6DA] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-20px_rgba(19,48,27,0.45)]"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F3EFE6] cursor-pointer" onClick={open}>
        <PlantImage
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {product.images[1] && (
          <PlantImage
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
          />
        )}

        {/* Top left: status */}
        <div className="absolute left-2.5 top-2.5 sm:left-3.5 sm:top-3.5 z-10 flex flex-col items-start gap-1.5">
          {isOutOfStock ? (
            <span className="rounded-full bg-[#4A4A4A] px-2.5 py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wide text-white">
              Sold Out
            </span>
          ) : product.bestseller ? (
            <span className="rounded-full bg-[#FFD54A] px-2.5 py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]">
              Bestseller
            </span>
          ) : product.newArrival ? (
            <span className="rounded-full bg-[#13301B] px-2.5 py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wide text-white">
              New
            </span>
          ) : null}
        </div>

        {/* Top right: discount */}
        {discountPercent && (
          <span className="absolute right-2.5 top-2.5 sm:right-3.5 sm:top-3.5 z-10 rounded-full bg-[#D62B1F] px-2.5 py-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-wide text-white">
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
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 ${
              isLiked ? 'bg-rose-50 text-rose-600' : 'bg-white/95 text-[#13301B]'
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
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full shadow-md transition-transform ${
              isOutOfStock ? 'cursor-not-allowed bg-white/80 text-[#9A9A9A]' : 'bg-white/95 text-[#13301B] hover:scale-105 active:scale-95'
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
            className="absolute bottom-3.5 left-3.5 z-10 hidden items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#13301B] shadow-md opacity-0 transition-opacity group-hover:opacity-100 sm:flex"
          >
            <Eye className="w-3.5 h-3.5" /> Quick View
          </button>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <p className="mb-1 truncate text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.12em] text-[#7A8A74]">
          {meta.filter(Boolean).join(' · ')}
        </p>
        <h3
          onClick={open}
          className="cursor-pointer font-serif text-[15px] sm:text-xl font-medium leading-snug text-[#141414] line-clamp-2 transition-colors group-hover:text-[#13301B]"
        >
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="mt-1.5 text-xs sm:text-[15px] leading-relaxed text-[#4F4F4F] line-clamp-1">{product.shortDescription}</p>
        )}

        <div className="mt-auto pt-3 sm:pt-4 flex flex-col gap-2.5 @min-[250px]:flex-row @min-[250px]:items-center @min-[250px]:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-base sm:text-xl font-semibold text-[#141414]">
                {product.variants && product.variants.length > 1 ? <span className="text-xs font-medium text-[#6B6B6B]">From </span> : null}
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs sm:text-base text-[#9A9A9A] line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#B4541F]">Only {product.stock} left</span>
            )}
          </div>
          <button
            type="button"
            onClick={open}
            className="shrink-0 rounded-full bg-[#13301B] px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[15px] font-semibold text-white transition-colors hover:bg-[#1F4A2B]"
          >
            View Product
          </button>
        </div>
      </div>
    </div>
  );
};
