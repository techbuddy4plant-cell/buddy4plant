import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Truck,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Order, Address, Product } from '../../types';
import { getCustomerOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { ProductCard } from '../common/ProductCard';
import { PlantImage } from '../../utils/imageFallback';

interface UserProfilePageProps {
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ navigate, onQuickView }) => {
  const { user, profile, logout, saveAddress, removeAddress, openAuthModal } = useAuth();
  const { wishlistIds } = useWishlist();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'settings'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('address')) return 'addresses';
      if (path.includes('order')) return 'orders';
      if (path.includes('wishlist')) return 'wishlist';
    }
    return 'orders';
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Address>({
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

  useEffect(() => {
    const fetchOrders = () => {
      if (user?.uid || profile?.uid) {
        const uid = user?.uid || profile?.uid || '';
        const email = user?.email || profile?.email || undefined;
        getCustomerOrders(uid, email).then((res) => {
          setOrders(res);
          setLoadingOrders(false);
        });
      }
    };

    fetchOrders();

    const handleLiveOrderUpdate = () => {
      fetchOrders();
    };

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
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mx-auto text-2xl mb-4">
          <i className="fa-solid fa-leaf text-[#2D4A27]" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-stone-900">Sign in to your account</h2>
        <p className="text-xs text-stone-500 mt-2">
          View your order history, manage delivery addresses, and view saved plants.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 px-6 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold"
        >
          Sign In Now &rarr;
        </button>
      </div>
    );
  }

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.street || !newAddr.city || !newAddr.pincode) return;
    await saveAddress(newAddr);
    setShowAddAddress(false);
    setNewAddr({
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
  };

  return (
    <div className="bg-stone-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xl font-bold font-serif">
              {(profile?.displayName || user?.displayName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl text-stone-900">
                {profile?.displayName || user?.displayName || 'Plant Lover'}
              </h1>
              <p className="text-xs text-stone-500">{user?.email || profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 mb-6 gap-6 text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'orders'
                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'wishlist'
                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved Plants ({wishlistIds.length})
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'addresses'
                ? 'border-b-2 border-emerald-900 text-emerald-950 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Addresses ({profile?.addresses?.length || 0})
          </button>
        </div>

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base text-stone-800">No orders placed yet</h3>
                <p className="text-xs text-stone-500 mt-1">Discover curated greens and place your first order.</p>
                <button
                  onClick={() => navigate('/plants')}
                  className="mt-4 px-5 py-2 bg-emerald-950 text-white rounded-xl text-xs font-semibold"
                >
                  Explore Plants &rarr;
                </button>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
                    <div>
                      <span className="text-xs font-bold text-stone-900">{ord.orderNumber}</span>
                      <span className="text-[11px] text-stone-400 block">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full uppercase">
                        {ord.orderStatus}
                      </span>
                      <button
                        onClick={() => navigate(`/track-order?id=${ord.orderNumber}`)}
                        className="text-xs text-emerald-900 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Track
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {ord.items.map((item, i) => (
                      <div key={i} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <PlantImage src={item.image} alt={item.name} className="w-10 h-10 object-cover border border-stone-200" />
                          <div>
                            <span className="font-semibold text-stone-900">{item.name}</span>
                            <span className="text-stone-500 block text-[11px]">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-stone-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500">Payment: <strong className="text-stone-800 uppercase">{ord.paymentMethod} ({ord.paymentStatus})</strong></span>
                    <span className="font-bold text-sm text-emerald-950">Total: ₹{ord.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base text-stone-800">Your wishlist is empty</h3>
                <p className="text-xs text-stone-500 mt-1">Tap the heart icon on any plant to save it here for later.</p>
                <button
                  onClick={() => navigate('/plants')}
                  className="mt-4 px-5 py-2 bg-emerald-950 text-white rounded-xl text-xs font-semibold"
                >
                  Browse Catalogue &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    navigate={navigate}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-base text-stone-900">Saved Addresses</h3>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="px-4 py-2 bg-emerald-950 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddAddress ? 'Cancel' : 'Add New Address'}
              </button>
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 animate-fadeIn">
                <h4 className="font-serif font-bold text-sm text-stone-900">Add New Shipping Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-950 text-white rounded-xl text-xs font-semibold"
                >
                  Save Address
                </button>
              </form>
            )}

            {/* List of Saved Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile?.addresses?.map((addr, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-stone-900 text-sm">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-stone-600">{addr.street}</p>
                    {addr.landmark && <p className="text-stone-500">{addr.landmark}</p>}
                    <p className="text-stone-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-stone-500 mt-2">Phone: {addr.phone}</p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 mt-4 flex justify-end">
                    <button
                      onClick={() => removeAddress(i)}
                      className="text-stone-400 hover:text-rose-600 flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
