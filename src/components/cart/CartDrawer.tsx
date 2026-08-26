import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  Tag,
  ShieldCheck,
  Plus,
  Check
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
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

  const { user, openAuthModal } = useAuth();
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-container"
          className="w-screen max-w-md bg-[#FDFCF9] shadow-2xl flex flex-col justify-between overflow-hidden animate-fadeIn"
        >
          {/* Header */}
          <div className="p-5 bg-white border-b border-[#E5E2D9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#2D4A27]" />
              <h2 className="font-serif font-bold text-lg text-[#1A1A1A]">Your Plant Cart</h2>
              <span className="text-[10px] bg-[#2D4A27]/10 text-[#2D4A27] font-bold px-2 py-0.5 uppercase tracking-wider">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1 text-[#7A7A7A] hover:text-[#1A1A1A]"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#1A1A1A] text-[#FDFCF9] p-3.5 px-5 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 font-normal">
                <Truck className="w-3.5 h-3.5 text-[#A3B899]" />
                {neededForFreeShipping === 0 ? (
                  <span className="text-[#A3B899] font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-gift text-emerald-300" />
                    You have qualified for FREE Express Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#A3B899]">₹{neededForFreeShipping}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-[#333333] h-1 overflow-hidden">
              <div
                className="bg-[#A3B899] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Body: Cart items list or empty state */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-14 h-14 bg-[#F5F2EB] text-[#2D4A27] flex items-center justify-center mx-auto text-xl mb-4 border border-[#E5E2D9]">
                  <i className="fa-solid fa-seedling text-[#2D4A27]" />
                </div>
                <h3 className="font-serif font-bold text-xl text-[#1A1A1A]">Your Cart is Empty</h3>
                <p className="text-xs text-[#5A5A5A] mt-2 max-w-xs mx-auto leading-relaxed font-light">
                  Bring green calm into your living room or office desk with our fresh nursery plants.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/plants');
                  }}
                  className="mt-6 px-6 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider transition-all"
                >
                  Explore Plants Catalogue &rarr;
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E2D9]">
                {items.map((item) => (
                  <div key={item.product.id} className="py-3.5 flex gap-3.5 items-start">
                    <PlantImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      onClick={() => {
                        setIsCartDrawerOpen(false);
                        navigate(`/product/${item.product.slug}`);
                      }}
                      className="w-16 h-16 object-cover border border-[#E5E2D9] cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4
                          onClick={() => {
                            setIsCartDrawerOpen(false);
                            navigate(`/product/${item.product.slug}`);
                          }}
                          className="font-serif font-semibold text-xs text-[#1A1A1A] truncate hover:text-[#2D4A27] cursor-pointer"
                        >
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#8A8A8A] hover:text-rose-600 p-0.5 ml-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedPotColor && (
                        <p className="text-[11px] text-[#7A7A7A] mt-0.5">
                          Pot: {item.selectedPotColor}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-[#E5E2D9] bg-white overflow-hidden text-xs">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-[#1A1A1A] hover:bg-[#F5F2EB] font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-bold text-[#1A1A1A] min-w-6 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2 py-0.5 text-[#1A1A1A] hover:bg-[#F5F2EB] font-bold disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-[#1A1A1A]">
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

          {/* Footer with Calculations and Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E5E2D9] space-y-3">
              {/* Coupon Form */}
              <div className="bg-[#F5F2EB] p-2.5 border border-[#E5E2D9]">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#2D4A27] font-bold">
                      <Tag className="w-3.5 h-3.5 text-[#2D4A27]" />
                      <span>{appliedCoupon.code} applied (-₹{discount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-rose-600 hover:underline text-[11px] font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 bg-white border border-[#E5E2D9] text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#2D4A27]"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-3.5 py-1.5 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#2D4A27]"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponMessage && !appliedCoupon && (
                  <p className="text-[10px] text-amber-700 mt-1.5">{couponMessage}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#5A5A5A]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1A1A1A]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#2D4A27] font-medium">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCharge === 0 ? (
                      <span className="text-[#2D4A27] font-bold uppercase text-[10px] tracking-wider">Free</span>
                    ) : (
                      `₹${shippingCharge}`
                    )}
                  </span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>GST ({settings.taxRatePercentage || 5}%)</span>
                    <span>₹{tax}</span>
                  </div>
                )}

                <div className="border-t border-[#E5E2D9] pt-2 flex justify-between text-sm font-bold text-[#1A1A1A]">
                  <span>Total Amount</span>
                  <span className="text-base text-[#1A1A1A]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              {!user ? (
                <button
                  id="drawer-signin-btn"
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-3.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <i className="fa-solid fa-right-to-bracket" />
                  Sign In to Checkout
                </button>
              ) : (
                <button
                  id="drawer-checkout-btn"
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-3.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  Proceed to Checkout (₹{total.toLocaleString('en-IN')})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
