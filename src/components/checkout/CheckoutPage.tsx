import React, { useState, useEffect } from 'react';
import { lookupPincode } from '../../utils/pincode';
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
} from '../common/Icons';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Address, Order, OrderItem, PaymentMethod } from '../../types';
import { createOrder, updatePaymentStatus } from '../../services/orderService';
import { processRazorpayCheckout, getPaymentConfig, PaymentConfig } from '../../services/paymentService';
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
  const [state, setState] = useState('');
  const [pinLookup, setPinLookup] = useState<'idle' | 'loading' | 'done' | 'fail'>('idle');
  const [pincode, setPincode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isCustomAddress, setIsCustomAddress] = useState<boolean>(false);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  // Online payment is offered only when the Razorpay keys are set on the server
  const [payConfig, setPayConfig] = useState<PaymentConfig | null>(null);
  useEffect(() => {
    getPaymentConfig().then(setPayConfig);
  }, []);
  const onlineAvailable = !!payConfig?.enabled && paymentSettings.onlinePaymentsEnabled !== false;
  useEffect(() => {
    if (payConfig && !onlineAvailable && paymentMethod === 'razorpay' && paymentSettings.codEnabled) setPaymentMethod('cod');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payConfig]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill from profile addresses if available
  useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      const defaultAddr = profile.addresses.find((a) => a.isDefault) || profile.addresses[0];
      if (defaultAddr && !selectedAddressId && !isCustomAddress) {
        setSelectedAddressId(defaultAddr.id || 'default');
        if (!fullName) setFullName(defaultAddr.fullName);
        if (!phone) setPhone(defaultAddr.phone);
        if (!email) setEmail(defaultAddr.email || user?.email || '');
        setStreet(defaultAddr.street);
        setLandmark(defaultAddr.landmark || '');
        setCity(defaultAddr.city);
        setState(defaultAddr.state || 'Uttar Pradesh');
        setPincode(defaultAddr.pincode);
      }
    }
  }, [profile, user]);

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id || 'addr');
    setIsCustomAddress(false);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    if (addr.email) setEmail(addr.email);
    setStreet(addr.street);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state || 'Uttar Pradesh');
    setPincode(addr.pincode);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setIsCustomAddress(true);
    setStreet('');
    setLandmark('');
    setCity('');
    setPincode('');
  };

  // MANDATORY SIGN-IN GATE — user must be authenticated to place an order
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-[#F0EBDF] rounded-2xl p-10 shadow-xs">
          <div className="w-16 h-16 bg-[#F5F2EB] border border-[#F0EBDF] text-[#2D4A27] rounded-full flex items-center justify-center mx-auto text-2xl mb-5 animate-cartoon-float">
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
        <div className="w-14 h-14 bg-[#F5F2EB] text-[#2D4A27] flex items-center justify-center mx-auto text-xl mb-4 border border-[#F0EBDF]">
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
    'Uttarakhand', 'West Bengal', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Sikkim', 'Tripura', 'Chandigarh', 'Puducherry', 'Ladakh', 'Andaman and Nicobar Islands', 'Lakshadweep',
    'Dadra and Nagar Haveli and Daman and Diu'
  ].sort();
  const stateOptions = state && !indianStates.includes(state) ? [state, ...indianStates] : indianStates;

  // Fill city and state from the pincode
  const handlePincodeChange = async (value: string) => {
    const pin = value.replace(/\D/g, '').slice(0, 6);
    setPincode(pin);
    if (pin.length !== 6) {
      setPinLookup('idle');
      return;
    }
    setPinLookup('loading');
    const place = await lookupPincode(pin);
    if (place) {
      if (place.city) setCity(place.city);
      if (place.state) setState(place.state);
      setPinLookup('done');
    } else {
      setPinLookup('fail');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !email.trim() || !street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
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
        setErrorMsg(`Cash on Delivery is limited to orders up to ₹${paymentSettings.maxCodAmount}. Please pay online.`);
        return;
      }
    }

    setIsProcessing(true);

    const shippingAddress: Address = {
      id: selectedAddressId || `addr-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      street: street.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state,
      pincode: pincode.trim(),
      isDefault: profile?.addresses?.length === 0,
    };

    // Always persist address to user profile/storage if checkbox is enabled or user is signed in
    if (saveAddressForFuture || user) {
      try {
        await saveAddress(shippingAddress);
      } catch (e) {
        console.warn('Address save warning:', e);
      }
    }

    const orderItems: OrderItem[] = items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      slug: i.product.slug,
      image: i.product.images[0],
      price: i.unitPrice ?? i.product.price,
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

    // If Online Payment via Razorpay - the order is saved only after the payment is verified
    if (paymentMethod === 'razorpay') {
      if (!onlineAvailable) {
        setErrorMsg('Online payment is not available right now. Please choose Cash on Delivery.');
        setIsProcessing(false);
        return;
      }
      try {
        await processRazorpayCheckout({
          amount: total,
          orderNumber: tempOrderNumber,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          onSuccess: async (payment) => {
            try {
              const paidOrder = await createOrder({
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
                paymentStatus: 'paid',
                orderStatus: 'Confirmed',
                razorpayOrderId: payment.orderId,
                razorpayPaymentId: payment.paymentId,
                notes: [orderNotes, payment.method ? `Paid online (${payment.method.toUpperCase()})` : ''].filter(Boolean).join(' | '),
              });
              // Re-ensure the address is saved after a successful payment
              try {
                await saveAddress(shippingAddress);
              } catch (e) {}
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              clearCart();
              navigate(`/order-success/${paidOrder.orderNumber}`);
            } catch {
              setErrorMsg(`Your payment was received (ID ${payment.paymentId}) but the order could not be saved. Please contact us on WhatsApp with this ID.`);
              setIsProcessing(false);
            }
          },
          onFailure: (errMsg) => {
            setErrorMsg(`${errMsg} You can try again or choose Cash on Delivery.`);
            setIsProcessing(false);
          },
          onDismiss: () => {
            setErrorMsg('Payment was cancelled. Your cart is saved - you can try again.');
            setIsProcessing(false);
          },
        });
      } catch (err: any) {
        setErrorMsg(err.message || 'Payment could not be started');
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="bg-[#FAF7F1] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/plants')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A5A5A] hover:text-[#2D4A27] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </button>
        <h1 className="mb-6 sm:mb-8 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#13301B]">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Contact & Shipping */}
          <div className="lg:col-span-7 space-y-6">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Customer Contact */}
              <div className="bg-white p-5 sm:p-8 rounded-[22px] ring-1 ring-[#ECE6DA] shadow-[0_14px_32px_-26px_rgba(19,48,27,0.5)]">
                <h3 className="font-serif font-semibold text-xl text-[#13301B] mb-4 flex items-center justify-between">
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
                      className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#A5A29A] focus:outline-none focus:border-[#13301B] focus:ring-2 focus:ring-[#13301B]/10"
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
                      className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#A5A29A] focus:outline-none focus:border-[#13301B] focus:ring-2 focus:ring-[#13301B]/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Mobile Phone (For WhatsApp delivery alerts & OTP) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 80048 81668"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#A5A29A] focus:outline-none focus:border-[#13301B] focus:ring-2 focus:ring-[#13301B]/10"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-5 sm:p-8 rounded-[22px] ring-1 ring-[#ECE6DA] shadow-[0_14px_32px_-26px_rgba(19,48,27,0.5)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-semibold text-xl text-[#13301B]">
                    2. Shipping Address
                  </h3>
                  {profile?.addresses && profile.addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="text-[11px] font-bold text-[#2D4A27] hover:underline flex items-center gap-1"
                    >
                      <i className="fa-solid fa-plus text-[10px]" /> Add New Address
                    </button>
                  )}
                </div>

                {profile?.addresses && profile.addresses.length > 0 && (
                  <div className="mb-6 space-y-2.5">
                    <p className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">
                      Saved Delivery Addresses:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id && !isCustomAddress;
                        return (
                          <div
                            key={addr.id || addr.street}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-3.5 border rounded-lg cursor-pointer transition-all text-xs relative ${
                              isSelected
                                ? 'border-[#2D4A27] bg-[#EBF5EC]/40 ring-1 ring-[#2D4A27]'
                                : 'border-[#F0EBDF] hover:border-[#2D4A27]/60 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-bold text-[#1A1A1A]">{addr.fullName}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#2D4A27] text-white px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[#555] line-clamp-2 leading-relaxed">
                              {addr.street}{addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-[#777] mt-1 text-[11px]">Phone: {addr.phone}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Flat, House No., Building, Apartment *</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat 302, Green Meadows Apartment"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#A5A29A] focus:outline-none focus:border-[#13301B] focus:ring-2 focus:ring-[#13301B]/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Landmark / Street (Optional)</label>
                    <input
                      type="text"
                      placeholder="Near 100ft Road BDA Complex"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#A5A29A] focus:outline-none focus:border-[#13301B] focus:ring-2 focus:ring-[#13301B]/10"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Town / City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Lucknow"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#A5A29A] focus:outline-none focus:border-[#13301B] focus:ring-2 focus:ring-[#13301B]/10"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#13301B] focus:ring-2 focus:ring-[#13301B]/10"
                    >
                      <option value="">Select state</option>
                      {stateOptions.map((st) => (
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
                      inputMode="numeric"
                      placeholder="226010"
                      value={pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#A5A29A] focus:outline-none focus:border-[#13301B] focus:ring-2 focus:ring-[#13301B]/10"
                    />
                    <p className="mt-1 text-[11px] text-[#7A7A7A]">
                      {pinLookup === 'loading' ? 'Finding your city and state...' : pinLookup === 'done' ? 'City and state filled from the pincode.' : pinLookup === 'fail' ? 'Pincode not found - please check it.' : 'City and state fill in automatically.'}
                    </p>
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
              <div className="bg-white p-5 sm:p-8 rounded-[22px] ring-1 ring-[#ECE6DA] shadow-[0_14px_32px_-26px_rgba(19,48,27,0.5)]">
                <h3 className="font-serif font-semibold text-xl text-[#13301B] mb-4 flex items-center justify-between">
                  <span>3. Payment Options</span>
                </h3>

                <div className="space-y-3">
                  {/* Razorpay Online */}
                  {onlineAvailable && (
                    <label
                      className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#13301B] bg-[#F3F7F1]'
                          : 'border-[#ECE6DA] hover:border-[#9BB287] bg-white'
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
                            <span className="font-semibold text-sm text-[#13301B] block">
                              Pay Online - UPI, Cards, NetBanking, Wallets
                            </span>
                            <span className="text-[11px] text-[#5A5A5A]">
                              Google Pay, PhonePe, Paytm, any UPI app, Visa, Mastercard, RuPay - secured by Razorpay
                            </span>
                            {payConfig?.mode === 'test' && (
                              <span className="mt-1 inline-block rounded bg-[#FFF4D6] px-1.5 py-0.5 text-[10px] font-bold text-[#8A6A00]">
                                TEST MODE - no real money is charged
                              </span>
                            )}
                          </div>
                        </div>
                        <CreditCard className="w-5 h-5 text-[#2D4A27] hidden sm:block" />
                      </div>
                    </label>
                  )}

                  {/* Cash on Delivery */}
                  {paymentSettings.codEnabled && (
                    <label
                      className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-[#13301B] bg-[#F3F7F1]'
                          : 'border-[#ECE6DA] hover:border-[#9BB287] bg-white'
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
                            <span className="font-semibold text-sm text-[#13301B] block">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[11px] text-[#5A5A5A]">
                              Pay in cash or UPI when your order is delivered
                            </span>
                          </div>
                        </div>
                        <Banknote className="w-5 h-5 text-[#2D4A27] hidden sm:block" />
                      </div>
                    </label>
                  )}
                </div>

                {/* Delivery Instructions note */}
                <div className="mt-4 pt-4 border-t border-[#F0EBDF]">
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave with security guard or ring bell twice"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border border-[#E0D9CB] rounded-xl text-sm focus:outline-none focus:border-[#13301B]"
                  />
                </div>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-full bg-[#13301B] hover:bg-[#1F4A2B] text-white text-sm font-semibold transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_12px_24px_-14px_rgba(19,48,27,0.8)]"
              >
                {isProcessing ? (
                  <span>{paymentMethod === 'cod' ? 'Placing your order...' : 'Waiting for payment...'}</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {paymentMethod === 'cod' ? `Confirm Order - ₹${total.toLocaleString('en-IN')} (Cash on Delivery)` : `Pay ₹${total.toLocaleString('en-IN')} & Place Order`}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary: Order Items & Pricing Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-[22px] ring-1 ring-[#ECE6DA] shadow-[0_14px_32px_-26px_rgba(19,48,27,0.5)] lg:sticky lg:top-28">
              <h3 className="font-serif font-semibold text-xl text-[#13301B] pb-4 border-b border-[#F0EBDF]">
                Order Summary ({items.reduce((a, c) => a + c.quantity, 0)} Items)
              </h3>

              {/* Items List */}
              <div className="divide-y divide-[#E5E2D9] max-h-72 overflow-y-auto py-2">
                {items.map((item) => (
                  <div key={`${item.product.id}_${item.selectedWeight || ''}_${item.selectedSize || ''}_${item.selectedPotColor || ''}`} className="py-3 flex items-center gap-3">
                    <PlantImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-xl bg-[#F1ECE2]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#13301B] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-[#7A7A7A]">{[item.selectedWeight, item.selectedSize, item.selectedPotColor].filter(Boolean).join(' · ')}{(item.selectedWeight || item.selectedSize || item.selectedPotColor) ? ' · ' : ''}Qty {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      ₹{((item.unitPrice ?? item.product.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="space-y-2 pt-4 border-t border-[#F0EBDF] text-xs text-[#5A5A5A]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
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
                  <span>Delivery</span>
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

                <div className="border-t border-[#F0EBDF] pt-3 flex justify-between text-base font-bold text-[#1A1A1A]">
                  <span>Total</span>
                  <span className="text-[#2D4A27] font-serif text-xl">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Assurance */}
              <div className="mt-6 pt-4 border-t border-[#F0EBDF] space-y-2 text-xs text-[#5A5A5A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>Secure payments by Razorpay - UPI, cards, netbanking, or Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>Plants packed carefully at our Lucknow nursery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
