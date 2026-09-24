import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  Tag,
  ShieldCheck,
  Check,
  Leaf
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { PlantImage } from '../../utils/imageFallback';

interface CartDrawerProps {
  navigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shippingCharge,
    tax,
    total,
    appliedCoupon,
    couponMessage,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const { settings } = useStoreSettings();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartDrawerOpen) return null;

  const freeDeliveryThreshold = settings.freeDeliveryThreshold || 999;
  const neededForFreeShipping = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCouponCode(couponInput);
    setCouponLoading(false);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          id="cart-drawer-container"
          className="w-screen max-w-md bg-[#FAF9F5] shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#E5E2D9]"
        >
          {/* Header */}
          <div className="p-6 bg-white border-b border-[#EAE7E0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#1F3B22]" />
              <h2 className="font-editorial text-xl font-bold text-[#141414]">Your Plant Basket</h2>
              <span className="text-[10px] bg-[#1F3B22]/10 text-[#1F3B22] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {itemCount} {itemCount === 1 ? 'specimen' : 'specimens'}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-[#F2EFE8] flex items-center justify-center text-[#555555] hover:text-[#141414] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Minimalist Free Shipping Progress Bar */}
          <div className="bg-[#F3F1EB] px-6 py-3.5 border-b border-[#E5E2D9] text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[#333333] font-medium">
                <Truck className="w-3.5 h-3.5 text-[#1F3B22]" />
                {neededForFreeShipping === 0 ? (
                  <span className="text-[#1F3B22] font-bold">
                    You have unlocked complimentary express transit!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#1F3B22]">₹{neededForFreeShipping}</strong> more for complimentary delivery
                  </span>
                )}
              </span>
              <span className="text-[10px] text-[#7A7A7A] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E0DDD3] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1F3B22] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Body: Cart items list or empty state */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-16 h-16 bg-[#F0EDE4] text-[#1F3B22] rounded-full flex items-center justify-center mx-auto text-xl mb-4 border border-[#E0DDD3]">
                  <Leaf className="w-7 h-7 text-[#1F3B22]" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#141414]">Your Basket is Empty</h3>
                <p className="text-xs sm:text-sm text-[#666666] mt-2 max-w-xs mx-auto leading-relaxed">
                  Discover living houseplants cultivated to bring serene balance to your spaces.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/plants');
                  }}
                  className="mt-6 pill-btn-dark px-7 py-3 text-xs uppercase tracking-wider font-bold"
                >
                  Explore Plant Nursery &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-4 bg-white rounded-2xl border border-[#E5E2D9] flex gap-4 items-center transition-all hover:border-[#1F3B22]/30"
                  >
                    <PlantImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      onClick={() => {
                        setIsCartDrawerOpen(false);
                        navigate(`/product/${item.product.slug}`);
                      }}
                      className="w-18 h-18 rounded-xl object-cover border border-[#EAE7DF] cursor-pointer shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4
                            onClick={() => {
                              setIsCartDrawerOpen(false);
                              navigate(`/product/${item.product.slug}`);
                            }}
                            className="font-editorial font-bold text-sm text-[#141414] truncate hover:text-[#1F3B22] cursor-pointer"
                          >
                            {item.product.name}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedWeight && (
                              <span className="text-[10px] font-bold bg-[#EBF7EE] text-[#1F4522] border border-[#BDE8C6] px-1.5 py-0.5 rounded">
                                Pack: {item.selectedWeight}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="text-[10px] font-semibold bg-[#F5F2EB] text-[#1A1A1A] border border-[#E5E2D9] px-1.5 py-0.5 rounded">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedPotColor && (
                              <span className="text-[10px] text-[#7A7A7A] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#EAE7DF]">
                                Planter: {item.selectedPotColor}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#999999] hover:text-rose-600 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Pill */}
                        <div className="flex items-center border border-[#DDD9CF] bg-[#FAF9F5] rounded-full px-2 py-0.5 text-xs">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#141414] hover:text-[#1F3B22] font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-[#141414] min-w-6 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-5 h-5 flex items-center justify-center text-[#141414] hover:text-[#1F3B22] font-bold disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#141414]">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Calculations and Checkout */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#EAE7DF] space-y-4">
              {/* Minimal Coupon Input */}
              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#E5E2D9]">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#1F3B22] font-bold">
                      <Tag className="w-3.5 h-3.5 text-[#1F3B22]" />
                      <span>{appliedCoupon.code} applied (-₹{discount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#8A8A8A] hover:text-rose-600 text-[10px] font-bold uppercase underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon / Promo Code"
                      className="grow bg-white border border-[#DDD9CF] px-3.5 py-1.5 rounded-full text-xs text-[#141414] uppercase placeholder-normal placeholder-[#8A8A8A] focus:outline-none focus:border-[#1F3B22]"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="pill-btn-light px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p className="text-[11px] text-rose-600 mt-1.5 pl-1">{couponMessage}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#5C5C5C] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#141414]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#1F3B22]">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Transit</span>
                  <span>{shippingCharge === 0 ? <strong className="text-[#1F3B22]">Complimentary</strong> : `₹${shippingCharge}`}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>GST (Estimated)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#EAE7DF] text-base font-bold text-[#141414]">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Proceed to Checkout Pill Button */}
              <button
                id="drawer-checkout-btn"
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigate('/checkout');
                }}
                className="w-full pill-btn-dark py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-[#7A7A7A] pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#1F3B22]" /> 14-Day Health Warranty
                </span>
                <span>•</span>
                <span>Biodegradable Eco-Crates</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
