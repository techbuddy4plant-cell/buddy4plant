import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Sun, Droplets, ShieldCheck, Check } from 'lucide-react';
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

  const potOptions = ['Ivory White', 'Terracotta Red', 'Sage Green', 'Matte Charcoal'];

  const isPlantCare =
    product.category === 'plant-care' ||
    ['fertilizers', 'pest-control', 'potting-soil', 'growth-boosters'].includes(product.category) ||
    Boolean(product.weightVolume) ||
    Boolean(product.weightOptions && product.weightOptions.length > 0);

  const weightList = product.weightOptions && product.weightOptions.length > 0
    ? product.weightOptions
    : (product.weightVolume ? [product.weightVolume] : ['250 gm', '500 gm', '1 kg', '5 kg']);

  const sizeList = product.availableSizes && product.availableSizes.length > 0
    ? product.availableSizes
    : (product.plantSize ? [product.plantSize] : ['Small (4-8")', 'Medium (9-15")', 'Large (16-28")']);

  const computeUnitPrice = () => {
    if (!isPlantCare) return product.price;
    const base = product.price;
    const wt = selectedWeight.toLowerCase();
    if (wt.includes('250') || wt.includes('200')) return Math.round(base * 0.45);
    if (wt.includes('500') || wt.includes('400')) return Math.round(base * 0.65);
    if (wt.includes('1 kg') || wt.includes('1kg') || wt.includes('1 l') || wt.includes('1l')) return base;
    if (wt.includes('2 kg') || wt.includes('2kg') || wt.includes('2 l')) return Math.round(base * 1.85);
    if (wt.includes('5 kg') || wt.includes('5kg') || wt.includes('5 l')) return Math.round(base * 4.2);
    return base;
  };

  const currentUnitPrice = computeUnitPrice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        id="quick-view-modal"
        className="relative bg-[#FDFCF9] border border-[#E5E2D9] shadow-2xl max-w-3xl w-full overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row animate-fadeIn"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-[#F5F2EB] text-[#1A1A1A] hover:bg-[#E5E2D9] flex items-center justify-center transition-colors border border-[#E5E2D9]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Gallery */}
        <div className="md:w-1/2 bg-[#F5F2EB] p-6 flex flex-col justify-between">
          <div className="aspect-square w-full overflow-hidden bg-white border border-[#E5E2D9]">
            <PlantImage
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-14 h-14 overflow-hidden border shrink-0 transition-all ${
                    selectedImage === idx ? 'border-[#2D4A27] shadow-xs' : 'border-[#E5E2D9] opacity-70'
                  }`}
                >
                  <PlantImage src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-[#FDFCF9]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#2D4A27] uppercase tracking-[0.25em]">
              <span>{product.plantType}</span>
              <span>•</span>
              <span>{product.location}</span>
            </div>

            <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] mt-1">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-[#2D4A27] text-xs">
                <Star className="w-3.5 h-3.5 fill-[#2D4A27] text-[#2D4A27]" />
                <span className="ml-1 font-bold text-[#1A1A1A]">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-[#7A7A7A]">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl font-bold text-[#1A1A1A]">
                ₹{currentUnitPrice.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-[#8A8A8A] line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent && (
                <span className="text-[10px] font-bold text-[#8B5E3C] bg-[#8B5E3C]/10 px-2 py-0.5 uppercase tracking-wider">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <p className="text-xs text-[#5A5A5A] mt-3 leading-relaxed font-light">
              {product.shortDescription}
            </p>

            {/* Pack Size / Fertilizer Weight or Plant Size */}
            {isPlantCare ? (
              <div className="mt-4 pt-3 border-t border-[#E5E2D9]">
                <label className="text-xs font-bold text-[#1F4522] block mb-2">
                  Pack Quantity: <span className="text-[#141414] font-extrabold">{selectedWeight}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {weightList.map((wt) => (
                    <button
                      key={wt}
                      type="button"
                      onClick={() => setSelectedWeight(wt)}
                      className={`px-3 py-1 text-xs font-bold rounded border transition-all flex items-center gap-1 ${
                        selectedWeight === wt
                          ? 'border-[#1F4522] bg-[#1F4522] text-white shadow-xs'
                          : 'border-[#DDD9CF] bg-white text-[#1A1A1A] hover:border-[#1F4522]'
                      }`}
                    >
                      {selectedWeight === wt && <Check className="w-3 h-3 text-white" />}
                      {wt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 pt-3 border-t border-[#E5E2D9]">
                  <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
                    Plant Size: <span className="text-[#1F3B22] font-semibold">{selectedSize}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizeList.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-all flex items-center gap-1 ${
                          selectedSize === sz
                            ? 'border-[#1F3B22] bg-[#1F3B22] text-white shadow-xs'
                            : 'border-[#DDD9CF] bg-white text-[#1A1A1A] hover:border-[#1F3B22]'
                        }`}
                      >
                        {selectedSize === sz && <Check className="w-3 h-3 text-white" />}
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#E5E2D9]">
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-2">
                    Planter Finish: <span className="font-normal text-[#5A5A5A]">{selectedPotColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {potOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedPotColor(color)}
                        className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                          selectedPotColor === color
                            ? 'border-[#2D4A27] bg-[#2D4A27] text-white font-semibold'
                            : 'border-[#E5E2D9] text-[#1A1A1A] hover:border-[#2D4A27]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-[#F5F2EB] border border-[#E5E2D9] text-xs text-[#5A5A5A]">
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-[#2D4A27]" />
                <span>{product.lightRequirement}</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-[#2D4A27]" />
                <span>{product.wateringFrequency}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 pt-4 border-t border-[#E5E2D9]">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center border border-[#E5E2D9] overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-[#1A1A1A] hover:bg-[#F5F2EB] font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-[#1A1A1A] min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-[#1A1A1A] hover:bg-[#F5F2EB] font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={() => {
                  addToCart(product, quantity, isPlantCare ? undefined : selectedPotColor, isPlantCare ? undefined : selectedSize, isPlantCare ? selectedWeight : undefined, currentUnitPrice);
                  onClose();
                }}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-4 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 border transition-colors ${
                  isLiked
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-[#E5E2D9] text-[#1A1A1A] hover:text-[#2D4A27] hover:border-[#2D4A27]'
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
              className="mt-3 text-[11px] uppercase tracking-wider text-center w-full text-[#2D4A27] font-bold hover:underline block"
            >
              View Full Product Specifications & Plant Care Guide &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
