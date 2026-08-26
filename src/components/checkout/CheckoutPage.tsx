import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowLeft,
  Tag,
  Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Address, Order, OrderItem, PaymentMethod } from '../../types';
import { createOrder, updatePaymentStatus } from '../../services/orderService';
import { processRazorpayCheckout } from '../../services/paymentService';
import confetti from 'canvas-confetti';
import { PlantImage } from '../../utils/imageFallback';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const {
    items,
    subtotal,
    discount,
    shippingCharge,
    tax,
    total,
    appliedCoupon,
    clearCart,
  } = useCart();

  const { user, profile, saveAddress, openAuthModal } = useAuth();
  const { settings, paymentSettings } = useStoreSettings();

  const [fullName, setFullName] = useState(profile?.displayName || user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill from profile addresses if available
  useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      const defaultAddr = profile.addresses.find((a) => a.isDefault) || profile.addresses[0];
      if (defaultAddr) {
        if (!fullName) setFullName(defaultAddr.fullName);
        if (!phone) setPhone(defaultAddr.phone);
        if (!email) setEmail(defaultAddr.email);
        setStreet(defaultAddr.street);
        setLandmark(defaultAddr.landmark || '');
        setCity(defaultAddr.city);
        setState(defaultAddr.state);
        setPincode(defaultAddr.pincode);
      }
    }
  }, [profile]);

  // MANDATORY SIGN-IN GATE — user must be authenticated to place an order
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-10 shadow-xs">
          <div className="w-16 h-16 bg-[#F5F2EB] border border-[#E5E2D9] text-[#2D4A27] rounded-full flex items-center justify-center mx-auto text-2xl mb-5 animate-cartoon-float">
            <i className="fa-solid fa-lock" />
          </div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">
            Sign In to Continue
          </h2>
          <p className="text-xs text-[#5A5A5A] mt-2 leading-relaxed font-light">
            Please sign in or create an account to securely place your order.
            Your cart items will be preserved.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="mt-6 w-full py-3 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cartoon-hover-pop"
          >
            <i className="fa-solid fa-right-to-bracket" />
            Sign In / Register
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-[10px] text-[#5A5A5A] hover:text-[#2D4A27] font-semibold uppercase tracking-wider"
          >
            &larr; Back to Store
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 bg-[#F5F2EB] text-[#2D4A27] flex items-center justify-center mx-auto text-xl mb-4 border border-[#E5E2D9]">
          <i className="fa-solid fa-seedling text-[#2D4A27]" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#1A1A1A]">Your Cart is Empty</h2>
        <p className="text-xs text-[#5A5A5A] mt-2 font-light">Add your favorite plants before heading to checkout.</p>
        <button
          onClick={() => navigate('/plants')}
          className="mt-6 px-6 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider transition-all"
        >
          Browse Catalogue &rarr;
        </button>
      </div>
    );
  }

  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !email.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      setErrorMsg('Please fill in all required shipping address fields.');
      return;
    }

    if (pincode.replace(/[^0-9]/g, '').length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Indian pincode.');
      return;
    }

    // COD limit validation
    if (paymentMethod === 'cod') {
      if (total < paymentSettings.minCodAmount) {
        setErrorMsg(`Minimum order value for Cash on Delivery is ₹${paymentSettings.minCodAmount}.`);
        return;
      }
      if (total > paymentSettings.maxCodAmount) {
        setErrorMsg(`Cash on Delivery is limited to orders up to ₹${paymentSettings.maxCodAmount}. Please pay online via Razorpay.`);
        return;
      }
    }

    setIsProcessing(true);

    const shippingAddress: Address = {
      fullName,
      phone,
      email,
      street,
      landmark,
      city,
      state,
      pincode,
    };

    if (saveAddressForFuture) {
      try {
        await saveAddress(shippingAddress);
      } catch (e) {
        // ignore
      }
    }

    const orderItems: OrderItem[] = items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      slug: i.product.slug,
      image: i.product.images[0],
      price: i.product.price,
      quantity: i.quantity,
      sku: i.product.sku,
    }));

    const tempOrderNumber = `${settings.orderPrefix || 'B4P-'}${Date.now().toString().slice(-6)}`;

    // If COD
    if (paymentMethod === 'cod') {
      try {
        const newOrder = await createOrder({
          orderNumber: tempOrderNumber,
          customerId: user?.uid || profile?.uid || 'guest',
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          items: orderItems,
          subtotal,
          discount,
          shippingCharge,
          tax,
          total,
          couponCode: appliedCoupon?.code,
          shippingAddress,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          orderStatus: 'Confirmed',
          notes: orderNotes,
        });

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        clearCart();
        navigate(`/order-success/${newOrder.orderNumber}`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to place order');
        setIsProcessing(false);
      }
      return;
    }

    // If Online Payment via Razorpay
    if (paymentMethod === 'razorpay') {
      try {
        const preliminaryOrder = await createOrder({
          orderNumber: tempOrderNumber,
          customerId: user?.uid || profile?.uid || 'guest',
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          items: orderItems,
          subtotal,
          discount,
          shippingCharge,
          tax,
          total,
          couponCode: appliedCoupon?.code,
          shippingAddress,
          paymentMethod: 'razorpay',
          paymentStatus: 'pending',
          orderStatus: 'Pending',
          notes: orderNotes,
        });

        await processRazorpayCheckout({
          amount: total,
          orderNumber: preliminaryOrder.orderNumber,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          onSuccess: async (paymentId, orderId) => {
            await updatePaymentStatus(preliminaryOrder.id, 'paid', paymentId);
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            clearCart();
            navigate(`/order-success/${preliminaryOrder.orderNumber}`);
          },
          onFailure: (errMsg) => {
            setErrorMsg(`Payment error: ${errMsg}. You can retry or choose Cash on Delivery.`);
            setIsProcessing(false);
          },
        });
      } catch (err: any) {
        setErrorMsg(err.message || 'Payment initiation failed');
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/plants')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A5A5A] hover:text-[#2D4A27] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Contact & Shipping */}
          <div className="lg:col-span-7 space-y-6">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Customer Contact */}
              <div className="bg-white p-6 sm:p-8 border border-[#E5E2D9]">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] mb-4 flex items-center justify-between">
                  <span>1. Contact Details</span>
                  {!user && (
                    <span className="text-xs text-[#2D4A27] font-normal">
                      Checking out as guest
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ananya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Mobile Phone (For WhatsApp delivery alerts & OTP) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 sm:p-8 border border-[#E5E2D9]">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] mb-4">
                  2. Shipping Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Flat, House No., Building, Apartment *</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat 302, Green Meadows Apartment"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Landmark / Street (Optional)</label>
                    <input
                      type="text"
                      placeholder="Near 100ft Road BDA Complex"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Town / City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] font-medium"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">PIN Code (6 digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="560038"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddressForFuture}
                        onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                        className="w-4 h-4 text-[#2D4A27] focus:ring-[#2D4A27]"
                      />
                      <span className="font-medium text-[#1A1A1A]">Save address for future orders</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white p-6 sm:p-8 border border-[#E5E2D9]">
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A] mb-4 flex items-center justify-between">
                  <span>3. Payment Options</span>
                  <span className="text-xs text-[#7A7A7A] flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#2D4A27]" />
                    256-bit Encrypted
                  </span>
                </h3>

                <div className="space-y-3">
                  {/* Razorpay Online */}
                  {paymentSettings.onlinePaymentsEnabled && (
                    <label
                      className={`block p-4 border transition-all cursor-pointer ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#2D4A27] bg-[#2D4A27]/5'
                          : 'border-[#E5E2D9] hover:border-[#2D4A27] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'razorpay'}
                            onChange={() => setPaymentMethod('razorpay')}
                            className="w-4 h-4 text-[#2D4A27] focus:ring-[#2D4A27]"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#1A1A1A] block">
                              Pay Online via Razorpay (UPI, Google Pay, Cards, NetBanking)
                            </span>
                            <span className="text-[11px] text-[#5A5A5A]">
                              Instant checkout with UPI, RuPay, Visa, Mastercard, and NetBanking
                            </span>
                          </div>
                        </div>
                        <CreditCard className="w-5 h-5 text-[#2D4A27] hidden sm:block" />
                      </div>
                    </label>
                  )}

                  {/* Cash on Delivery */}
                  {paymentSettings.codEnabled && (
                    <label
                      className={`block p-4 border transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-[#2D4A27] bg-[#2D4A27]/5'
                          : 'border-[#E5E2D9] hover:border-[#2D4A27] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="w-4 h-4 text-[#2D4A27] focus:ring-[#2D4A27]"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#1A1A1A] block">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[11px] text-[#5A5A5A]">
                              Pay in cash or UPI QR at your doorstep upon plant arrival
                            </span>
                          </div>
                        </div>
                        <Banknote className="w-5 h-5 text-[#2D4A27] hidden sm:block" />
                      </div>
                    </label>
                  )}
                </div>

                {/* Delivery Instructions note */}
                <div className="mt-4 pt-4 border-t border-[#E5E2D9]">
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave with security guard or ring bell twice"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-xs focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold uppercase tracking-widest transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Order securely...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Place Order & Pay ₹{total.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary: Order Items & Pricing Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 border border-[#E5E2D9] sticky top-24">
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A] pb-4 border-b border-[#E5E2D9]">
                Order Summary ({items.reduce((a, c) => a + c.quantity, 0)} Items)
              </h3>

              {/* Items List */}
              <div className="divide-y divide-[#E5E2D9] max-h-72 overflow-y-auto py-2">
                {items.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center gap-3">
                    <PlantImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover border border-[#E5E2D9]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#1A1A1A] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-[#7A7A7A]">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="space-y-2 pt-4 border-t border-[#E5E2D9] text-xs text-[#5A5A5A]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-[#1A1A1A]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#2D4A27] font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Coupon Discount ({appliedCoupon?.code})
                    </span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping & Transit Box</span>
                  <span>
                    {shippingCharge === 0 ? (
                      <span className="text-[#2D4A27] font-bold uppercase text-[11px]">Free</span>
                    ) : (
                      `₹${shippingCharge}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated GST ({settings.taxRatePercentage || 5}%)</span>
                  <span>₹{tax}</span>
                </div>

                <div className="border-t border-[#E5E2D9] pt-3 flex justify-between text-base font-bold text-[#1A1A1A]">
                  <span>Total Payable</span>
                  <span className="text-[#2D4A27] font-serif text-xl">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Guarantee badges */}
              <div className="mt-6 pt-4 border-t border-[#E5E2D9] space-y-2 text-[11px] text-[#5A5A5A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D4A27] shrink-0" />
                  <span>7-Day Free Plant Replacement Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#2D4A27] shrink-0" />
                  <span>Specialized honeycomb transit packaging</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
