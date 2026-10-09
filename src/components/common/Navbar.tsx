import { useTypingPlaceholder } from '../../hooks/useTypingPlaceholder';
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
  Gift,
  Sun,
  Moon
} from './Icons';
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
import CardNav, { CardNavItem } from './CardNav';

/** Curated neutral palette in the natural botanical theme of the site. */
const NAV_CARDS: CardNavItem[] = [
  {
    label: 'Plants',
    bgColor: '#1F3B22', // Deep Forest Green
    textColor: '#FAF7F2',
    links: [
      { label: 'All Plants', href: '/plants' },
      { label: 'Indoor Plants', href: '/plants/indoor-plants' },
      { label: 'Low-Light Plants', href: '/plants/low-light-plants' },
      { label: 'Balcony Plants', href: '/plants/location-balcony' },
      { label: 'Fruit Plants', href: '/plants/fruit-plants' },
    ],
  },
  {
    label: 'Pots & Care',
    bgColor: '#EFE6D8', // Warm Ceramic Sand
    textColor: '#2A2621',
    links: [
      { label: 'Pots & Planters', href: '/plants/pots-planters' },
      { label: 'Ceramic Pots', href: '/plants/ceramic-pots' },
      { label: 'Plant Care & Soil', href: '/plants/plant-care' },
      { label: 'Fertilizers', href: '/plants/fertilizers' },
      { label: 'Gifting', href: '/gifting' },
    ],
  },
  {
    label: 'Gardening',
    bgColor: '#36533A', // Muted Olive Pine
    textColor: '#FAF7F2',
    links: [
      { label: 'Gardening Services', href: '/garden-services' },
      { label: 'Our Projects', href: '/projects' },
      { label: 'Plant Care Guide', href: '/care-guide' },
    ],
  },
  {
    label: 'Company',
    bgColor: '#E3EBE1', // Soft Herbal Sage
    textColor: '#192B1C',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Locate Our Store', href: '/store-locator' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Track Your Order', href: '/track-order' },
    ],
  },
];

interface NavbarProps {
  currentPath?: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath = '/', navigate }) => {
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, profile, isAdmin, openAuthModal, promptSignOut } = useAuth();
  const { settings, isDarkMode, toggleDarkMode } = useStoreSettings();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);
  const POT_SLUGS = ['pots-planters', 'ceramic-pots', 'plastic-pots', 'hanging-planters', 'planter-stands', 'terracotta-pots', 'self-watering', 'metal-planters'];
  const isPotsPath = (p: string) => POT_SLUGS.some((slug) => p.includes(slug));
  const CARE_SLUGS = ['plant-care', 'fertilizers', 'potting-soil', 'pest-control', 'garden-tools', 'watering-tools', 'garden-decor', 'growth-boosters'];
  const isCarePath = (p: string) => CARE_SLUGS.some((slug) => p.includes(slug));

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const loadNavData = () => {
    getAllCategories().then(setCategories);
    getAllProducts().then(setAllProducts);
  };

  useEffect(() => {
    loadNavData();
    const handleDataChanged = () => {
      loadNavData();
    };
    window.addEventListener('b4p_store_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('b4p_store_data_changed', handleDataChanged);
    };
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

  // Search placeholder types out what customers can look for
  const [searchFocused, setSearchFocused] = useState(false);
  const typedPlaceholder = useTypingPlaceholder(
    isDesktop
      ? ['indoor plants...', 'ceramic pots...', 'organic plant food...', 'balcony plants...', 'gardening services...']
      : ['plants...', 'pots...', 'plant food...'],
    searchFocused || searchQuery.length > 0,
    'Search '
  );

  // Store search box - in the header on desktop, in its own row on phones and tablets
  const searchBox = (
    <div className="relative">
      <form onSubmit={handleSearchSubmit} role="search">
        <Search className="w-4 h-4 text-[#7A7A7A] absolute left-2.5 lg:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            document.documentElement.style.setProperty('--b4p-search-top', `${Math.round(e.currentTarget.getBoundingClientRect().bottom + 8)}px`);
          }}
          onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
          data-b4p-typing=""
          placeholder={searchFocused ? (isDesktop ? 'Search plants, pots, plant care...' : 'Search') : typedPlaceholder}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Search the store"
          className="w-full h-10 lg:h-11 pl-7 lg:pl-11 pr-1.5 lg:pr-4 rounded-full bg-[#F1ECE2] border border-transparent text-[13px] lg:text-sm text-[#1A1A1A] placeholder-[#7A7A7A] focus:outline-none focus:bg-white focus:border-[#2D4A27] focus:ring-2 focus:ring-[#2D4A27]/15 transition-colors"
        />
      </form>
      {searchQuery.trim().length > 1 && !isSearchOpen && (
        <div className="max-lg:fixed max-lg:inset-x-3 max-lg:top-[var(--b4p-search-top,112px)] lg:absolute lg:left-0 lg:right-0 lg:top-full lg:mt-2 z-50 overflow-hidden rounded-2xl border border-[#E5E2D9] bg-white shadow-xl">
          {searchSuggestions.length > 0 ? (
            searchSuggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleProductSelect(item.slug)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F7F4EC]"
              >
                <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F0EDE6]">
                  <PlantImage src={item.images[0]} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#1A1A1A]">{item.name}</span>
                  <span className="block truncate text-[11px] text-[#7A7A7A]">{item.category.replace(/-/g, ' ')}</span>
                </span>
                <span className="text-sm font-semibold text-[#13301B]">₹{item.price}</span>
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-[#7A7A7A]">No products found</p>
          )}
          <button type="button" onClick={handleSearchSubmit} className="block w-full bg-[#F7F4EC] px-4 py-2.5 text-center text-xs font-semibold text-[#2D4A27] hover:underline">
            View all results for &ldquo;{searchQuery.trim()}&rdquo;
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header id="navbar-main" className="b4p-fixed-theme sticky top-0 z-40 bg-[#FAF5EE]/95 backdrop-blur-md transition-all">
        {/* Dynamic News Motion Announcement Ticker */}
        <AnnouncementTicker />

        {/* Main navigation: CardNav (React Bits) */}
        <div className="px-3 sm:px-5 lg:px-8 py-2.5 sm:py-3">
          <div className="max-w-6xl mx-auto">
            <CardNav
              items={NAV_CARDS}
              onNavigate={navigate}
              onLogoClick={() => navigate('/')}
              closeKey={currentPath}
              logo={<Buddy4PlantLogo size={39} showText={false} />}
              center={searchBox}
              baseColor="#FAF5EE"
              menuColor="#1F341C"
              buttonBgColor="#13301B"
              buttonTextColor="#F4EFE3"
              buttonLabel={<><i className="fa-regular fa-paper-plane" aria-hidden="true" /> <span>Inquire Now</span></>}
              onButtonClick={() => navigate('/garden-services?enquire=1')}
              ease="power3.out"
              actions={
                <>
                  {/* Locate our store */}
                  <button
                    id="store-locator-btn"
                    type="button"
                    onClick={() => navigate('/store-locator')}
                    className="hidden sm:inline-flex p-2 text-[#1F341C] hover:text-[#182319] hover:bg-[#EBF3EC] rounded-full transition-colors"
                    aria-label="Locate our store"
                    title="Locate our store"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>

                  {/* Search Button */}
                  <button
                    id="search-btn"
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(!isSearchOpen);
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }}
                    className="p-2 text-[#1F341C] hover:text-[#182319] hover:bg-[#EBF3EC] rounded-full transition-colors hidden"
                    aria-label="Search nursery catalogue"
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Wishlist Icon */}
                  <button
                    id="wishlist-btn"
                    type="button"
                    onClick={() => navigate('/wishlist')}
                    className="hidden sm:flex p-2 text-[#1F341C] hover:text-[#182319] hover:bg-[#EBF3EC] rounded-full relative transition-colors"
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
                  <div className="relative hidden sm:block" ref={accountMenuRef}>
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
                </>
              }
            />
          </div>
        </div>

        {/* Global Search Pop-Down Panel */}
        {isSearchOpen && (
          <div
            id="search-popdown"
            className="mx-3 sm:mx-5 lg:mx-auto lg:max-w-6xl mb-3 rounded-2xl border border-[#E3DED1] bg-[#FDFCF9] shadow-xl p-4 animate-fadeIn"
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
        <div id="mobile-nav-drawer" className="b4p-fixed-theme fixed inset-0 z-[100] lg:hidden flex">
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

              {/* Navigation Links with Drill-Down - Exact 7 Sections */}
              <div className="space-y-1">
                {/* 1. Plants Accordion */}
                <div className="rounded-lg overflow-hidden border border-[#E8E5DC] bg-white">
                  <div
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === 'plants' ? null : 'plants')}
                    className="flex items-center justify-between px-3 py-2.5 cursor-pointer bg-[#F8FAF8] hover:bg-[#EBF3EC] transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#1F341C]">
                      <Grid className="w-4 h-4 text-[#2D6A4F]" />
                      Plants
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5A6E55] transition-transform ${mobileExpandedCat === 'plants' ? 'rotate-180' : ''
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
                        • View All Plants
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/indoor-plants');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-leaf text-emerald-700 w-4" />
                        Indoor Plants
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/xl-plants');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-tree text-emerald-700 w-4" />
                        XL Plants
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/plant-bundles');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-boxes-stacked text-emerald-700 w-4" />
                        Bundles
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/low-light-plants');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-moon text-emerald-700 w-4" />
                        Low Light Plants
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/cacti-succulents');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-sun text-emerald-700 w-4" />
                        Cacti and Succulents
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/hanging-plants');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-link text-emerald-700 w-4" />
                        Hanging Plants
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/fruit-plants');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-lemon text-emerald-700 w-4" />
                        Fruit Plants
                      </button>
                      <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B] flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-emerald-700 w-4" />
                        Shop by Location
                      </div>
                      <button
                        onClick={() => {
                          navigate('/plants/location-balcony');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left pl-9 pr-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded"
                      >
                        Balcony
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/location-workspace');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left pl-9 pr-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded"
                      >
                        Workspace
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/location-living-room');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left pl-9 pr-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded"
                      >
                        Living Room
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/location-bedroom');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left pl-9 pr-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded"
                      >
                        Bedroom
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Pots and Planters Accordion */}
                <div className="rounded-lg overflow-hidden border border-[#E8E5DC] bg-white">
                  <div
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === 'pots' ? null : 'pots')}
                    className="flex items-center justify-between px-3 py-2.5 cursor-pointer bg-[#F8FAF8] hover:bg-[#EBF3EC] transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#1F341C]">
                      <i className="fa-solid fa-layer-group text-[#2D4A27]" />
                      Pots &amp; Planters
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5A6E55] transition-transform ${mobileExpandedCat === 'pots' ? 'rotate-180' : ''
                        }`}
                    />
                  </div>

                  {mobileExpandedCat === 'pots' && (
                    <div className="p-2 space-y-1 bg-[#FCFDFD] border-t border-[#E8E5DC]">
                      <button
                        onClick={() => {
                          navigate('/plants/pots-planters');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D6A4F] hover:bg-[#EBF3EC] rounded"
                      >
                        • View All Pots &amp; Planters
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/ceramic-pots');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-mug-hot text-emerald-700" />
                        Ceramic Pots
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/plastic-pots');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-box text-emerald-700" />
                        Plastic Pots
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/hanging-planters');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-link text-emerald-700" />
                        Hanging Planters
                      </button>
                      <button
                        onClick={() => {
                          navigate('/plants/planter-stands');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#4A4A4A] hover:text-[#2D4A27] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-table text-emerald-700" />
                        Planter Stands
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Plant care Accordion */}
                <div className="rounded-lg overflow-hidden border border-[#E8E5DC] bg-white">
                  <div
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === 'care' ? null : 'care')}
                    className="flex items-center justify-between px-3 py-2.5 cursor-pointer bg-[#F8FAF8] hover:bg-[#EBF3EC] transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#1F341C]">
                      <i className="fa-solid fa-flask text-[#2D4A27]" />
                      Plant Care
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5A6E55] transition-transform ${mobileExpandedCat === 'care' ? 'rotate-180' : ''
                        }`}
                    />
                  </div>

                  {mobileExpandedCat === 'care' && (
                    <div className="p-2 space-y-1 bg-[#FCFDFD] border-t border-[#E8E5DC]">
                      <button
                        onClick={() => {
                          navigate('/collections/plant-care');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D6A4F] hover:bg-[#EBF3EC] rounded"
                      >
                        • View All Plant Care
                      </button>
                      <button
                        onClick={() => {
                          navigate('/collections/fertilizers');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-seedling text-emerald-700 w-4" />
                        Fertilizers & Plant Food
                      </button>
                      <button
                        onClick={() => {
                          navigate('/collections/potting-soil');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-mountain text-emerald-700 w-4" />
                        Soil & Potting Mix
                      </button>
                      <button
                        onClick={() => {
                          navigate('/collections/pest-control');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-bug-slash text-emerald-700 w-4" />
                        Pest Control
                      </button>
                      <button
                        onClick={() => {
                          navigate('/collections/garden-tools');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-trowel text-emerald-700 w-4" />
                        Garden Tools
                      </button>
                      <button
                        onClick={() => {
                          navigate('/collections/watering-tools');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-droplet text-emerald-700 w-4" />
                        Watering Solutions
                      </button>
                      <button
                        onClick={() => {
                          navigate('/collections/garden-decor');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-gem text-emerald-700 w-4" />
                        Gardening Decor
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Gifting Accordion */}
                <div className="rounded-lg overflow-hidden border border-[#E8E5DC] bg-white">
                  <div
                    onClick={() => setMobileExpandedCat(mobileExpandedCat === 'gifting' ? null : 'gifting')}
                    className="flex items-center justify-between px-3 py-2.5 cursor-pointer bg-[#EAF5EC] hover:bg-[#D8EEDB] transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#2D6A4F]">
                      <Gift className="w-4 h-4 text-[#2D6A4F]" />
                      Gifting
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#5A6E55] transition-transform ${mobileExpandedCat === 'gifting' ? 'rotate-180' : ''
                        }`}
                    />
                  </div>

                  {mobileExpandedCat === 'gifting' && (
                    <div className="p-2 space-y-1 bg-[#FCFDFD] border-t border-[#E8E5DC]">
                      <button
                        onClick={() => {
                          navigate('/gifting');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#2D6A4F] hover:bg-[#EBF3EC] rounded"
                      >
                        • View All Gifts
                      </button>
                      <button
                        onClick={() => {
                          navigate('/gifting/corporate');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-briefcase text-emerald-700 w-4" />
                        Corporate Gifting
                      </button>
                      <button
                        onClick={() => {
                          navigate('/gifting/festive');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-gift text-emerald-700 w-4" />
                        Festive Gifting
                      </button>
                      <button
                        onClick={() => {
                          navigate('/gifting/green');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#F5F2EB] rounded flex items-center gap-2"
                      >
                        <i className="fa-solid fa-leaf text-emerald-700 w-4" />
                        Green Gifting
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. blog */}
                <button
                  onClick={() => {
                    navigate('/blog');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1F341C] hover:bg-[#EBF3EC] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <i className="fa-solid fa-book-open text-[#2D4A27]" />
                    Blog
                  </span>
                </button>

                {/* 6. Gardening Services */}
                <button
                  onClick={() => {
                    navigate('/garden-services');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1F341C] hover:bg-[#EBF3EC] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <i className="fa-solid fa-tree text-[#2D4A27] w-4 text-center" aria-hidden="true" />
                    Gardening Services
                  </span>
                  <span className="text-[9px] bg-[#1F3B22] text-white px-2 py-0.5 rounded-full font-bold">
                    Turnkey
                  </span>
                </button>

                {/* 7. About us */}
                <button
                  onClick={() => {
                    navigate('/about');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1F341C] hover:bg-[#EBF3EC] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <i className="fa-solid fa-circle-info text-[#2D4A27]" />
                    About Us
                  </span>
                </button>

                {/* 8. Locate our store */}
                <button
                  onClick={() => {
                    navigate('/store-locator');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#1F341C] hover:bg-[#EBF3EC] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#2D4A27]" />
                    Locate Our Store
                  </span>
                </button>

                {/* Track Order shifted into My Profile section */}
                <button
                  onClick={() => {
                    navigate('/profile?tab=track-order');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#2D4A27] bg-[#F2F7F2] hover:bg-[#E2ECE0] border border-[#C5DAC3] transition-colors mt-2"
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#2D4A27]" />
                    Track Order &amp; Shipments
                  </span>
                  <span className="text-[9px] bg-[#2D4A27] text-white px-2 py-0.5 rounded-full font-bold">
                    My Profile
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
            <div className="p-4 border-t border-[#E5E2D9] bg-[#F7FBF8] dark:bg-[#141E15] space-y-2">

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
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] ${currentPath === '/' ? 'text-[#2D4A27] font-bold' : 'text-[#6A7B6B]'
            }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">Home</span>
        </button>

        <button
          onClick={() => navigate('/plants')}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] ${currentPath.startsWith('/plants') ? 'text-[#2D4A27] font-bold' : 'text-[#6A7B6B]'
            }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">Shop</span>
        </button>

        <button
          onClick={() => navigate('/track-order')}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] ${currentPath.includes('track-order') ? 'text-[#2D4A27] font-bold' : 'text-[#6A7B6B]'
            }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">Track</span>
        </button>

        <button
          onClick={() => navigate('/wishlist')}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] relative ${currentPath === '/wishlist' ? 'text-[#2D4A27] font-bold' : 'text-[#6A7B6B]'
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

        {/* Account (the cart is already in the top bar on phones) */}
        <button
          onClick={() => (user || isAdmin ? navigate('/profile') : openAuthModal('login'))}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] relative hover:text-[#2D4A27] ${currentPath.startsWith('/profile') || currentPath.startsWith('/orders') ? 'text-[#13301B] font-bold' : 'text-[#6A7B6B]'
            }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-tighter mt-0.5">{user || isAdmin ? 'Account' : 'Sign In'}</span>
        </button>
      </div>
    </>
  );
};
