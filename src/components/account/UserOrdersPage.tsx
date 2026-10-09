import { printInvoice } from '../../utils/invoice';
import { useStoreSettings as useInvoiceSettings } from '../../context/StoreSettingsContext';
import React, { useState, useEffect } from 'react';
import { realShipping, COURIER_PENDING_TEXT } from '../../utils/shipping';
import {
  Package,
  Truck,
  Printer,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  MessageCircle,
  AlertCircle,
  RotateCcw,
  X,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Plus,
  PackageOpen,
  ArrowRight
} from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Order, OrderItem, Product } from '../../types';
import { getCustomerOrders, requestOrderReturn } from '../../services/orderService';
import { CancelOrderModal } from '../order/CancelOrderModal';
import { syncShiprocket } from '../../services/shiprocketService';
import { getProductById, getProductBySlug } from '../../services/productService';
import { submitReview } from '../../services/reviewService';
import { PlantImage } from '../../utils/imageFallback';

interface UserOrdersPageProps {
  navigate: (path: string) => void;
}

export const UserOrdersPage: React.FC<UserOrdersPageProps> = ({ navigate }) => {
  const { settings } = useInvoiceSettings();
  const { user, profile, openAuthModal } = useAuth();
  const { addToCart, setIsCartDrawerOpen } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusTabFilter, setStatusTabFilter] = useState<'all' | 'unshipped' | 'delivered' | 'cancelled'>('all');
  const [timeFilter, setTimeFilter] = useState<'30days' | '3months' | '2026' | 'all'>('all');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);

  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Plant damaged or leaves wilted');
  const [returnComments, setReturnComments] = useState('');
  const [requestingReturn, setRequestingReturn] = useState(false);

  const [reviewItem, setReviewItem] = useState<{ id: string; name: string; image: string; slug?: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = () => {
    if (user?.uid || profile?.uid) {
      const uid = user?.uid || profile?.uid || '';
      const email = user?.email || profile?.email || undefined;
      getCustomerOrders(uid, email).then((res) => {
        setOrders(res);
        setLoadingOrders(false);
      });
    } else {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleLiveOrderUpdate = () => fetchOrders();
    if (typeof window !== 'undefined') {
      window.addEventListener('vb_order_live_update', handleLiveOrderUpdate);
      window.addEventListener('storage', handleLiveOrderUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('vb_order_live_update', handleLiveOrderUpdate);
        window.removeEventListener('storage', handleLiveOrderUpdate);
      }
    };
  }, [user, profile]);

  // Bring the latest courier, AWB and delivery status from Shiprocket for orders still on their way
  const openShipmentKey = orders
    .filter((o) => (o.shiprocketOrderId || o.shiprocketShipmentId) && !['Delivered', 'Cancelled', 'Refunded'].includes(o.orderStatus))
    .map((o) => o.id)
    .join(',');
  useEffect(() => {
    if (!openShipmentKey) return;
    let alive = true;
    (async () => {
      let changed = false;
      for (const o of orders.filter((x) => openShipmentKey.split(',').includes(x.id))) {
        const t = await syncShiprocket(o);
        if (t) changed = true;
      }
      if (alive && changed) fetchOrders();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openShipmentKey]);

  if (!user && !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mx-auto text-2xl mb-4 shadow-xs">
          <Package className="w-8 h-8 text-[#2D4A27]" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-stone-900">Your Orders</h2>
        <p className="text-xs text-stone-500 mt-2 max-w-md mx-auto">
          Please sign in to view your order history, track shipments, request returns, and reorder plants.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 px-6 py-3 bg-[#2D4A27] hover:bg-[#1F341C] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
        >
          Sign In Now &rarr;
        </button>
      </div>
    );
  }

  // Return Request
  const handleConfirmReturnOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    setRequestingReturn(true);
    try {
      await requestOrderReturn(returnModalOrder.id, returnReason, returnComments);
      setReturnModalOrder(null);
      fetchOrders();
      showToast(`Return request submitted for Order #${returnModalOrder.orderNumber}`);
    } catch (err: any) {
      showToast(err.message || 'Could not submit return request');
    } finally {
      setRequestingReturn(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem) return;
    setSubmittingReview(true);
    try {
      await submitReview({
        productId: reviewItem.slug || reviewItem.id,
        productName: reviewItem.name,
        userId: user?.uid || profile?.uid || 'verified_buyer',
        userName: profile?.displayName || user?.displayName || 'Verified Plant Parent',
        userEmail: user?.email || profile?.email || 'contactus@buddy4plant.in',
        rating: reviewRating,
        title: `Verified Delivery Review: ${reviewItem.name}`,
        comment: reviewComment.trim() || 'Plant arrived vibrant, fresh, and securely packaged. Highly recommend!',
        verifiedPurchase: true,
        approved: true,
      });
      showToast(`Thank you! Your verified review for "${reviewItem.name}" has been published to the product page.`);
      setReviewItem(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      showToast(err?.message || 'Review submitted successfully!');
      setReviewItem(null);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Buy Again Single Item
  const handleBuyAgainItem = async (item: OrderItem) => {
    try {
      let targetProduct = await getProductById(item.productId);
      if (!targetProduct) {
        targetProduct = await getProductBySlug(item.slug);
      }

      if (targetProduct) {
        addToCart(targetProduct, item.quantity || 1);
      } else {
        const fallbackProd: Product = {
          id: item.productId,
          name: item.name,
          slug: item.slug,
          shortDescription: 'Re-ordered plant item from previous order',
          description: '',
          price: item.price,
          stock: 20,
          sku: item.sku || `SKU-${item.productId}`,
          category: 'indoor-plants',
          images: [item.image],
          rating: 5,
          reviewCount: 1,
          plantType: 'Botanical Plant',
          plantSize: 'Medium (9-15")',
          lightRequirement: 'Bright Indirect Light',
          wateringFrequency: 'When topsoil is dry',
          maintenanceLevel: 'Easy',
          location: 'Living Room',
          indoorOutdoor: 'Indoor',
          petFriendly: true,
          featured: false,
          bestseller: false,
          newArrival: false,
          active: true,
          tags: ['reorder'],
        };
        addToCart(fallbackProd, item.quantity || 1);
      }
      setIsCartDrawerOpen(true);
      showToast(`Added "${item.name}" to your shopping cart!`);
    } catch (err) {
      showToast('Could not reorder item at this time');
    }
  };

  // Buy Again Whole Order
  const handleBuyAgainWholeOrder = async (order: Order) => {
    for (const item of order.items) {
      await handleBuyAgainItem(item);
    }
    showToast(`Added all items from Order #${order.orderNumber} to your cart!`);
  };

  // Print Invoice
  const handlePrintInvoice = (order: Order) => printInvoice(order, settings);

  // Filter Orders
  const filteredOrders = orders.filter((ord) => {
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matches =
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.items.some((it) => it.name.toLowerCase().includes(q));
      if (!matches) return false;
    }

    if (statusTabFilter === 'unshipped') {
      if (['Delivered', 'Cancelled', 'Refunded'].includes(ord.orderStatus)) return false;
    } else if (statusTabFilter === 'delivered') {
      if (ord.orderStatus !== 'Delivered') return false;
    } else if (statusTabFilter === 'cancelled') {
      if (!['Cancelled', 'Refunded'].includes(ord.orderStatus)) return false;
    }

    const now = Date.now();
    if (timeFilter === '30days') {
      if (now - ord.createdAt > 30 * 86400000) return false;
    } else if (timeFilter === '3months') {
      if (now - ord.createdAt > 90 * 86400000) return false;
    } else if (timeFilter === '2026') {
      const yr = new Date(ord.createdAt).getFullYear();
      if (yr !== 2026) return false;
    }

    return true;
  });

  return (
    <div className="bg-[#FBFDFB] min-h-screen py-8 sm:py-12 font-sans">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#182319] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-[#2D4A27] flex items-center gap-3 animate-fadeIn text-xs font-medium">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Amazon Page Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2ECE0] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#6B856B] mb-1">
              <button onClick={() => navigate('/profile')} className="hover:underline text-[#2D6A4F] font-semibold">Your Account</button>
              <span>›</span>
              <span className="font-bold text-[#182319]">Your Orders</span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#182319]">Your Orders</h1>
            <p className="text-xs text-[#556955] mt-1">
              Manage past purchases, track active packages, process cancellations, or request returns.
            </p>
          </div>

          <button
            onClick={() => navigate('/plants')}
            className="px-5 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Botanical Store
          </button>
        </div>

        {/* Amazon-style Status Filter Tabs */}
        <div className="flex border-b border-[#E2ECE0] gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-1">
          <button
            onClick={() => setStatusTabFilter('all')}
            className={`pb-2.5 transition-colors cursor-pointer shrink-0 ${
              statusTabFilter === 'all'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setStatusTabFilter('unshipped')}
            className={`pb-2.5 transition-colors cursor-pointer shrink-0 ${
              statusTabFilter === 'unshipped'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            Not Yet Shipped ({orders.filter((o) => !['Delivered', 'Cancelled', 'Refunded'].includes(o.orderStatus)).length})
          </button>

          <button
            onClick={() => setStatusTabFilter('delivered')}
            className={`pb-2.5 transition-colors cursor-pointer shrink-0 ${
              statusTabFilter === 'delivered'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            Delivered ({orders.filter((o) => o.orderStatus === 'Delivered').length})
          </button>

          <button
            onClick={() => setStatusTabFilter('cancelled')}
            className={`pb-2.5 transition-colors cursor-pointer shrink-0 ${
              statusTabFilter === 'cancelled'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            Cancelled Orders ({orders.filter((o) => ['Cancelled', 'Refunded'].includes(o.orderStatus)).length})
          </button>
        </div>

        {/* Amazon Search Bar & Time Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E2ECE0]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B856B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search all orders by Order # or plant name..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FCF9] border border-[#E2ECE0] rounded-xl text-xs text-[#182319] placeholder:text-[#889C88] focus:outline-none focus:border-[#2D4A27]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#6B856B] font-medium hidden sm:inline">Time Period:</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-[#E2ECE0] text-xs font-bold text-[#182319] rounded-xl focus:outline-none focus:border-[#2D4A27]"
            >
              <option value="all">Past Orders History</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Past 3 Months</option>
              <option value="2026">Year 2026</option>
            </select>
          </div>
        </div>

        {/* Orders Listing */}
        {loadingOrders ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E2ECE0]">
            <RefreshCw className="w-8 h-8 text-[#2D4A27] animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-[#556955]">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E2ECE0] space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#EBF3EB] border border-[#C5E1C9] flex items-center justify-center text-[#2D4A27]">
              <PackageOpen className="w-10 h-10 text-[#2D4A27]" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#182319]">
                {orderSearchQuery ? 'No matching orders found' : 'No Orders Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-[#556955] leading-relaxed">
                {orderSearchQuery
                  ? 'Try searching with a different order ID or plant name.'
                  : "You haven't placed any orders yet. Start browsing our live plant collection and bring green joy to your home."}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('/plants')}
                className="px-7 py-3 bg-[#13301B] hover:bg-[#1F4A2B] text-white rounded-full text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Start Browsing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const canCancel = ['Pending', 'Confirmed', 'Processing'].includes(ord.orderStatus);
            const canReturn = ord.orderStatus === 'Delivered';
            const isCancelled = ord.orderStatus === 'Cancelled' || ord.orderStatus === 'Refunded';

            return (
              <div key={ord.id} className="bg-white rounded-2xl border border-[#E2ECE0] overflow-hidden shadow-xs animate-fadeIn space-y-0">
                {/* Amazon Order Card Header */}
                <div className="bg-[#F5F8F5] p-4 sm:p-5 border-b border-[#E2ECE0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">ORDER PLACED</span>
                    <p className="font-medium text-[#182319] mt-0.5">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">TOTAL PAID</span>
                    <p className="font-serif font-bold text-[#2D4A27] text-sm mt-0.5">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">SHIP TO</span>
                    <div className="group relative inline-block">
                      <p className="font-bold text-[#2D6A4F] hover:underline cursor-pointer mt-0.5 truncate">
                        {ord.shippingAddress?.fullName || ord.customerName || 'Customer'} ▾
                      </p>
                      <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-64 bg-white p-3 border border-stone-200 shadow-xl rounded-xl z-20 text-[11px] text-stone-700">
                        <p className="font-bold text-stone-900">{ord.shippingAddress?.fullName || ord.customerName || 'Customer'}</p>
                        <p>{ord.shippingAddress?.street || ''}</p>
                        <p>{ord.shippingAddress?.city ? `${ord.shippingAddress.city}, ` : ''}{ord.shippingAddress?.state || ''}{ord.shippingAddress?.pincode ? ` - ${ord.shippingAddress.pincode}` : ''}</p>
                        {(ord.shippingAddress?.phone || ord.customerPhone) && (
                          <p className="mt-1 text-stone-500"><i className="fa-solid fa-phone mr-1.5 text-[10px]" aria-hidden="true" />{ord.shippingAddress?.phone || ord.customerPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">ORDER # {ord.orderNumber}</span>
                    <div className="mt-0.5 flex items-center justify-start sm:justify-end gap-2 text-xs">
                      {isCancelled ? (
                        <span className="font-bold text-rose-700">Cancelled</span>
                      ) : (
                        <button
                          onClick={() => handlePrintInvoice(ord)}
                          className="text-[#2D6A4F] font-bold hover:underline"
                        >
                          View Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amazon Status Banner */}
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EDE6]">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-500'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-500'
                            : 'bg-amber-500 animate-pulse'
                        }`}
                      />
                      <h3 className="font-serif font-bold text-base text-[#182319]">
                        {ord.orderStatus === 'Delivered'
                          ? 'Delivered'
                          : isCancelled
                          ? 'Order Cancelled'
                          : `Status: ${ord.orderStatus}`}
                      </h3>
                    </div>

                    {isCancelled && ord.cancelReason && (
                      <span className="text-xs text-[#6B645A]">Reason: {ord.cancelReason}</span>
                    )}
                    {!isCancelled && realShipping(ord).courier && (
                      <span className="text-xs text-[#6B856B] font-mono">
                        Logistics Carrier: <strong>{realShipping(ord).courier}</strong>
                      </span>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-[#F0EDE6]">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                            <PlantImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>

                          <div>
                            <h4 className="font-bold text-sm text-[#182319] hover:text-[#2D4A27] cursor-pointer" onClick={() => navigate(`/product/${item.slug}`)}>
                              {item.name}
                            </h4>
                            <p className="text-xs text-[#6B856B] mt-0.5">
                              Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                            </p>
                            {!isCancelled && (
                              <p className="text-[11px] text-[#768C76] mt-1">
                                Return window open for 7 days after delivery.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Item Actions */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleBuyAgainItem(item)}
                            className="px-4 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Buy Again
                          </button>

                          {ord.orderStatus === 'Delivered' && (
                            <button
                              onClick={() => setReviewItem({ id: item.productId, name: item.name, image: item.image, slug: item.slug })}
                              className="px-3.5 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              Write Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Action Bar */}
                  <div className="pt-4 border-t border-[#E8F0E7] flex flex-wrap items-center justify-between gap-3 bg-[#F8FCF9] p-4 rounded-xl">
                    <div className="flex items-center gap-3 flex-wrap">
                      {isCancelled && (
                        <span className="text-xs font-semibold text-rose-700">
                          This order was cancelled and will not be shipped.
                          {ord.paymentMethod === 'razorpay' && ord.paymentStatus === 'paid' ? ' Our team will refund the amount.' : ''}
                        </span>
                      )}
                      <button
                        hidden={isCancelled}
                        onClick={() => setTrackingModalOrder(ord)}
                        className="px-4 py-2 bg-[#EBF5EC] text-[#2D6A4F] hover:bg-[#D8EEDB] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        Track Package
                      </button>

                      <button
                        onClick={() => handleBuyAgainWholeOrder(ord)}
                        className="px-4 py-2 border border-[#C5E1C9] bg-white text-[#1F341C] hover:bg-[#F0F7F1] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#2D6A4F]" />
                        Re-order All Items
                      </button>

                      {canCancel && (
                        <button
                          onClick={() => setCancelModalOrder(ord)}
                          className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4 text-rose-600" />
                          Cancel Order
                        </button>
                      )}

                      {canReturn && (
                        <button
                          onClick={() => setReturnModalOrder(ord)}
                          className="px-4 py-2 border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 text-amber-600" />
                          Return / Replacement Request
                        </button>
                      )}
                    </div>

                    <a
                      href={`https://wa.me/918004881668?text=Hi%20buddy4plant%20Support,%20I%20need%20help%20with%20my%20Order%20%23${ord.orderNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#2D6A4F] font-bold hover:underline flex items-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      Get Order Support
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Cancel Order */}
      {cancelModalOrder && (
        <CancelOrderModal
          order={cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          onCancelled={() => fetchOrders()}
        />
      )}

      {/* MODAL: Return / Replacement Request */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#0F1710]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-amber-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                Return / Replacement Request
              </h3>
              <button onClick={() => setReturnModalOrder(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturnOrder} className="mt-4 space-y-4 text-xs">
              <p className="text-stone-600">
                Select the item issue for Order <strong>#{returnModalOrder.orderNumber}</strong>. Our team will approve a free replacement plant or refund.
              </p>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Issue Reason *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value="Plant damaged or leaves wilted on arrival">Plant damaged or leaves wilted on arrival</option>
                  <option value="Broken ceramic pot during transport">Broken ceramic pot during transport</option>
                  <option value="Wrong plant or planter size received">Wrong plant or planter size received</option>
                  <option value="Item not as described on store">Item not as described on store</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Additional Comments / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe condition of plant upon unboxing..."
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingReturn}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  {requestingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Write Review */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-[#0F1710]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                Write Plant Review
              </h3>
              <button onClick={() => setReviewItem(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4 text-xs">
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <PlantImage src={reviewItem.image} alt={reviewItem.name} className="w-12 h-12 object-cover rounded-lg" />
                <span className="font-bold text-stone-900 text-sm">{reviewItem.name}</span>
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
                          star <= reviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
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
                  placeholder="Tell other plant lovers how your plant is thriving..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewItem(null)}
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

      {/* MODAL: Visual Order Tracking Progress */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-[#0F1710]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl animate-fadeIn space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2D4A27]" />
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Package Tracking Status</h3>
                  <p className="text-xs text-stone-500 font-mono">Order #{trackingModalOrder.orderNumber}</p>
                </div>
              </div>
              <button onClick={() => setTrackingModalOrder(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8FCF9] p-4 rounded-xl border border-[#E2ECE0] text-xs space-y-1">
              {realShipping(trackingModalOrder).courier || realShipping(trackingModalOrder).awb ? (
                <>
                  <p className="text-[#556955]">Courier Partner: <strong className="text-[#182319]">{realShipping(trackingModalOrder).courier || '-'}</strong></p>
                  {realShipping(trackingModalOrder).awb && (
                    <p className="text-[#556955]">AWB Tracking Code: <strong className="text-[#2D4A27] font-mono">{realShipping(trackingModalOrder).awb}</strong></p>
                  )}
                </>
              ) : (
                <p className="text-[#556955]">{COURIER_PENDING_TEXT}</p>
              )}
              <p className="text-[#556955]">Current Location: <strong className="text-[#182319]">{realShipping(trackingModalOrder).location || 'Buddy4Plant Nursery, Lucknow'}</strong></p>
            </div>

            <div className="space-y-4 relative pl-4 border-l-2 border-[#2D4A27]">
              {(trackingModalOrder.statusHistory || []).map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-[#2D4A27] border-2 border-white" />
                  <p className="font-bold text-xs text-[#182319]">{step.status}</p>
                  <p className="text-[11px] text-[#6B856B]">{step.note || 'Milestone updated'}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{new Date(step.timestamp).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="px-5 py-2 bg-[#2D4A27] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
