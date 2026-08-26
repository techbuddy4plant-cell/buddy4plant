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
  Plus
} from 'lucide-react';
import { Product } from '../../types';
import { getProductBySlug, getProducts } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ImageGallery } from './ImageGallery';
import { CareSpecsCard } from './CareSpecsCard';
import { ReviewList } from './ReviewList';
import { PincodeChecker } from '../common/PincodeChecker';
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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedPotColor, setSelectedPotColor] = useState('Ivory White');
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'reviews'>('specs');

  const potOptions = ['Ivory White', 'Terracotta Red', 'Sage Green', 'Matte Charcoal'];

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      setLoading(false);
      if (p) {
        getProducts(p.category).then((all) => {
          setRelatedProducts(all.filter((item) => item.id !== p.id).slice(0, 4));
        });
      }
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-900 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-600">Nurturing botanical details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 py-20 text-center">
        <h2 className="font-serif font-bold text-2xl text-stone-900">Plant Not Found</h2>
        <p className="text-xs text-stone-500 mt-2">The plant specimen you are looking for is currently unavailable.</p>
        <button
          onClick={() => navigate('/plants')}
          className="mt-6 px-6 py-2.5 bg-emerald-950 text-white rounded-xl text-xs font-semibold"
        >
          Explore Catalogue &rarr;
        </button>
      </div>
    );
  }

  const isLiked = isInWishlist(product.id);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedPotColor);
    navigate('/checkout');
  };

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A] mb-6">
          <button onClick={() => navigate('/')} className="hover:text-[#1A1A1A]">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/plants/${product.category}`)} className="hover:text-[#1A1A1A] capitalize">
            {product.category.replace('-', ' ')}
          </button>
          <span>/</span>
          <span className="font-semibold text-[#1A1A1A]">{product.name}</span>
        </div>

        {/* Top Product View: Gallery + Buy Section */}
        <div className="bg-white p-6 sm:p-10 border border-[#E5E2D9] grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Gallery (6 cols) */}
          <div className="lg:col-span-6">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right: Product Purchase Details (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Badges & Tags */}
              <div className="flex items-center gap-2 mb-2">
                {product.bestseller && (
                  <span className="bg-[#8B5E3C]/10 text-[#8B5E3C] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    Bestseller
                  </span>
                )}
                {product.newArrival && (
                  <span className="bg-[#2D4A27]/10 text-[#2D4A27] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    New Arrival
                  </span>
                )}
                <span className="text-[10px] text-[#7A7A7A] font-mono">SKU: {product.sku}</span>
              </div>

              {/* Title & Short Description */}
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1A1A] leading-tight">
                {product.name}
              </h1>

              {/* Star rating */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center text-[#2D4A27] text-xs">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(product.rating) ? 'fill-[#2D4A27] text-[#2D4A27]' : 'text-[#E5E2D9]'
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 font-bold text-[#1A1A1A]">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-[#7A7A7A]">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mt-4 pt-4 border-t border-[#E5E2D9]">
                <span className="font-serif font-bold text-3xl text-[#1A1A1A]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-base text-[#8A8A8A] line-through">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-[10px] font-bold text-[#8B5E3C] bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 px-2 py-0.5 uppercase tracking-wider">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7A7A7A] mt-1">Inclusive of all taxes & 7-day botanical warranty</p>

              <p className="text-xs text-[#5A5A5A] mt-4 leading-relaxed font-light">
                {product.description || product.shortDescription}
              </p>

              {/* Planter Finish / Color options */}
              <div className="mt-6 pt-5 border-t border-[#E5E2D9]">
                <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
                  Planter Finish: <span className="font-normal text-[#5A5A5A]">{selectedPotColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {potOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedPotColor(color)}
                      className={`px-3.5 py-2 text-xs font-medium border transition-all ${
                        selectedPotColor === color
                          ? 'border-[#2D4A27] bg-[#2D4A27] text-white font-semibold'
                          : 'border-[#E5E2D9] bg-white text-[#1A1A1A] hover:border-[#2D4A27]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Stock */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center border border-[#E5E2D9] overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-[#1A1A1A] hover:bg-[#F5F2EB] font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-[#1A1A1A] min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3.5 py-2 text-[#1A1A1A] hover:bg-[#F5F2EB] font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <div>
                  {product.stock > 0 ? (
                    <span className="text-xs font-semibold text-[#2D4A27] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock & Nursery Ready ({product.stock} units)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-700">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    addToCart(product, quantity, selectedPotColor);
                    setIsCartDrawerOpen(true);
                  }}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3.5 px-6 bg-[#2D4A27] hover:bg-[#1F341C] text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3.5 px-6 bg-[#1A1A1A] hover:bg-[#333333] text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 text-[#A3B899]" />
                  Buy Now
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 border transition-colors ${
                    isLiked
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-[#E5E2D9] text-[#1A1A1A] hover:text-[#2D4A27] hover:border-[#2D4A27]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                </button>
              </div>

              {/* Pincode Estimator */}
              <div className="mt-6">
                <PincodeChecker />
              </div>
            </div>

            {/* Quick Guarantees footer */}
            <div className="pt-4 border-t border-[#E5E2D9] grid grid-cols-2 gap-3 text-[11px] text-[#5A5A5A]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D4A27] shrink-0" />
                <span>7-Day Free Plant Replacement</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2D4A27] shrink-0" />
                <span>Zero-Spill Transit Packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Care Specifications / Customer Reviews */}
        <div className="mt-12 bg-white p-6 sm:p-10 border border-[#E5E2D9]">
          <div className="flex border-b border-[#E5E2D9] gap-8 mb-8 text-xs uppercase tracking-wider font-bold">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 transition-colors ${
                activeTab === 'specs'
                  ? 'border-b-2 border-[#2D4A27] text-[#2D4A27]'
                  : 'text-[#7A7A7A] hover:text-[#1A1A1A]'
              }`}
            >
              Botanical Care & Specs
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-[#2D4A27] text-[#2D4A27]'
                  : 'text-[#7A7A7A] hover:text-[#1A1A1A]'
              }`}
            >
              Customer Reviews ({product.reviewCount})
            </button>
          </div>

          {activeTab === 'specs' && <CareSpecsCard product={product} />}
          {activeTab === 'reviews' && <ReviewList product={product} />}
        </div>

        {/* Related / Similar Plants */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold text-[#2D4A27] uppercase tracking-[0.25em]">Recommendations</span>
              <h3 className="font-serif font-bold text-2xl text-[#1A1A1A] mt-1">
                You May Also Love
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
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
