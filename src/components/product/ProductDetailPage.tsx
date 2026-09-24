import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  Droplets,
  Sun,
  Leaf,
  CheckCircle2,
  ArrowRight,
  Package,
  Plus,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../../types';
import { getProductBySlug, getProducts } from '../../services/productService';
import { getProductReviews } from '../../services/reviewService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ImageGallery } from './ImageGallery';
import { CareSpecsCard } from './CareSpecsCard';
import { ReviewList } from './ReviewList';
import { ProductCard } from '../common/ProductCard';

interface ProductDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  navigate,
  onQuickView,
}) => {
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedPotColor, setSelectedPotColor] = useState('Ivory White');
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'reviews'>('specs');

  // Ugaoo-style Variant State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Delivery Estimate State
  const [deliveryPincode, setDeliveryPincode] = useState('282010');
  const [isPincodeChecked, setIsPincodeChecked] = useState(true);

  // Gift note state
  const [isGiftNote, setIsGiftNote] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const potOptions = ['Ivory White', 'Terracotta Red', 'Sage Green', 'Matte Charcoal'];

  const refreshReviews = (p: Product) => {
    getProductReviews(p.id, p.slug, p.name).then(setProductReviews);
  };

  const loadProductData = () => {
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      setLoading(false);
      if (p) {
        refreshReviews(p);
        getProducts(p.category).then((all) => {
          setRelatedProducts(all.filter((item) => item.id !== p.id).slice(0, 4));
        });
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    loadProductData();

    const handleStoreChange = () => {
      loadProductData();
    };

    window.addEventListener('b4p_store_data_changed', handleStoreChange);
    return () => {
      window.removeEventListener('b4p_store_data_changed', handleStoreChange);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-[#00A859] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-600">Nurturing botanical details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 py-20 text-center">
        <h2 className="font-serif font-bold text-2xl text-stone-900">Product Not Found</h2>
        <p className="text-xs text-stone-500 mt-2">The botanical specimen you are looking for is currently unavailable.</p>
        <button
          onClick={() => navigate('/collections/plant-care')}
          className="mt-6 px-6 py-2.5 bg-[#00A859] text-white rounded-xl text-xs font-semibold"
        >
          Explore Plant Care &rarr;
        </button>
      </div>
    );
  }

  const isPlantCare =
    product.category === 'plant-care' ||
    ['fertilizers', 'pest-control', 'potting-soil', 'growth-boosters'].includes(product.category) ||
    Boolean(product.weightVolume) ||
    Boolean(product.variants && product.variants.length > 0);

  // Compute active variants reactively
  const activeVariants: ProductVariant[] = (product.variants && product.variants.length > 0)
    ? product.variants
    : (product.weightOptions && product.weightOptions.length > 0)
    ? product.weightOptions.map((opt, i) => {
        const ratio = i === 0 ? 1 : i === 1 ? 1.75 : i === 2 ? 3.25 : 5.5;
        const price = Math.round(product.price * ratio);
        return {
          size: opt,
          price: price,
          compareAtPrice: product.compareAtPrice ? Math.round(product.compareAtPrice * ratio) : Math.round(price * 1.4),
          unitRate: opt.toLowerCase().includes('kg') ? `(₹${Math.round(price / (i === 0 ? 1 : i === 1 ? 5 : 10))}/kg)` : undefined,
        };
      })
    : [
        {
          size: product.weightVolume || product.plantSize || '1 KG',
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          unitRate: product.weightVolume?.toLowerCase().includes('kg') ? `₹${product.price}/kg` : undefined,
        },
      ];

  const currentVariant: ProductVariant = (() => {
    if (selectedVariant) {
      const match = activeVariants.find((v) => v.size.toLowerCase() === selectedVariant.size.toLowerCase());
      if (match) return match;
    }
    return activeVariants[0];
  })();

  const activePrice = currentVariant.price;
  const activeComparePrice = currentVariant.compareAtPrice || product.compareAtPrice;

  const isLiked = isInWishlist(product.id);
  const discountPercent =
    activeComparePrice && activeComparePrice > activePrice
      ? Math.round(((activeComparePrice - activePrice) / activeComparePrice) * 100)
      : null;

  const displayReviewCount = productReviews.length > 0 ? productReviews.length : product.reviewCount;
  const displayRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : product.rating;

  // Calculate dynamic delivery date (3 days from now)
  const deliveryDateObj = new Date();
  deliveryDateObj.setDate(deliveryDateObj.getDate() + 3);
  const formattedDeliveryDate = deliveryDateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const handleAddToCart = () => {
    addToCart(
      product,
      quantity,
      isPlantCare ? undefined : selectedPotColor,
      isPlantCare ? undefined : currentVariant.size,
      isPlantCare ? currentVariant.size : undefined,
      currentVariant.price
    );
    setIsCartDrawerOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(
      product,
      quantity,
      isPlantCare ? undefined : selectedPotColor,
      isPlantCare ? undefined : currentVariant.size,
      isPlantCare ? currentVariant.size : undefined,
      currentVariant.price
    );
    navigate('/checkout');
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-6 sm:py-10 text-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb matching Ugaoo */}
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A] mb-6">
          <button onClick={() => navigate('/')} className="hover:text-[#1A1A1A]">
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(isPlantCare ? '/collections/plant-care' : `/plants/${product.category}`)}
            className="hover:text-[#1A1A1A] capitalize"
          >
            {isPlantCare ? 'Plant Care' : product.category.replace('-', ' ')}
          </button>
          <span>/</span>
          <span className="font-semibold text-[#1A1A1A]">{product.name}</span>
        </div>

        {/* Top Product View: Gallery + Buy Section */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#E5E2D9] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 shadow-xs">
          {/* Left: Gallery (6 cols) */}
          <div className="lg:col-span-6">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right: Product Purchase Details (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              {/* Product Title */}
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#141414] leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Ugaoo-style Rating & Trust Banner */}
              <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-[#00A859]">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#00A859] text-[#00A859]" />
                  <span className="text-[#141414] font-bold">{displayRating.toFixed(1)}</span>
                  <span className="text-[#555555]">({displayReviewCount} reviews)</span>
                </div>
                <span className="text-[#CCCCCC]">|</span>
                <span className="text-[#141414] font-medium">1 Crore + Happy Customers</span>
              </div>

              {/* Ugaoo-style Pricing */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="font-editorial text-3xl sm:text-4xl font-extrabold text-[#141414]">
                  ₹ {activePrice.toLocaleString('en-IN')}
                </span>
                {activeComparePrice && activeComparePrice > activePrice && (
                  <span className="text-base text-[#888888] line-through">
                    ₹{activeComparePrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-[10px] font-bold text-[#00A859] bg-[#EBF8F1] border border-[#00A859]/30 px-2 py-0.5 rounded uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7A7A7A] mt-0.5">(Incl. of all taxes)</p>

              {/* Ugaoo-style SIZE Selector */}
              <div className="mt-5 pt-4 border-t border-[#EAE7DF]">
                <label className="text-xs font-extrabold text-[#141414] uppercase tracking-wider block mb-3">
                  SIZE
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {activeVariants.map((v) => {
                    const isSelected = currentVariant.size === v.size;
                    return (
                      <button
                        key={v.size}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`relative min-w-[72px] px-3.5 py-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#00A859] border-[#00A859] text-white shadow-sm'
                            : 'bg-white border-[#DDD9CF] text-[#141414] hover:border-[#00A859]'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00A859] text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                        <span className={`text-xs font-extrabold uppercase ${isSelected ? 'text-white' : 'text-[#141414]'}`}>
                          {v.size}
                        </span>
                        <span className={`text-[11px] font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-[#00A859]'}`}>
                          ₹{v.price.toLocaleString('en-IN')}
                        </span>
                        {v.unitRate && (
                          <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/85' : 'text-[#777777]'}`}>
                            {v.unitRate}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Planter finish (only for live plants) */}
              {!isPlantCare && (
                <div className="mt-4 pt-4 border-t border-[#EAE7DF]">
                  <label className="text-xs font-bold text-[#141414] block mb-2">
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
                            ? 'border-[#00A859] bg-[#00A859] text-white font-semibold'
                            : 'border-[#E5E2D9] bg-white text-[#1A1A1A] hover:border-[#00A859]'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Estimate */}
              <div className="mt-5 pt-4 border-t border-[#EAE7DF]">
                <label className="text-xs font-bold text-[#141414] block mb-2">Delivery Estimate</label>
                <div className="relative max-w-xs flex items-center">
                  <input
                    type="text"
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                    placeholder="Enter pincode"
                    className="w-full px-3 py-2 bg-white border border-[#DDD9CF] rounded-lg text-xs font-semibold text-[#141414] focus:outline-none focus:border-[#00A859]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPincodeChecked(true)}
                    className="absolute right-2.5 px-2 py-1 text-xs font-bold text-[#00A859] hover:underline"
                  >
                    Check
                  </button>
                </div>
                {isPincodeChecked && (
                  <div className="flex items-center gap-2 mt-2 text-xs font-medium text-[#222222]">
                    <span>🚚 Delivered by: <strong className="text-[#141414]">{formattedDeliveryDate}</strong></span>
                  </div>
                )}
              </div>

              {/* Gift Note Checkbox */}
              <div className="mt-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-[#333333] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGiftNote}
                    onChange={(e) => setIsGiftNote(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00A859] focus:ring-0 border-[#DDD9CF]"
                  />
                  <span>Make this a gift · Add a hand-written note free</span>
                </label>
                {isGiftNote && (
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Type your warm personalized gift message here..."
                    className="w-full mt-2.5 p-2.5 text-xs bg-[#FAF9F5] border border-[#DDD9CF] rounded-lg focus:outline-none focus:border-[#00A859]"
                    rows={2}
                  />
                )}
              </div>

              {/* Quantity & Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Quantity Pill */}
                <div className="flex items-center border border-[#DDD9CF] rounded-lg overflow-hidden bg-white shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2.5 text-sm font-bold text-[#141414] hover:bg-[#F5F2EB]"
                  >
                    −
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-[#141414] min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2.5 text-sm font-bold text-[#141414] hover:bg-[#F5F2EB]"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 bg-[#00A859] hover:bg-[#00924C] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  ADD TO CART
                </button>

                {/* Buy It Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 px-6 border-2 border-[#00A859] bg-white hover:bg-[#EAF8F1] text-[#00A859] font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  BUY IT NOW
                </button>

                {/* Wishlist Icon */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 border rounded-lg transition-colors shrink-0 ${
                    isLiked
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-[#DDD9CF] text-[#1A1A1A] hover:text-[#00A859] hover:border-[#00A859]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                </button>
              </div>

              {/* Offers for you Box */}
              <div className="mt-6 border border-dashed border-[#00A859]/70 rounded-xl bg-[#F6FBF7] p-4 space-y-2.5 text-xs">
                <div className="font-bold text-[#141414] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#00A859]" />
                  Offers for you:
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#E2EFE5]">
                  <span className="text-[#333333] font-medium">Get 10% off on above ₹1,499</span>
                  <button
                    type="button"
                    onClick={() => copyCouponCode('Save10')}
                    className="font-bold text-[#00A859] bg-white px-2 py-0.5 rounded border border-[#BDE8C6] flex items-center gap-1 hover:bg-[#DCF2E0] transition-colors"
                  >
                    {copiedCoupon ? 'Copied!' : 'Save10'}
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#E2EFE5]">
                  <span className="text-[#333333] font-medium">Free shipping on all orders above ₹499</span>
                  <span className="text-[10px] text-[#7A7A7A] italic">Offer applied at checkout</span>
                </div>
              </div>
            </div>

            {/* Quick Guarantees footer */}
            <div className="pt-4 border-t border-[#E5E2D9] grid grid-cols-2 gap-3 text-[11px] text-[#5A5A5A]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00A859] shrink-0" />
                <span>100% Organic & Quality Tested</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00A859] shrink-0" />
                <span>Secure Transit Packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Care Specifications / Customer Reviews */}
        <div className="mt-12 bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#E5E2D9] shadow-xs">
          <div className="flex border-b border-[#E5E2D9] gap-8 mb-8 text-xs uppercase tracking-wider font-bold">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 transition-colors ${
                activeTab === 'specs'
                  ? 'border-b-2 border-[#00A859] text-[#00A859]'
                  : 'text-[#7A7A7A] hover:text-[#1A1A1A]'
              }`}
            >
              Application & Care Specs
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-[#00A859] text-[#00A859]'
                  : 'text-[#7A7A7A] hover:text-[#1A1A1A]'
              }`}
            >
              Customer Reviews ({displayReviewCount})
            </button>
          </div>

          {activeTab === 'specs' && <CareSpecsCard product={product} />}
          {activeTab === 'reviews' && (
            <ReviewList
              productId={product.id}
              productName={product.name}
              reviews={productReviews}
              onReviewAdded={() => refreshReviews(product)}
            />
          )}
        </div>

        {/* Related Care / Plants */}
        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-editorial text-2xl font-bold text-[#141414]">
                You May Also Need
              </h3>
              <button
                onClick={() => navigate(isPlantCare ? '/collections/plant-care' : '/plants')}
                className="text-xs font-bold text-[#00A859] hover:underline"
              >
                View Collection &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} onQuickView={onQuickView} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
