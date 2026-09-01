import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Truck,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Bell,
  Key,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  Star,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Copy,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Order, Address, Product, OrderItem, OrderStatus } from '../../types';
import { getCustomerOrders, cancelOrder, requestOrderReturn } from '../../services/orderService';
import { getProducts, getProductById, getProductBySlug } from '../../services/productService';
import { ProductCard } from '../common/ProductCard';
import { PlantImage } from '../../utils/imageFallback';

interface UserProfilePageProps {
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ navigate, onQuickView }) => {
  const { user, profile, logout, saveAddress, removeAddress, setDefaultAddress, updateProfileDetails, resetPassword, openAuthModal } = useAuth();
  const { wishlistIds } = useWishlist();
  const { addToCart, setIsCartDrawerOpen } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'settings'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('address')) return 'addresses';
      if (path.includes('order')) return 'orders';
      if (path.includes('wishlist')) return 'wishlist';
      if (path.includes('setting')) return 'settings';
    }
    return 'orders';
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusTabFilter, setStatusTabFilter] = useState<'all' | 'unshipped' | 'delivered' | 'cancelled'>('all');
  const [timeFilter, setTimeFilter] = useState<'30days' | '3months' | '2026' | 'all'>('all');
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.displayName || user?.displayName || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Amazon-style Order Modals State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Order placed by mistake');
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Plant damaged or leaves wilted');
  const [returnComments, setReturnComments] = useState('');
  const [requestingReturn, setRequestingReturn] = useState(false);

  const [reviewItem, setReviewItem] = useState<{ id: string; name: string; image: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);

  // Address Form State (Add / Edit)
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Address>({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    landmark: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    isDefault: false,
  });

  // Preferences Toggles
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [careReminders, setCareReminders] = useState(true);

  useEffect(() => {
    if (profile) {
      setEditName(profile.displayName || user?.displayName || '');
      setEditPhone(profile.phone || '');
    }
  }, [profile, user]);

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

  useEffect(() => {
    if (wishlistIds.length > 0) {
      getProducts().then((all) => {
        setWishlistProducts(all.filter((p) => wishlistIds.includes(p.id)));
      });
    } else {
      setWishlistProducts([]);
    }
  }, [wishlistIds]);

  if (!user && !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mx-auto text-2xl mb-4 shadow-xs">
          <i className="fa-solid fa-leaf text-[#2D4A27]" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-stone-900">Sign in to your Account</h2>
        <p className="text-xs text-stone-500 mt-2 max-w-md mx-auto">
          Manage your orders, edit delivery addresses, track shipments, and re-order your favorite botanical plants.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 px-6 py-3 bg-[#2D4A27] hover:bg-[#1F341C] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
        >
          Sign In Now &rr;
        </button>
      </div>
    );
  }

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      await updateProfileDetails(editName.trim(), editPhone.trim());
      setIsEditingProfile(false);
      showToast('Profile details updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Reset Password Request
  const handleRequestPasswordReset = async () => {
    const email = user?.email || profile?.email;
    if (email) {
      try {
        await resetPassword(email);
        setPasswordResetSent(true);
        showToast(`Password reset email sent to ${email}`);
      } catch (err: any) {
        showToast(err.message || 'Error sending password reset email');
      }
    }
  };

  // Save Address Form
  const handleSaveAddressForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.fullName || !addrForm.phone || !addrForm.street || !addrForm.city || !addrForm.pincode) {
      showToast('Please fill in all required address fields.');
      return;
    }

    const payload: Address = {
      ...addrForm,
      id: editingAddressId || `addr-${Date.now()}`,
    };

    await saveAddress(payload);
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddrForm({
      fullName: '',
      phone: '',
      email: '',
      street: '',
      landmark: '',
      city: '',
      state: 'Karnataka',
      pincode: '',
      isDefault: false,
    });
    showToast(editingAddressId ? 'Address updated successfully!' : 'New shipping address added!');
  };

  const handleStartEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id || null);
    setAddrForm({ ...addr });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addrId: string | undefined, idx: number) => {
    const target = addrId || idx;
    await removeAddress(target);
    showToast('Address removed');
  };

  const handleMakeDefaultAddress = async (addrId: string | undefined) => {
    if (addrId) {
      await setDefaultAddress(addrId);
      showToast('Default delivery address updated!');
    }
  };

  // Amazon Cancel Order
  const handleConfirmCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setCancellingOrder(true);
    try {
      await cancelOrder(cancelModalOrder.id, cancelReason);
      setCancelModalOrder(null);
      fetchOrders();
      showToast(`Order #${cancelModalOrder.orderNumber} has been cancelled.`);
    } catch (err: any) {
      showToast(err.message || 'Could not cancel order');
    } finally {
      setCancellingOrder(false);
    }
  };

  // Amazon Return / Replacement Request
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

  // Submit Product Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewItem) return;
    setReviewItem(null);
    setReviewComment('');
    setReviewRating(5);
    showToast(`Thank you! Your 5-star review for "${reviewItem.name}" has been published.`);
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
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items
      .map(
        (it) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${it.name} (SKU: ${it.sku || 'N/A'})</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${it.price.toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(it.price * it.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Official Invoice - ${order.orderNumber} | buddy4plant</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; color: #111; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2D4A27; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { color: #2D4A27; font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #f4f6f4; text-align: left; padding: 8px; border-bottom: 1px solid #ccc; font-size: 12px; text-transform: uppercase; }
            .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #2D4A27; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">🌱 buddy4plant</div>
              <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">Official Botanical Store Order Receipt</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 18px;">TAX INVOICE</h2>
              <p style="font-size: 12px; margin: 4px 0 0 0;">Order #: <strong>${order.orderNumber}</strong></p>
              <p style="font-size: 12px; margin: 2px 0 0 0;">Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px;">
            <div>
              <strong>Shipping Destination:</strong><br/>
              ${order.customerName || order.shippingAddress.fullName}<br/>
              ${order.shippingAddress.street}, ${order.shippingAddress.city}<br/>
              ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
              Phone: ${order.customerPhone || order.shippingAddress.phone}
            </div>
            <div style="text-align: right;">
              <strong>Payment Breakdown:</strong><br/>
              Method: ${order.paymentMethod.toUpperCase()}<br/>
              Status: ${order.paymentStatus.toUpperCase()}<br/>
              Order Status: <strong>${order.orderStatus}</strong>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Plant Specimen Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 24px; text-align: right; font-size: 14px;">
            <p style="margin: 4px 0;">Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}</p>
            ${order.discount ? `<p style="margin: 4px 0; color: green;">Discount: -₹${order.discount.toLocaleString('en-IN')}</p>` : ''}
            <p style="margin: 4px 0;">Delivery: ${order.shippingCharge === 0 ? 'FREE' : '₹' + order.shippingCharge}</p>
            <p class="total-row" style="margin: 8px 0 0 0; padding-top: 8px;">Grand Total: ₹${order.total.toLocaleString('en-IN')}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #777;">
            Thank you for nurturing nature with buddy4plant! Support: support@buddy4plant.com
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filter Orders (Search + Status Tab + Time Filter)
  const filteredOrders = orders.filter((ord) => {
    // 1. Search Query
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matches =
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.items.some((it) => it.name.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // 2. Status Tab Filter
    if (statusTabFilter === 'unshipped') {
      if (['Delivered', 'Cancelled', 'Refunded'].includes(ord.orderStatus)) return false;
    } else if (statusTabFilter === 'delivered') {
      if (ord.orderStatus !== 'Delivered') return false;
    } else if (statusTabFilter === 'cancelled') {
      if (!['Cancelled', 'Refunded'].includes(ord.orderStatus)) return false;
    }

    // 3. Time Filter
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

  const defaultAddr = profile?.addresses?.find((a) => a.isDefault) || profile?.addresses?.[0];

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
        {/* Profile Banner & Quick Stats */}
        <div className="bg-white rounded-2xl border border-[#E2ECE0] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8F5E9]/50 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* User Info Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#2D4A27] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold font-serif shadow-md border-2 border-emerald-300/30 shrink-0">
                {(profile?.displayName || user?.displayName || 'P')[0].toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#182319]">
                    {profile?.displayName || user?.displayName || 'Botanical Enthusiast'}
                  </h1>
                  <span className="px-2.5 py-0.5 bg-[#EBF5EC] border border-[#C5E1C9] text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#2D6A4F]" /> Amazon-Style Verified Account
                  </span>
                </div>

                <p className="text-xs text-[#556955] mt-1 flex items-center gap-2 flex-wrap">
                  <span>{user?.email || profile?.email}</span>
                  {profile?.phone && (
                    <>
                      <span>•</span>
                      <span>📞 {profile.phone}</span>
                    </>
                  )}
                </p>

                {defaultAddr && (
                  <p className="text-[11px] text-[#768C76] mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Default Shipping: <strong>{defaultAddr.city}, {defaultAddr.state} ({defaultAddr.pincode})</strong></span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2.5 bg-[#F0F7F1] hover:bg-[#E2F0E4] border border-[#C5E1C9] text-[#1F341C] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-[#2D6A4F]" />
                Edit Profile
              </button>

              <button
                onClick={logout}
                className="px-4 py-2.5 border border-stone-300 hover:border-rose-300 text-stone-700 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick Account Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#E8F0E7]">
            <div className="bg-[#F8FCF9] p-3.5 rounded-xl border border-[#E2ECE0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">Total Orders</span>
              <p className="font-serif font-bold text-xl text-[#1F341C] mt-0.5">{orders.length}</p>
            </div>

            <div className="bg-[#F8FCF9] p-3.5 rounded-xl border border-[#E2ECE0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">Saved Plants</span>
              <p className="font-serif font-bold text-xl text-[#2D6A4F] mt-0.5">{wishlistIds.length}</p>
            </div>

            <div className="bg-[#F8FCF9] p-3.5 rounded-xl border border-[#E2ECE0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">Saved Addresses</span>
              <p className="font-serif font-bold text-xl text-[#1F341C] mt-0.5">{profile?.addresses?.length || 0}</p>
            </div>

            <div className="bg-[#F8FCF9] p-3.5 rounded-xl border border-[#E2ECE0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">Primary Pincode</span>
              <p className="font-serif font-bold text-sm text-[#2D6A4F] mt-1.5 truncate">
                {defaultAddr?.pincode ? `PIN: ${defaultAddr.pincode}` : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal: Edit Profile Info */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 bg-[#0F1710]/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#2D4A27]" />
                  Edit Profile Details
                </h3>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2D4A27]/20 focus:border-[#2D4A27] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2D4A27]/20 focus:border-[#2D4A27] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || profile?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 text-stone-500 rounded-xl text-xs cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-[#E2ECE0] gap-4 sm:gap-8 text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4.5 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            <Package className="w-4 h-4" />
            Your Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-4.5 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Saved Addresses ({profile?.addresses?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-4.5 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'wishlist'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved Plants ({wishlistIds.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4.5 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            <Key className="w-4 h-4" />
            Account & Security Settings
          </button>
        </div>

        {/* TAB 1: AMAZON-STYLE ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Amazon-style Status Filter Tabs */}
            <div className="flex border-b border-[#E2ECE0] gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-1">
              <button
                onClick={() => setStatusTabFilter('all')}
                className={`pb-2.5 transition-colors cursor-pointer shrink-0 ${
                  statusTabFilter === 'all'
                    ? 'border-b-2 border-[#2D4A27] text-[#2D4A27]'
                    : 'text-[#6B856B] hover:text-[#182319]'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setStatusTabFilter('unshipped')}
                className={`pb-2.5 transition-colors cursor-pointer shrink-0 ${
                  statusTabFilter === 'unshipped'
                    ? 'border-b-2 border-[#2D4A27] text-[#2D4A27]'
                    : 'text-[#6B856B] hover:text-[#182319]'
                }`}
              >
                Not Yet Shipped / Processing ({orders.filter((o) => !['Delivered', 'Cancelled', 'Refunded'].includes(o.orderStatus)).length})
              </button>
              <button
                onClick={() => setStatusTabFilter('delivered')}
                className={`pb-2.5 transition-colors cursor-pointer shrink-0 ${
                  statusTabFilter === 'delivered'
                    ? 'border-b-2 border-[#2D4A27] text-[#2D4A27]'
                    : 'text-[#6B856B] hover:text-[#182319]'
                }`}
              >
                Delivered ({orders.filter((o) => o.orderStatus === 'Delivered').length})
              </button>
              <button
                onClick={() => setStatusTabFilter('cancelled')}
                className={`pb-2.5 transition-colors cursor-pointer shrink-0 ${
                  statusTabFilter === 'cancelled'
                    ? 'border-b-2 border-[#2D4A27] text-[#2D4A27]'
                    : 'text-[#6B856B] hover:text-[#182319]'
                }`}
              >
                Cancelled & Refunded ({orders.filter((o) => ['Cancelled', 'Refunded'].includes(o.orderStatus)).length})
              </button>
            </div>

            {/* Amazon-style Search & Time Range Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2ECE0]">
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
                <span className="text-xs text-[#6B856B] font-medium hidden sm:inline">Time Range:</span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-[#E2ECE0] text-xs font-bold text-[#182319] rounded-xl focus:outline-none focus:border-[#2D4A27]"
                >
                  <option value="all">All Orders History</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="3months">Past 3 Months</option>
                  <option value="2026">Year 2026</option>
                </select>
              </div>
            </div>

            {loadingOrders ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E2ECE0]">
                <RefreshCw className="w-8 h-8 text-[#2D4A27] animate-spin mx-auto mb-3" />
                <p className="text-xs font-medium text-[#556955]">Loading your Amazon-style order hub...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E2ECE0]">
                <Package className="w-12 h-12 text-[#95D5B2] mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base text-[#182319]">
                  {orderSearchQuery ? 'No matching orders found' : 'No orders in selected filter'}
                </h3>
                <p className="text-xs text-[#556955] mt-1 max-w-sm mx-auto">
                  {orderSearchQuery
                    ? 'Try searching with a different order ID or plant name.'
                    : 'Explore our botanical catalogue and place your first plant order.'}
                </p>
                <button
                  onClick={() => navigate('/plants')}
                  className="mt-5 px-6 py-2.5 bg-[#2D4A27] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Explore Catalogue &rr;
                </button>
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const canCancel = ['Pending', 'Confirmed', 'Processing'].includes(ord.orderStatus);
                const canReturn = ord.orderStatus === 'Delivered';

                return (
                  <div key={ord.id} className="bg-white rounded-2xl border border-[#E2ECE0] overflow-hidden shadow-xs animate-fadeIn">
                    {/* Amazon Order Header Card */}
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
                            {ord.shippingAddress.fullName} ▾
                          </p>
                          <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-64 bg-white p-3 border border-stone-200 shadow-xl rounded-xl z-20 text-[11px] text-stone-700">
                            <p className="font-bold text-stone-900">{ord.shippingAddress.fullName}</p>
                            <p>{ord.shippingAddress.street}</p>
                            <p>{ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.pincode}</p>
                            <p className="mt-1 text-stone-500">📞 {ord.shippingAddress.phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B856B]">ORDER # {ord.orderNumber}</span>
                        <div className="mt-0.5 flex items-center justify-start sm:justify-end gap-2 text-xs">
                          <button
                            onClick={() => handlePrintInvoice(ord)}
                            className="text-[#2D6A4F] font-bold hover:underline"
                          >
                            View Invoice
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Amazon Order Status Banner */}
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
                              ? 'Delivered Botanical Order'
                              : ord.orderStatus === 'Cancelled'
                              ? 'Cancelled Order'
                              : `Status: ${ord.orderStatus}`}
                          </h3>
                        </div>

                        <span className="text-xs text-[#6B856B] font-mono">
                          Logistics Carrier: <strong>{ord.deliveryCourier || 'BlueDart Botanical Express'}</strong>
                        </span>
                      </div>

                      {/* Order Items & Action Bar */}
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
                                <p className="text-[11px] text-[#768C76] mt-1">
                                  Return window open for 7 days after delivery.
                                </p>
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
                                  onClick={() => setReviewItem({ id: item.productId, name: item.name, image: item.image })}
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

                      {/* Amazon-style Order Footer Action Bar */}
                      <div className="pt-4 border-t border-[#E8F0E7] flex flex-wrap items-center justify-between gap-3 bg-[#F8FCF9] p-4 rounded-xl">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
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
                          href={`https://wa.me/919876543210?text=Hi%20buddy4plant%20Support,%20I%20need%20help%20with%20my%20Order%20%23${ord.orderNumber}`}
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
        )}

        {/* MODAL: Amazon Cancel Order */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 bg-[#0F1710]/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif font-bold text-lg text-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  Cancel Order #{cancelModalOrder.orderNumber}
                </h3>
                <button onClick={() => setCancelModalOrder(null)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmCancelOrder} className="mt-4 space-y-4 text-xs">
                <p className="text-stone-600">
                  Are you sure you want to cancel this order? If paid online, your refund will be credited back to your original payment source.
                </p>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Select Cancellation Reason *
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                  >
                    <option value="Order placed by mistake">Order placed by mistake</option>
                    <option value="Item would not arrive in time">Item would not arrive in time</option>
                    <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                    <option value="Need to change delivery address">Need to change delivery address</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelModalOrder(null)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-semibold"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={cancellingOrder}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    {cancellingOrder ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Amazon Return / Replacement Request */}
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
                  Select the item issue for Order <strong>#{returnModalOrder.orderNumber}</strong>. Our botanical quality team will approve a free replacement specimen or full refund.
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

        {/* MODAL: Write Product Review */}
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
                    className="px-5 py-2 bg-[#2D4A27] text-white font-bold uppercase tracking-wider rounded-xl shadow-xs"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Visual Live Order Tracking Progress */}
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

              {/* Courier Details */}
              <div className="bg-[#F8FCF9] p-4 rounded-xl border border-[#E2ECE0] text-xs space-y-1">
                <p className="text-[#556955]">Courier Partner: <strong className="text-[#182319]">{trackingModalOrder.deliveryCourier || 'BlueDart Express Eco'}</strong></p>
                <p className="text-[#556955]">AWB Tracking Code: <strong className="text-[#2D4A27] font-mono">{trackingModalOrder.trackingNumber || 'B4P-EXP-84729'}</strong></p>
                <p className="text-[#556955]">Current Transit Hub: <strong className="text-[#182319]">{trackingModalOrder.currentLocation || 'Bengaluru Sorting Center'}</strong></p>
              </div>

              {/* Visual Step-by-Step Progress Timeline */}
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

        {/* TAB 2: SAVED ADDRESSES & EDIT ADDRESS */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2ECE0]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#182319]">Saved Delivery Addresses</h3>
                <p className="text-xs text-[#556955] mt-0.5">Manage your shipping destinations for fast checkout.</p>
              </div>

              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setAddrForm({
                    fullName: '',
                    phone: '',
                    email: '',
                    street: '',
                    landmark: '',
                    city: '',
                    state: 'Karnataka',
                    pincode: '',
                    isDefault: false,
                  });
                  setShowAddressForm(!showAddressForm);
                }}
                className="px-4 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                {showAddressForm ? 'Close Address Form' : 'Add New Address'}
              </button>
            </div>

            {/* Address Add / Edit Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddressForm} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#C5E1C9] space-y-4 animate-fadeIn shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h4 className="font-serif font-bold text-sm text-[#182319]">
                    {editingAddressId ? 'Edit Shipping Address' : 'Add New Delivery Address'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#556955] uppercase tracking-wider mb-1">Full Receiver Name *</label>
                    <input
                      type="text"
                      required
                      value={addrForm.fullName}
                      onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#556955] uppercase tracking-wider mb-1">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#556955] uppercase tracking-wider mb-1">Street Address / House No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="House No, Apartment, Street name"
                      value={addrForm.street}
                      onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#556955] uppercase tracking-wider mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="Near metro station, park, etc."
                      value={addrForm.landmark || ''}
                      onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#556955] uppercase tracking-wider mb-1">City / District *</label>
                    <input
                      type="text"
                      required
                      value={addrForm.city}
                      onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#556955] uppercase tracking-wider mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={addrForm.state}
                      onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#556955] uppercase tracking-wider mb-1">Postal Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addrForm.pincode}
                      onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-[#2D4A27] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefaultAddrCheck"
                      checked={addrForm.isDefault}
                      onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                      className="rounded accent-[#2D4A27]"
                    />
                    <label htmlFor="isDefaultAddrCheck" className="text-xs text-[#182319] font-medium cursor-pointer">
                      Set as my default primary shipping address
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#2D4A27] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs"
                  >
                    {editingAddressId ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Saved Address Cards */}
            {!profile?.addresses || profile.addresses.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E2ECE0]">
                <MapPin className="w-12 h-12 text-[#95D5B2] mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base text-[#182319]">No saved addresses</h3>
                <p className="text-xs text-[#556955] mt-1">Add your shipping details for 1-click checkout experience.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.addresses.map((addr, i) => (
                  <div
                    key={addr.id || i}
                    className={`bg-white p-6 rounded-2xl border ${
                      addr.isDefault ? 'border-[#2D4A27] ring-1 ring-[#2D4A27]/20 shadow-md' : 'border-[#E2ECE0]'
                    } flex flex-col justify-between text-xs space-y-4 relative`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#182319] text-sm">{addr.fullName}</span>
                        {addr.isDefault ? (
                          <span className="text-[10px] font-bold bg-[#2D6A4F] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Default Address
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMakeDefaultAddress(addr.id)}
                            className="text-[10px] text-[#2D6A4F] hover:underline font-bold"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                      <p className="text-[#556955] leading-relaxed">{addr.street}</p>
                      {addr.landmark && <p className="text-[#6B856B] text-[11px]">Landmark: {addr.landmark}</p>}
                      <p className="text-[#556955] font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-[#6B856B] mt-2">📞 {addr.phone}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E8F0E7] flex items-center justify-between">
                      <button
                        onClick={() => handleStartEditAddress(addr)}
                        className="text-[#2D6A4F] hover:text-[#1F341C] flex items-center gap-1 text-xs font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Address
                      </button>

                      <button
                        onClick={() => handleDeleteAddress(addr.id, i)}
                        className="text-stone-400 hover:text-rose-600 flex items-center gap-1 text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WISHLIST (SAVED PLANTS) */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E2ECE0]">
                <Heart className="w-12 h-12 text-[#95D5B2] mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base text-[#182319]">Your plant wishlist is empty</h3>
                <p className="text-xs text-[#556955] mt-1">Tap the heart icon on any live plant or pot to save it here.</p>
                <button
                  onClick={() => navigate('/plants')}
                  className="mt-5 px-6 py-2.5 bg-[#2D4A27] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Browse Catalogue &rr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((p) => (
                  <ProductCard key={p.id} product={p} navigate={navigate} onQuickView={onQuickView} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACCOUNT DETAILS & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-[#E2ECE0] p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#182319] flex items-center gap-2">
                <Key className="w-5 h-5 text-[#2D4A27]" />
                Account Security & Preferences
              </h3>
              <p className="text-xs text-[#556955] mt-1">Manage password resets, notifications, and store settings.</p>
            </div>

            {/* Password Reset Section */}
            <div className="p-5 bg-[#F8FCF9] rounded-xl border border-[#E2ECE0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-[#182319] uppercase tracking-wider">Account Password</h4>
                <p className="text-xs text-[#556955] mt-0.5">
                  Request a secure password reset link to be sent to your registered email address.
                </p>
              </div>

              <button
                onClick={handleRequestPasswordReset}
                disabled={passwordResetSent}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
              >
                {passwordResetSent ? 'Reset Email Sent ✓' : 'Send Password Reset Email'}
              </button>
            </div>

            {/* Notifications Preferences */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-[#182319] uppercase tracking-wider">Communication Preferences</h4>

              <div className="p-4 border border-[#E2ECE0] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#2D6A4F]" />
                  <div>
                    <p className="text-xs font-bold text-[#182319]">WhatsApp Order & Delivery Tracking Alerts</p>
                    <p className="text-[11px] text-[#6B856B]">Receive instant delivery notifications on your phone.</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#2D4A27] cursor-pointer"
                />
              </div>

              <div className="p-4 border border-[#E2ECE0] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#2D6A4F]" />
                  <div>
                    <p className="text-xs font-bold text-[#182319]">Seasonal Plant Care Reminders & Guides</p>
                    <p className="text-[11px] text-[#6B856B]">Get monthly watering & organic fertilizing tips.</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={careReminders}
                  onChange={(e) => setCareReminders(e.target.checked)}
                  className="w-4 h-4 accent-[#2D4A27] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
