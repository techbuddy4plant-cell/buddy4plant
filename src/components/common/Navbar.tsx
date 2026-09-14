import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Truck,
  Sparkles,
  MapPin,
  ExternalLink,
  LogOut,
  LayoutDashboard,
  MessageCircle,
  Phone,
  Home,
  Grid,
  Gift
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Category, Product } from '../../types';
import { getAllCategories } from '../../services/categoryService';
import { getAllProducts } from '../../services/productService';
import { PlantImage } from '../../utils/imageFallback';
import { Buddy4PlantLogo } from './Buddy4PlantLogo';
import { AnnouncementTicker } from './AnnouncementTicker';

interface NavbarProps {
  currentPath?: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath = '/', navigate }) => {
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, profile, isAdmin, openAuthModal, promptSignOut } = useAuth();
  const { settings } = useStoreSettings();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllCategories().then(setCategories);
    getAllProducts().then(setAllProducts);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.plantType.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
        .slice(0, 5);
      setSearchSuggestions(filtered);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const handleProductSelect = (slug: string) => {
    navigate(`/product/${slug}`);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FDFCF9]/98 backdrop-blur-md border-b border-[#E5E2D9] transition-all">
        {/* Dynamic News Motion Announcement Ticker */}
        <AnnouncementTicker />

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Mobile Hamburger Trigger */}
            <div className="flex items-center lg:hidden">
              <button
                id="mobile-menu-btn"
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-[#1F341C] hover:text-[#182319] hover:bg-[#EBF3EC] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D4A27]/20"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo & Brand Identity */}
            <div
              id="brand-logo-container"
              className="flex items-center cursor-pointer select-none"
              onClick={() => navigate('/')}
            >
              <Buddy4PlantLogo
                size={38}
                showText={true}
                textColor="#1F341C"
                className="transform transition-transform active:scale-95"
              />
            </div>

            {/* Desktop Navigation Links - Exact Match to Screenshot */}
            <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7 text-[12px] font-bold tracking-tight text-[#4A4A4A]">
              <button
                id="nav-home"
                onClick={() => navigate('/')}
                className={`py-2 transition-colors relative flex items-center ${
                  currentPath === '/' ? 'text-[#1F3B22] font-extrabold' : 'text-[#4A4A4A] hover:text-[#1F3B22]'
                }`}
              >
                Home
                {currentPath === '/' && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#1F3B22] rounded-full" />
                )}
              </button>

              {/* All Plants with Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveMegaMenu('plants')}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <button
                  id="nav-plants-menu"
                  onClick={() => navigate('/plants')}
                  className={`py-2 transition-colors relative flex items-center gap-1 ${
                    currentPath === '/plants' || (currentPath.startsWith('/plants') && !currentPath.includes('pots-planters') && !currentPath.includes('plant-care') && !currentPath.includes('combos'))
                      ? 'text-[#1F3B22] font-extrabold'
                      : 'text-[#4A4A4A] hover:text-[#1F3B22]'
                  }`}
                >
                  All Plants
                  <ChevronDown className="w-3.5 h-3.5 text-[#7A7A7A] group-hover:rotate-180 transition-transform" />
                  {(currentPath === '/plants' || (currentPath.startsWith('/plants') && !currentPath.includes('pots-planters') && !currentPath.includes('plant-care') && !currentPath.includes('combos'))) && (
                    <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#1F3B22] rounded-full" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {activeMegaMenu === 'plants' && (
                  <div
                    id="mega-menu-plants"
                    className="absolute top-full left-0 w-64 bg-[#FDFCF9] border border-[#E5E2D9] shadow-xl p-3 rounded-2xl animate-fadeIn z-50"
                  >
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          navigate('/plants/indoor-plants');
                          setActiveMegaMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#4A4A4A] hover:text-[#1F3B22] hover:bg-[#F3F1EB] rounded-xl transition-colors font-medium flex items-center justify-between"
                      >
                        <span>Indoor Foliage</span>
                        <span className="text-[10px] text-[#8A8A8A]">Airy leaves</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/air-purifying');
                          setActiveMegaMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#4A4A4A] hover:text-[#1F3B22] hover:bg-[#F3F1EB] rounded-xl transition-colors font-medium flex items-center justify-between"
                      >
                        <span>Air Purifying</span>
                        <span className="text-[10px] text-[#2D6A4F] font-bold">NASA</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/low-maintenance');
                          setActiveMegaMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#4A4A4A] hover:text-[#1F3B22] hover:bg-[#F3F1EB] rounded-xl transition-colors font-medium flex items-center justify-between"
                      >
                        <span>Low Maintenance</span>
                        <span className="text-[10px] text-[#8A8A8A]">Beginner</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/cacti-succulents');
                          setActiveMegaMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#4A4A4A] hover:text-[#1F3B22] hover:bg-[#F3F1EB] rounded-xl transition-colors font-medium flex items-center justify-between"
                      >
                        <span>Cacti &amp; Succulents</span>
                        <span className="text-[10px] text-[#8A8A8A]">Sun lovers</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/flowering-plants');
                          setActiveMegaMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#4A4A4A] hover:text-[#1F3B22] hover:bg-[#F3F1EB] rounded-xl transition-colors font-medium flex items-center justify-between"
                      >
                        <span>Flowering Houseplants</span>
                        <span className="text-[10px] text-pink-600">Blooms</span>
                      </button>
                      <div className="pt-2 border-t border-[#EAE7DF] mt-1">
                        <button
                          onClick={() => {
                            navigate('/plants');
                            setActiveMegaMenu(null);
                          }}
                          className="w-full text-center py-1.5 text-xs text-[#1F3B22] font-bold hover:underline"
                        >
                          View All Nursery Flora &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pots & Planters */}
              <button
                id="nav-pots"
                onClick={() => navigate('/plants/pots-planters')}
                className={`py-2 transition-colors relative flex items-center ${
                  currentPath.includes('pots-planters')
                    ? 'text-[#1F3B22] font-extrabold'
                    : 'text-[#4A4A4A] hover:text-[#1F3B22]'
                }`}
              >
                Pots &amp; Planters
                {currentPath.includes('pots-planters') && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#1F3B22] rounded-full" />
                )}
              </button>

              {/* Plant Care */}
              <button
                id="nav-care"
                onClick={() => navigate('/plants/plant-care')}
                className={`py-2 transition-colors relative flex items-center ${
                  currentPath.includes('plant-care')
                    ? 'text-[#1F3B22] font-extrabold'
                    : 'text-[#4A4A4A] hover:text-[#1F3B22]'
                }`}
              >
                Plant Care
                {currentPath.includes('plant-care') && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#1F3B22] rounded-full" />
                )}
              </button>

              {/* Combos & Gifts */}
              <button
                id="nav-combos"
                onClick={() => navigate('/plants/combos')}
                className={`py-2 transition-colors relative flex items-center gap-1.5 ${
                  currentPath.includes('combos')
                    ? 'text-[#1F3B22] font-extrabold'
                    : 'text-[#4A4A4A] hover:text-[#1F3B22]'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-[#1F3B22]" />
                Combos &amp; Gifts
                {currentPath.includes('combos') && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#1F3B22] rounded-full" />
                )}
              </button>

              {/* Projects */}
              <button
                id="nav-projects"
                onClick={() => navigate('/projects')}
                className={`py-2 transition-colors relative flex items-center gap-1.5 ${
                  currentPath.startsWith('/projects')
                    ? 'text-[#1F3B22] font-extrabold'
                    : 'text-[#4A4A4A] hover:text-[#1F3B22]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1F3B22]" />
                Projects
                {currentPath.startsWith('/projects') && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#1F3B22] rounded-full" />
                )}
              </button>

              {/* Track Order */}
              <button
                id="nav-track-order"
                onClick={() => navigate('/track-order')}
                className={`py-2 transition-colors relative flex items-center gap-1.5 ${
                  currentPath.startsWith('/track-order')
                    ? 'text-[#1F3B22] font-extrabold'
                    : 'text-[#4A4A4A] hover:text-[#1F3B22]'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-[#1F3B22]" />
                Track Order
                {currentPath.startsWith('/track-order') && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#1F3B22] rounded-full" />
                )}
              </button>
            </nav>

            {/* Right Action Icons (Search, Wishlist, Cart, Account) */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Button */}
              <button
                id="search-btn"
                type="button"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="p-2 text-[#1F341C] hover:text-[#182319] hover:bg-[#EBF3EC] rounded-full transition-colors"
                aria-label="Search nursery catalogue"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
              <button
                id="wishlist-btn"
                type="button"
                onClick={() => navigate('/wishlist')}
                className="p-2 text-[#1F341C] hover:text-[#182319] hover:bg-[#EBF3EC] rounded-full relative transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span
                    id="wishlist-badge"
                    className="absolute -top-0.5 -right-0.5 bg-[#2D4A27] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                  >
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                id="cart-btn"
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="p-2 text-[#1F341C] hover:text-[#182319] hover:bg-[#EBF3EC] rounded-full relative transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span
                    id="cart-badge"
                    className="absolute -top-0.5 -right-0.5 bg-[#2D6A4F] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce"
                  >
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Account Icon & Dropdown */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  id="account-menu-btn"
                  type="button"
                  onClick={() => {
                    if (!user && !isAdmin) {
                      openAuthModal('login');
                    } else {
                      setIsAccountMenuOpen(!isAccountMenuOpen);
                    }
                  }}
                  className="flex items-center gap-1.5 p-2 text-[#1F341C] hover:text-[#182319] hover:bg-[#EBF3EC] rounded-full transition-colors"
                  aria-label="Account options"
                >
                  <UserIcon className="w-5 h-5" />
                  {isAdmin && (
                    <span className="hidden xl:inline-block text-[9px] font-bold uppercase tracking-wider bg-[#2D4A27] text-white px-2 py-0.5 rounded-xs">
                      Admin
                    </span>
                  )}
                </button>

                {/* Account Dropdown Menu */}
                {isAccountMenuOpen && (user || isAdmin) && (
                  <div
                    id="account-dropdown"
                    className="absolute right-0 top-full mt-2 w-56 bg-[#FDFCF9] border border-[#E5E2D9] shadow-2xl py-2 z-50 rounded-lg animate-fadeIn"
                  >
                    <div className="px-4 py-2.5 border-b border-[#E5E2D9]">
                      <p className="text-xs font-bold text-[#1A1A1A] truncate">
                        {profile?.displayName || user?.displayName || (isAdmin ? 'Admin User' : 'Valued Customer')}
                      </p>
                      <p className="text-[11px] text-[#7A7A7A] truncate">{user?.email || (isAdmin ? 'admin@buddy4plant.com' : '')}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#4A4A4A] hover:bg-[#F5F2EB] flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        navigate('/orders');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#4A4A4A] hover:bg-[#F5F2EB] flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      My Orders
                    </button>

                    <div className="border-t border-[#E5E2D9] my-1"></div>

                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        promptSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Pop-Down Panel */}
        {isSearchOpen && (
          <div
            id="search-popdown"
            className="border-t border-[#E5E2D9] bg-[#FDFCF9] shadow-xl p-4 animate-fadeIn"
          >
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search botanical plants, air purifiers, ceramic planters, organic neem..."
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#D5D2C9] rounded-lg text-sm text-[#1A1A1A] placeholder-[#7A7A7A] focus:outline-none focus:border-[#2D4A27] focus:ring-2 focus:ring-[#2D4A27]/20 transition-all shadow-inner"
                />
                <Search className="w-5 h-5 text-[#7A7A7A] absolute left-3.5 top-3.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-[#7A7A7A] hover:text-[#1A1A1A]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Live search recommendations */}
              {searchSuggestions.length > 0 && (
                <div className="mt-3 bg-white border border-[#E5E2D9] rounded-lg shadow-lg overflow-hidden divide-y divide-[#F0EDE6]">
                  {searchSuggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleProductSelect(item.slug)}
                      className="p-3 hover:bg-[#F9F7F2] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-[#F0EDE6] shrink-0">
                          <PlantImage
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1A1A1A]">{item.name}</p>
                          <p className="text-[10px] text-[#7A7A7A] uppercase tracking-wider">
                            {item.category.replace('-', ' ')} • {item.plantType}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-serif font-bold text-[#2D4A27]">
                        ₹{item.price}
                      </span>
                    </div>
                  ))}
                  <div className="p-2.5 bg-[#F9F7F2] text-center text-xs text-[#2D4A27] font-semibold">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="hover:underline flex items-center justify-center gap-1 w-full"
                    >
                      View all results for &ldquo;{searchQuery}&rdquo;
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Robust Mobile Navigation Drawer (Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0F1710]/70 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div
            id="mobile-drawer"
            className="relative z-10 w-full max-w-xs sm:max-w-sm bg-[#FDFCF9] shadow-2xl flex flex-col justify-between h-full overflow-hidden animate-slideRight"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E5E2D9] flex items-center justify-between bg-[#F7FBF8]">
              <div onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
                <Buddy4PlantLogo size={36} showText={true} />
              </div>
              <button
                id="close-mobile-menu-btn"
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-[#4A4A4A] hover:text-[#182319] hover:bg-[#E4EDE6] rounded-full transition-colors focus:outline-none"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Quick Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plants, pots & care..."
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#D5D2C9] rounded-lg text-xs text-[#1A1A1A] placeholder-[#7A7A7A] focus:outline-none focus:border-[#2D4A27]"
                />
                <Search className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-[#7A7A7A]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Navigation Links with Drill-Down */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1F341C] hover:bg-[#EBF3EC] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-[#2D6A4F]" />
                    Home
                  </span>
                </button>

                {/* All Plants Accordion */}
                <div className="rounded-lg overflow-hidden border border-[#E8E5DC] bg-white">
                  <div
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === 'plants' ? null : 'plants')}
                    className="flex items-center justify-between px-3 py-2.5 cursor-pointer bg-[#F8FAF8] hover:bg-[#EBF3EC] transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#1F341C]">
                      <Grid className="w-4 h-4 text-[#2D6A4F]" />
                      Plants & Collections
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5A6E55] transition-transform ${
                        mobileExpandedCat === 'plants' ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {mobileExpandedCat === 'plants' && (
                    <div className="p-2 space-y-1 bg-[#FCFDFD] border-t border-[#E8E5DC]">
                      <button
                        onClick={() => {
                          navigate('/plants');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D6A4F] hover:bg-[#EBF3EC] rounded"
                      >
                        • View Full Catalogue (All Plants)
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/indoor-plants');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-leaf text-emerald-700" />
                        Indoor Foliage
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/air-purifying');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-wind text-teal-700" />
                        Air Purifiers (NASA Verified)
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/low-maintenance');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-seedling text-emerald-700" />
                        Low Maintenance Greens
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/cacti-succulents');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-tree text-emerald-700" />
                        Cacti & Succulents
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/flowering-plants');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-spa text-pink-700" />
                        Flowering Houseplants
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    navigate('/plants/pots-planters');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1F341C] hover:bg-[#EBF3EC] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <i className="fa-solid fa-layer-group text-[#2D4A27]" />
                    Pots & Planters
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigate('/plants/plant-care');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1F341C] hover:bg-[#EBF3EC] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <i className="fa-solid fa-flask text-[#2D4A27]" />
                    Organic Plant Care
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigate('/plants/combos');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#2D6A4F] bg-[#EAF5EC] hover:bg-[#D8EEDB] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-[#2D6A4F]" />
                    Combos & Gift Packs
                  </span>
                  <span className="text-[9px] bg-[#2D6A4F] text-white px-1.5 py-0.5 rounded font-bold">HOT</span>
                </button>

                <button
                  id="mobile-nav-projects"
                  onClick={() => {
                    navigate('/projects');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    currentPath === '/projects'
                      ? 'bg-[#EBF3EC] text-[#1F3B22] font-extrabold border-l-2 border-[#1F3B22]'
                      : 'text-[#1F341C] hover:bg-[#EBF3EC]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">🌿</span>
                    Projects &amp; Transformations
                  </span>
                  <span className="text-[9px] bg-[#1F3B22] text-white px-2 py-0.5 rounded-full font-bold">
                    Portfolio
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigate('/track-order');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1F341C] hover:bg-[#EBF3EC] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#5A6E55]" />
                    Live Order Tracker
                  </span>
                </button>
              </div>

              {/* WhatsApp Support Card */}
              {settings.whatsappSupportNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappSupportNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#EBF7EE] border border-[#BDE8C6] rounded-lg text-xs font-bold text-[#1F4522] hover:bg-[#DCF2E0] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold leading-tight">Plant Doctor WhatsApp Helpline</p>
                    <p className="text-[10px] text-[#3D7142] font-normal">Instant care advice & plant queries</p>
                  </div>
                </a>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E5E2D9] bg-[#F7FBF8] space-y-2">

              {!user && !isAdmin ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 border-2 border-[#2D4A27] text-[11px] uppercase tracking-wider font-extrabold text-[#2D4A27] hover:bg-[#2D4A27] hover:text-white rounded transition-colors"
                >
                  Sign In / Register
                </button>
              ) : (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#5A5A5A] truncate">
                    Hi, <strong className="text-[#1A1A1A]">{profile?.displayName || user?.displayName || 'Gardener'}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      promptSignOut();
                    }}
                    className="text-rose-700 font-bold hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sleek Mobile Bottom Navigation Bar (High usability on phones) */}
      <div
        id="mobile-bottom-bar"
        className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[#FDFCF9]/98 backdrop-blur-md border-t border-[#E5E2D9] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      >
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] ${
            currentPath === '/' ? 'text-[#2D4A27] font-bold' : 'text-[#6A7B6B]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">Home</span>
        </button>

        <button
          onClick={() => navigate('/plants')}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] ${
            currentPath.startsWith('/plants') ? 'text-[#2D4A27] font-bold' : 'text-[#6A7B6B]'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">Shop</span>
        </button>

        <button
          onClick={() => navigate('/track-order')}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] ${
            currentPath.includes('track-order') ? 'text-[#2D4A27] font-bold' : 'text-[#6A7B6B]'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">Track</span>
        </button>

        <button
          onClick={() => navigate('/wishlist')}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] relative ${
            currentPath === '/wishlist' ? 'text-[#2D4A27] font-bold' : 'text-[#6A7B6B]'
          }`}
        >
          <Heart className="w-5 h-5" />
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-3 bg-[#2D4A27] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">Wishlist</span>
        </button>

        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col items-center justify-center p-1 min-w-[54px] relative text-[#6A7B6B] hover:text-[#2D4A27]"
        >
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-3 bg-[#2D6A4F] text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">Cart</span>
        </button>
      </div>
    </>
  );
};
