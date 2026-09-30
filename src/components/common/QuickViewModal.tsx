import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Sun, Droplets } from './Icons';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { PlantImage } from '../../utils/imageFallback';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, navigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedPotColor, setSelectedPotColor] = useState<string>('Ivory White');
  const [selectedWeight, setSelectedWeight] = useState<string>(product?.weightVolume || '1 kg');
  const [selectedSize, setSelectedSize] = useState<string>(product?.plantSize || 'Medium (9-15")');

  if (!product) return null;

  const isLiked = isInWishlist(product.id);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const potOptions = product.colorOptions && product.colorOptions.length > 0 ? product.colorOptions : ['Ivory White', 'Terracotta Red', 'Sage Green', 'Matte Charcoal'];
  const showColours = !!product.showColourOptions;

  const isPlantCare =
    product.category === 'plant-care' ||
    ['fertilizers', 'pest-control', 'potting-soil', 'growth-boosters'].includes(product.category) ||
    Boolean(product.weightVolume) ||
    Boolean(product.variants && product.variants.length > 0) ||
    Boolean(product.weightOptions && product.weightOptions.length > 0);

  const activeVariants = (product.variants && product.variants.length > 0)
    ? product.variants
    : (product.weightOptions && product.weightOptions.length > 0)
    ? product.weightOptions.map((opt, i) => {
        const ratio = i === 0 ? 1 : i === 1 ? 1.75 : i === 2 ? 3.25 : 5.5;
        const price = Math.round(product.price * ratio);
        return {
          size: opt,
          price,
          compareAtPrice: product.compareAtPrice ? Math.round(product.compareAtPrice * ratio) : Math.round(price * 1.4),
        };
      })
    : [
        {
          size: product.weightVolume || product.plantSize || '1 KG',
          price: product.price,
          compareAtPrice: product.compareAtPrice,
        },
      ];

  const currentVariant = activeVariants.find((v) => v.size.toLowerCase() === selectedWeight.toLowerCase()) || activeVariants[0];
  const currentUnitPrice = isPlantCare ? currentVariant.price : product.price;
  const currentComparePrice = isPlantCare ? (currentVariant.compareAtPrice || product.compareAtPrice) : product.compareAtPrice;
  const weightList = activeVariants.map((v) => v.size);

  const sizeList = product.availableSizes && product.availableSizes.length > 0
    ? product.availableSizes
    : (product.plantSize ? [product.plantSize] : ['Small (4-8")', 'Medium (9-15")', 'Large (16-28")']);

  // Show (and add to cart) a size this product actually offers
  const activeSize = sizeList.includes(selectedSize) ? selectedSize : sizeList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={product.name}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#0F1A11]/55 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div
        id="quick-view-modal"
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-[#FDFBF7] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] md:flex-row animate-fadeIn"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#13301B] shadow-md transition-transform hover:scale-105"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gallery */}
        <div className="flex flex-col gap-3 bg-[#F3EEE4] p-4 sm:p-6 md:w-[46%]">
          <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-white shadow-[0_14px_32px_-22px_rgba(19,48,27,0.5)]">
            <PlantImage
              key={selectedImage}
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover animate-fadeIn"
            />
            {discountPercent && (
              <span className="absolute right-3 top-3 rounded-full bg-[#D62B1F] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                {discountPercent}% Off
              </span>
            )}
            {product.bestseller && (
              <span className="absolute left-3 top-3 rounded-full bg-[#FFD54A] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1A1A1A]">
                Bestseller
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`Show photo ${idx + 1}`}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl transition-all ${
                    selectedImage === idx ? 'ring-2 ring-[#1E9E57] ring-offset-2 ring-offset-[#F3EEE4]' : 'opacity-70 ring-1 ring-[#E0D9CB] hover:opacity-100'
                  }`}
                >
                  <PlantImage src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col overflow-y-auto p-5 sm:p-8 md:w-[54%]">
          <div>
            <p className="pr-12 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B7A55]">
              {[product.plantType, product.location].filter(Boolean).join(' · ')}
            </p>
            <h2 className="mt-2 pr-10 font-serif text-2xl sm:text-[2rem] font-semibold leading-tight text-[#13301B]">{product.name}</h2>
            {product.shortDescription && (
              <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-[#4F4F4F]">{product.shortDescription}</p>
            )}

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl sm:text-3xl font-semibold text-[#141414]">₹{currentUnitPrice.toLocaleString('en-IN')}</span>
              {currentComparePrice && currentComparePrice > currentUnitPrice && (
                <span className="text-base text-[#9A9A9A] line-through">₹{currentComparePrice.toLocaleString('en-IN')}</span>
              )}
              <span className="text-[11px] text-[#7A7A7A]">Incl. of all taxes</span>
            </div>

            {isPlantCare ? (
              <div className="mt-5 border-t border-[#E6E0D3] pt-5">
                <p className="mb-3 font-serif text-lg font-medium text-[#13301B]">
                  Select Pack Size <span className="font-sans text-sm font-normal text-[#5A5A5A]">· {selectedWeight}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {weightList.map((wt) => (
                    <button key={wt} type="button" onClick={() => setSelectedWeight(wt)} className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                          selectedWeight === wt
                            ? 'border-[#1E9E57] bg-[#1E9E57] text-white shadow-[0_8px_18px_-10px_rgba(30,158,87,0.9)]'
                            : 'border-[#E0D9CB] bg-white text-[#1A1A1A] hover:border-[#1E9E57]'
                        }`}>
                      {wt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 border-t border-[#E6E0D3] pt-5">
                  <p className="mb-3 font-serif text-lg font-medium text-[#13301B]">
                    Select Plant Size <span className="font-sans text-sm font-normal text-[#5A5A5A]">· {activeSize}</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {sizeList.map((sz) => (
                      <button key={sz} type="button" onClick={() => setSelectedSize(sz)} className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                          activeSize === sz
                            ? 'border-[#1E9E57] bg-[#1E9E57] text-white shadow-[0_8px_18px_-10px_rgba(30,158,87,0.9)]'
                            : 'border-[#E0D9CB] bg-white text-[#1A1A1A] hover:border-[#1E9E57]'
                        }`}>
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {showColours && (
                <div className="mt-5">
                  <p className="mb-3 font-serif text-lg font-medium text-[#13301B]">
                    Select Planter Finish <span className="font-sans text-sm font-normal text-[#5A5A5A]">· {potOptions.includes(selectedPotColor) ? selectedPotColor : potOptions[0]}</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {potOptions.map((color) => (
                      <button key={color} type="button" onClick={() => setSelectedPotColor(color)} className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                          (potOptions.includes(selectedPotColor) ? selectedPotColor : potOptions[0]) === color
                            ? 'border-[#1E9E57] bg-[#1E9E57] text-white shadow-[0_8px_18px_-10px_rgba(30,158,87,0.9)]'
                            : 'border-[#E0D9CB] bg-white text-[#1A1A1A] hover:border-[#1E9E57]'
                        }`}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                )}
              </>
            )}

            {/* Care at a glance */}
            {(product.lightRequirement || product.wateringFrequency) && (
              <div className="mt-5 grid grid-cols-2 gap-2.5 text-sm text-[#3F3F3F]">
                {product.lightRequirement && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-[#F3EEE4] px-3.5 py-3">
                    <Sun className="w-4 h-4 text-[#1E9E57]" />
                    <span>{product.lightRequirement}</span>
                  </div>
                )}
                {product.wateringFrequency && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-[#F3EEE4] px-3.5 py-3">
                    <Droplets className="w-4 h-4 text-[#1E9E57]" />
                    <span>{product.wateringFrequency}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 border-t border-[#E6E0D3] pt-5">
            <div className="flex items-center gap-2.5">
              <div className="flex shrink-0 items-center overflow-hidden rounded-full border border-[#E0D9CB] bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-3 font-bold text-[#1A1A1A] hover:bg-[#F3EEE4]" aria-label="Decrease quantity">
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-[#1A1A1A]">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3.5 py-3 font-bold text-[#1A1A1A] hover:bg-[#F3EEE4]" aria-label="Increase quantity">
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  addToCart(product, quantity, isPlantCare || !showColours ? undefined : (potOptions.includes(selectedPotColor) ? selectedPotColor : potOptions[0]), isPlantCare ? undefined : activeSize, isPlantCare ? currentVariant.size : undefined, currentUnitPrice);
                  onClose();
                }}
                disabled={product.stock <= 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#13301B] px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_12px_24px_-14px_rgba(19,48,27,0.8)] transition-all hover:bg-[#1F4A2B] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#A7A7A7]"
              >
                <ShoppingBag className="w-4 h-4" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isLiked ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-[#E0D9CB] bg-white text-[#1A1A1A] hover:border-[#1E9E57] hover:text-[#1E9E57]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => {
                navigate(`/product/${product.slug}`);
                onClose();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#1E7A45] hover:underline"
            >
              View full details &amp; care guide <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
