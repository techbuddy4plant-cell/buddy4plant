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
  ShieldCheck,
  Bell,
  Key,
  X,
  Sparkles,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { Address, Product } from '../../types';
import { getCustomerOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { ProductCard } from '../common/ProductCard';

interface UserProfilePageProps {
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ navigate, onQuickView }) => {
  const { user, profile, logout, saveAddress, removeAddress, setDefaultAddress, updateProfileDetails, resetPassword, openAuthModal } = useAuth();
  const { wishlistIds } = useWishlist();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'wishlist' | 'settings'>('profile');
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.displayName || user?.displayName || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

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

  useEffect(() => {
    if (user?.uid || profile?.uid) {
      const uid = user?.uid || profile?.uid || '';
      const email = user?.email || profile?.email || undefined;
      getCustomerOrders(uid, email).then((res) => setOrdersCount(res.length));
    }
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
      <div className="max-w-xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mx-auto text-2xl mb-4 shadow-xs">
          <User className="w-8 h-8 text-[#2D4A27]" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-stone-900">Sign in to your Profile</h2>
        <p className="text-xs text-stone-500 mt-2 max-w-md mx-auto">
          Manage your personal account details, shipping addresses, security preferences, and saved items.
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

  // Handle Save Profile
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

  // Handle Reset Password Request
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

  // Handle Save Address
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

  const defaultAddr = profile?.addresses?.find((a) => a.isDefault) || profile?.addresses?.[0];

  return (
    <div className="bg-[#FBFDFB] min-h-screen py-8 sm:py-12 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#182319] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-[#2D4A27] flex items-center gap-3 animate-fadeIn text-xs font-medium">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-[#E2ECE0] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8F5E9]/50 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* User Info */}
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
                    <ShieldCheck className="w-3 h-3 text-[#2D6A4F]" /> Verified Customer Account
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
                    <span>Default Address: <strong>{defaultAddr.city}, {defaultAddr.state} ({defaultAddr.pincode})</strong></span>
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

          {/* Amazon-Style Quick Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#E8F0E7]">
            <div
              onClick={() => navigate('/orders')}
              className="bg-[#F8FCF9] hover:bg-[#EBF5EC] p-4 rounded-xl border border-[#E2ECE0] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#2D4A27]/10 rounded-lg text-[#2D4A27]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#182319] group-hover:text-[#2D4A27]">Your Orders</h4>
                  <p className="text-[11px] text-[#6B856B]">{ordersCount} total orders placed</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B856B] group-hover:translate-x-1 transition-transform" />
            </div>

            <div
              onClick={() => setActiveTab('addresses')}
              className="bg-[#F8FCF9] hover:bg-[#EBF5EC] p-4 rounded-xl border border-[#E2ECE0] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#2D4A27]/10 rounded-lg text-[#2D4A27]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#182319] group-hover:text-[#2D4A27]">Saved Addresses</h4>
                  <p className="text-[11px] text-[#6B856B]">{profile?.addresses?.length || 0} delivery locations</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B856B] group-hover:translate-x-1 transition-transform" />
            </div>

            <div
              onClick={() => setActiveTab('wishlist')}
              className="bg-[#F8FCF9] hover:bg-[#EBF5EC] p-4 rounded-xl border border-[#E2ECE0] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#2D4A27]/10 rounded-lg text-[#2D4A27]">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#182319] group-hover:text-[#2D4A27]">Saved Plants</h4>
                  <p className="text-[11px] text-[#6B856B]">{wishlistIds.length} wishlist items</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B856B] group-hover:translate-x-1 transition-transform" />
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
            onClick={() => setActiveTab('profile')}
            className={`pb-4.5 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-b-2 border-[#2D4A27] text-[#2D4A27] font-extrabold'
                : 'text-[#6B856B] hover:text-[#182319]'
            }`}
          >
            <User className="w-4 h-4" />
            My Profile Information
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
            Account Security & Preferences
          </button>
        </div>

        {/* TAB 1: MY PROFILE INFO */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-[#E2ECE0] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8F0E7]">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#182319]">Personal Account Information</h3>
                <p className="text-xs text-[#556955] mt-0.5">Manage your personal credentials and phone number.</p>
              </div>

              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-[#2D4A27] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1F341C] transition-colors"
              >
                Edit Info
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-[#F8FCF9] rounded-xl border border-[#E2ECE0]">
                <span className="font-bold text-[#6B856B] uppercase tracking-wider text-[10px]">Full Display Name</span>
                <p className="font-bold text-sm text-[#182319] mt-1">{profile?.displayName || user?.displayName || 'Not specified'}</p>
              </div>

              <div className="p-4 bg-[#F8FCF9] rounded-xl border border-[#E2ECE0]">
                <span className="font-bold text-[#6B856B] uppercase tracking-wider text-[10px]">Primary Email</span>
                <p className="font-bold text-sm text-[#182319] mt-1">{user?.email || profile?.email}</p>
              </div>

              <div className="p-4 bg-[#F8FCF9] rounded-xl border border-[#E2ECE0]">
                <span className="font-bold text-[#6B856B] uppercase tracking-wider text-[10px]">Mobile Phone Number</span>
                <p className="font-bold text-sm text-[#182319] mt-1">{profile?.phone || 'Not added yet'}</p>
              </div>

              <div className="p-4 bg-[#F8FCF9] rounded-xl border border-[#E2ECE0]">
                <span className="font-bold text-[#6B856B] uppercase tracking-wider text-[10px]">Account Verification</span>
                <p className="font-bold text-sm text-[#2D6A4F] mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" /> Active Verified Customer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2ECE0]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#182319]">Saved Delivery Addresses</h3>
                <p className="text-xs text-[#556955] mt-0.5">Manage your shipping destinations for 1-click checkout.</p>
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

            {/* Address Form */}
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

        {/* TAB 3: WISHLIST */}
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

        {/* TAB 4: ACCOUNT SECURITY & SETTINGS */}
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
