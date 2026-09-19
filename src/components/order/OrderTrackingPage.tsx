import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  PackageCheck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  Calendar,
  Phone,
  ShieldCheck,
  MessageCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Star,
  X
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getOrderByNumberOrPhone, subscribeToOrder } from '../../services/orderService';
import { submitReview } from '../../services/reviewService';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { PlantImage } from '../../utils/imageFallback';

export const OrderTrackingPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeTrackingNumber, setActiveTrackingNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAWB, setCopiedAWB] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const { settings } = useStoreSettings();

  // Review modal state
  const [reviewModalItem, setReviewModalItem] = useState<{ id: string; name: string; image: string; slug?: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Auto-search if url has ?id=
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    if (idParam) {
      setQuery(idParam);
      setActiveTrackingNumber(idParam);
    }
  }, []);

  // Real-time live subscription whenever activeTrackingNumber changes
  useEffect(() => {
    if (!activeTrackingNumber.trim()) return;

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToOrder(activeTrackingNumber.trim(), (liveOrder) => {
      setLoading(false);
      setLastRefreshed(new Date());
      if (liveOrder) {
        setOrder(liveOrder);
        setError(null);
      } else {
        setOrder(null);
        setError('No order found matching this Order Number or Phone number. Please verify and try again.');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeTrackingNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveTrackingNumber(query.trim());
  };

  const handleCopyAWB = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  const steps: { label: OrderStatus; desc: string; icon: string }[] = [
    { label: 'Pending', desc: 'Order Placed & Queued', icon: 'fa-solid fa-clipboard-list' },
    { label: 'Confirmed', desc: 'Plant Inspected & Potted', icon: 'fa-solid fa-leaf' },
    { label: 'Packed', desc: 'Moisture-Lock Box Sealed', icon: 'fa-solid fa-box' },
    { label: 'Shipped', desc: 'In Eco Express Transit', icon: 'fa-solid fa-truck-fast' },
    { label: 'Out for Delivery', desc: 'Out with Local Courier', icon: 'fa-solid fa-location-dot' },
    { label: 'Delivered', desc: 'Delivered to Doorstep', icon: 'fa-solid fa-house-chimney' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const idx = steps.findIndex((s) => s.label === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;

  const defaultEstDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-[#2D4A27]/10 text-[#2D4A27] text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Live Real-Time Transit Tracking
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
            Track Your Botanical Delivery
          </h1>
          <p className="text-xs text-[#5A5A5A] mt-2 font-light">
            Monitor real-time nursery dispatch, courier AWB tracking, and live doorstep delivery updates.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white p-4 sm:p-6 border border-[#E5E2D9] max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="Enter Order ID (e.g. B4P-1002) or 10-digit Phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E2D9] text-[#1A1A1A] text-xs sm:text-sm focus:outline-none focus:border-[#2D4A27]"
              />
              <Search className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 active:scale-98"
            >
              {loading ? 'Locating...' : 'Track Live'}
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tracking Details View */}
        {order && (
          <div className="mt-8 bg-white border border-[#E5E2D9] p-6 sm:p-10 space-y-8 animate-fadeIn">
            {/* Top Bar with Live Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2D9]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#7A7A7A] tracking-wider">Order Reference</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#2D4A27] bg-[#2D4A27]/10 px-2 py-0.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Live Sync
                  </span>
                </div>
                <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] mt-1">{order.orderNumber}</h2>
                <span className="text-xs text-[#7A7A7A]">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-[#7A7A7A] block">Current Status</span>
                <span className="inline-flex items-center gap-1.5 bg-[#2D4A27] text-white text-[11px] font-bold px-3 py-1 uppercase tracking-wider mt-1">
                  <PackageCheck className="w-3.5 h-3.5" />
                  {order.orderStatus}
                </span>
                <span className="block text-[10px] text-[#7A7A7A] mt-1 font-mono">
                  Synced: {lastRefreshed.toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Visual Step Progress Tracker */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Fulfillment & Dispatch Milestones</h3>
                <span className="text-xs text-[#2D4A27] font-semibold">
                  Est. Delivery: {order.estimatedDeliveryDate || defaultEstDate}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.label}
                      className={`flex flex-col items-center text-center p-3 transition-all ${
                        isCurrent
                          ? 'bg-[#2D4A27]/5 border-2 border-[#2D4A27]'
                          : isCompleted
                          ? 'bg-[#F5F2EB] border border-[#2D4A27]/40'
                          : 'opacity-40 border border-[#E5E2D9] bg-white'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 flex items-center justify-center text-xs font-bold mb-2 ${
                          isCompleted ? 'bg-[#2D4A27] text-white' : 'bg-[#E5E2D9] text-[#1A1A1A]'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className="text-xs font-bold text-[#1A1A1A]">{step.label}</span>
                      <span className="text-[10px] text-[#7A7A7A] mt-0.5 font-light">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier, AWB & Live Location Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E5E2D9] text-xs">
              <div className="bg-[#F5F2EB] p-4 border border-[#E5E2D9] space-y-2.5">
                <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Truck className="w-4 h-4 text-[#2D4A27]" />
                  Logistics & Courier Information
                </span>
                <div>
                  <span className="text-[#7A7A7A] text-[11px] block">Courier Partner</span>
                  <p className="font-semibold text-[#1A1A1A]">{order.deliveryCourier || 'BlueDart Express Eco'}</p>
                </div>
                <div>
                  <span className="text-[#7A7A7A] text-[11px] block">AWB Tracking Number</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-[#2D4A27] bg-white px-2 py-0.5 border border-[#E5E2D9]">
                      {order.trackingNumber || `VB-EXP-${order.orderNumber.slice(-4)}`}
                    </span>
                    <button
                      onClick={() => handleCopyAWB(order.trackingNumber || `VB-EXP-${order.orderNumber.slice(-4)}`)}
                      className="text-[#7A7A7A] hover:text-[#1A1A1A] text-[11px] flex items-center gap-1 border border-[#E5E2D9] px-2 py-0.5 bg-white"
                      title="Copy AWB"
                    >
                      {copiedAWB ? (
                        <>
                          <Check className="w-3 h-3 text-[#2D4A27]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[#7A7A7A] text-[11px] block">Current Location / Status</span>
                  <p className="font-medium text-[#1A1A1A] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#2D4A27]" />
                    {order.currentLocation || 'Bengaluru Central Botanical Hub'}
                  </p>
                </div>
              </div>

              <div className="bg-[#F5F2EB] p-4 border border-[#E5E2D9] space-y-2.5">
                <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#2D4A27]" />
                  Delivery Destination
                </span>
                <div>
                  <p className="text-[#1A1A1A] font-bold">{order.shippingAddress.fullName}</p>
                  <p className="text-[#5A5A5A] text-[11px] mt-0.5">{order.shippingAddress.street}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-[#7A7A7A] text-[11px]">Landmark: {order.shippingAddress.landmark}</p>
                  )}
                  <p className="text-[#1A1A1A] font-medium text-[11px]">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p className="text-[#5A5A5A] text-[11px] mt-1 font-mono">Contact: {order.shippingAddress.phone}</p>
                </div>

                <div className="pt-2 border-t border-[#E5E2D9]/80">
                  <span className="text-[#7A7A7A] text-[11px] block">Payment Method</span>
                  <span className="font-semibold text-[#1A1A1A] uppercase">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery (Pending)' : 'Paid Online (Razorpay)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="pt-4 border-t border-[#E5E2D9]">
                <h4 className="font-serif font-bold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2D4A27]" />
                  Activity History & Audit Log
                </h4>
                <div className="space-y-3 bg-[#FDFCF9] p-4 border border-[#E5E2D9]">
                  {order.statusHistory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#2D4A27] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1A1A1A]">{item.status}</span>
                          <span className="text-[10px] text-[#7A7A7A]">
                            {new Date(item.timestamp).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {item.note && <p className="text-[#5A5A5A] text-[11px] mt-0.5">{item.note}</p>}
                        {item.location && (
                          <span className="text-[10px] text-[#2D4A27] font-medium block mt-0.5 flex items-center gap-1">
                            <i className="fa-solid fa-location-dot text-emerald-700" />
                            {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items with Plant Specimen Thumbnails */}
            <div className="pt-4 border-t border-[#E5E2D9]">
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A] mb-3">
                Items in This Shipment ({order.items.length})
              </h4>
              <div className="divide-y divide-[#E5E2D9] border border-[#E5E2D9]">
                {order.items.map((item, i) => (
                  <div key={i} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <PlantImage
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover border border-[#E5E2D9]"
                      />
                      <div>
                        <span className="font-semibold text-[#1A1A1A] block">{item.name}</span>
                        <span className="text-[#7A7A7A] block text-[11px]">Qty: {item.quantity} | SKU: {item.sku}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#1A1A1A]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {order.orderStatus === 'Delivered' && (
                        <button
                          onClick={() =>
                            setReviewModalItem({
                              id: item.productId,
                              name: item.name,
                              image: item.image,
                              slug: item.slug
                            })
                          }
                          className="px-3 py-1.5 border border-[#2D4A27] text-[#2D4A27] hover:bg-[#2D4A27] hover:text-white text-[11px] font-bold rounded transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {reviewSuccessMsg && (
              <div className="p-3 bg-[#2D4A27]/10 border border-[#2D4A27]/20 text-[#2D4A27] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {/* Transit Care & Support Box */}
            <div className="p-4 bg-[#2D4A27]/5 border border-[#2D4A27]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#2D4A27] shrink-0" />
                <div>
                  <span className="font-bold text-[#1A1A1A] block">100% Botanical Transit Guarantee</span>
                  <span className="text-[#5A5A5A] text-[11px] font-light">
                    Every plant is shipped in moisture-retaining eco packaging. Free replacement if damaged in transit.
                  </span>
                </div>
              </div>

              <a
                href={`https://wa.me/${settings.contactPhone?.replace(/[^0-9]/g, '') || '919876543210'}?text=Hi%20buddy4plant,%20I%20have%20a%20query%20about%20my%20order%20${encodeURIComponent(order.orderNumber)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Plant Care
              </a>
            </div>
          </div>
        )}

        {/* MODAL: Write Plant Review */}
        {reviewModalItem && (
          <div className="fixed inset-0 z-50 bg-[#0F1710]/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Review Delivered Plant
                </h3>
                <button onClick={() => setReviewModalItem(null)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!reviewModalItem) return;
                  setSubmittingReview(true);
                  try {
                    await submitReview({
                      productId: reviewModalItem.slug || reviewModalItem.id,
                      productName: reviewModalItem.name,
                      userId: order?.userId || 'verified_buyer',
                      userName: order?.customerName || 'Verified Plant Parent',
                      userEmail: order?.customerEmail || 'care@buddy4plant.com',
                      rating: reviewRating,
                      title: `Verified Delivery Review: ${reviewModalItem.name}`,
                      comment: reviewComment.trim() || 'Plant arrived fresh, healthy, and securely packed!',
                      verifiedPurchase: true,
                      approved: true,
                    });
                    setReviewSuccessMsg(`Thank you! Your verified review for "${reviewModalItem.name}" has been published to the product page.`);
                    setReviewModalItem(null);
                    setReviewComment('');
                    setReviewRating(5);
                    setTimeout(() => setReviewSuccessMsg(null), 4500);
                  } catch (err: any) {
                    setReviewModalItem(null);
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
                className="mt-4 space-y-4 text-xs"
              >
                <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <PlantImage src={reviewModalItem.image} alt={reviewModalItem.name} className="w-12 h-12 object-cover rounded-lg" />
                  <span className="font-bold text-stone-900 text-sm">{reviewModalItem.name}</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-xl focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Your Review Feedback
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us how the plant arrived and how it looks in your space..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewModalItem(null)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? 'Publishing...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
