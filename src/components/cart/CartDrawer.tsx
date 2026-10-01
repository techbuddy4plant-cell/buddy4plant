import { useBackClose } from '../../hooks/useBackClose';
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
} from '../common/Icons';
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

  useBackClose(isCartDrawerOpen, () => setIsCartDrawerOpen(false));

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

  const close = () => setIsCartDrawerOpen(false);
  const go = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-[#0F1A11]/45 backdrop-blur-[2px] animate-fadeIn" onClick={close} />

      <aside
        id="cart-drawer-container"
        className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-[#FAF7F1] shadow-[-20px_0_60px_-30px_rgba(0,0,0,0.5)] animate-[b4pSlideIn_.32s_cubic-bezier(.22,1,.36,1)] sm:rounded-l-[28px] sm:overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#13301B]">Your Cart</h2>
            <p className="text-xs text-[#6B6B6B]">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#13301B] shadow-sm ring-1 ring-[#ECE6DA] hover:bg-[#F1ECE2]"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free delivery progress */}
        {items.length > 0 && (
          <div className="mx-5 sm:mx-6 mb-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#ECE6DA]">
            <p className="flex items-center gap-2 text-xs text-[#3F3F3F]">
              <Truck className="w-4 h-4 text-[#2D6A4F]" />
              {neededForFreeShipping === 0 ? (
                <span className="font-semibold text-[#13301B]">You get free delivery on this order</span>
              ) : (
                <span>
                  Add <strong className="text-[#13301B]">₹{neededForFreeShipping.toLocaleString('en-IN')}</strong> more for free delivery
                </span>
              )}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EDE7DA]">
              <div className="h-full rounded-full bg-[#1E9E57] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white ring-1 ring-[#ECE6DA]">
                <ShoppingBag className="w-8 h-8 text-[#13301B]" />
              </span>
              <h3 className="mt-5 font-serif text-2xl font-semibold text-[#13301B]">Your cart is empty</h3>
              <p className="mt-2 max-w-xs text-sm text-[#6B6B6B]">Add plants, pots or plant care and they will show up here.</p>
              <button onClick={() => go('/plants')} className="mt-6 rounded-full bg-[#13301B] px-7 py-3 text-sm font-semibold text-white hover:bg-[#1F4A2B]">
                Shop plants
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const unit = item.unitPrice ?? item.product.price;
                const opts = [item.selectedWeight, item.selectedSize, item.selectedPotColor].filter(Boolean).join(' · ');
                return (
                  <li
                    key={`${item.product.id}_${item.selectedWeight || ''}_${item.selectedSize || ''}_${item.selectedPotColor || ''}`}
                    className="flex gap-3.5 rounded-2xl bg-white p-3 ring-1 ring-[#ECE6DA]"
                  >
                    <button onClick={() => go(`/product/${item.product.slug}`)} className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-[#F1ECE2]">
                      <PlantImage src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => go(`/product/${item.product.slug}`)} className="text-left">
                          <span className="line-clamp-2 font-serif text-[15px] font-medium leading-snug text-[#13301B] hover:underline">{item.product.name}</span>
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedWeight)}
                          className="-mr-1 -mt-1 rounded-full p-1.5 text-[#9A9A9A] hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {opts && <p className="mt-0.5 truncate text-[11px] text-[#7A7A7A]">{opts}</p>}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full ring-1 ring-[#E0D9CB]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedWeight)}
                            className="flex h-8 w-8 items-center justify-center font-semibold text-[#13301B]"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedWeight)}
                            disabled={item.quantity >= item.product.stock}
                            className="flex h-8 w-8 items-center justify-center font-semibold text-[#13301B] disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[15px] font-semibold text-[#141414]">₹{(unit * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-[#ECE6DA] bg-white px-5 sm:px-6 pt-4 pb-5 space-y-3.5">
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-[#EEF5EC] px-3.5 py-2.5 text-xs">
                <span className="flex items-center gap-2 font-semibold text-[#13301B]">
                  <Tag className="w-3.5 h-3.5" /> {appliedCoupon.code} applied · −₹{discount.toLocaleString('en-IN')}
                </span>
                <button onClick={removeCoupon} className="font-semibold text-[#B42318] hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  aria-label="Coupon code"
                  className="min-w-0 grow rounded-full border border-[#E0D9CB] bg-[#FAF7F1] px-4 py-2.5 text-sm uppercase placeholder:normal-case placeholder:text-[#9A9A9A] focus:border-[#13301B] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="rounded-full border border-[#13301B] px-5 text-sm font-semibold text-[#13301B] hover:bg-[#13301B] hover:text-white disabled:opacity-40"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}
            {couponMessage && <p className="-mt-1.5 pl-1 text-[11px] text-rose-600">{couponMessage}</p>}

            <dl className="space-y-1.5 text-sm text-[#5A5A5A]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-[#141414]">₹{subtotal.toLocaleString('en-IN')}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#1E7A45]">
                  <dt>Discount</dt>
                  <dd>−₹{discount.toLocaleString('en-IN')}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{shippingCharge === 0 ? <span className="font-medium text-[#1E7A45]">Free</span> : `₹${shippingCharge}`}</dd>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <dt>GST</dt>
                  <dd>₹{tax.toLocaleString('en-IN')}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-[#F0EBDF] pt-2.5 text-base font-semibold text-[#141414]">
                <dt>Total</dt>
                <dd>₹{total.toLocaleString('en-IN')}</dd>
              </div>
            </dl>

            <button
              id="drawer-checkout-btn"
              onClick={() => go('/checkout')}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#13301B] py-4 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(19,48,27,0.8)] hover:bg-[#1F4A2B] active:scale-[0.99]"
            >
              Checkout · ₹{total.toLocaleString('en-IN')} <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={close} className="block w-full text-center text-xs font-medium text-[#5A5A5A] hover:text-[#13301B]">
              Continue shopping
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A7A7A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" /> Secure checkout · UPI, cards & Cash on Delivery
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};
