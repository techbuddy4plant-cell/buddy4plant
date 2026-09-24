import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Palette,
  Settings,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Trees,
  Home,
  Leaf,
  FlaskConical,
  Gift,
  Truck,
  Star,
  FolderTree,
  Sun,
  Moon
} from 'lucide-react';
import { Order, Product, Category, Coupon } from '../../types';
import { getOrders, subscribeToAllOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getCoupons } from '../../services/couponService';
import { useAuth } from '../../context/AuthContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCategories } from './AdminCategories';
import { AdminProjects } from './AdminProjects';
import { AdminReviews } from './AdminReviews';
import { AdminCoupons } from './AdminCoupons';
import { AdminCMS } from './AdminCMS';
import { AdminSettings } from './AdminSettings';
import { Buddy4PlantLogo } from '../common/Buddy4PlantLogo';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

type AdminTab =
  | 'overview'
  | 'cms'
  | 'plants'
  | 'pots-planters'
  | 'plant-care'
  | 'combos'
  | 'projects'
  | 'orders'
  | 'categories'
  | 'reviews'
  | 'coupons'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { profile, user, promptSignOut } = useAuth();
  const { adminDarkMode, toggleAdminDarkMode } = useStoreSettings();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ordList, prodList, catList, cpnList] = await Promise.all([
        getOrders(),
        getProducts(),
        getCategories(),
        getCoupons(),
      ]);
      setOrders(ordList);
      setProducts(prodList);
      setCategories(catList);
      setCoupons(cpnList);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Subscribe to live orders real-time
    const unsubscribeOrders = subscribeToAllOrders((liveOrders) => {
      setOrders(liveOrders);
    });

    const handleDataChanged = () => {
      loadAllData();
    };
    window.addEventListener('b4p_store_data_changed', handleDataChanged);

    return () => {
      unsubscribeOrders();
      window.removeEventListener('b4p_store_data_changed', handleDataChanged);
    };
  }, []);

  const lowStockLivePlants = products.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    const type = (p.plantType || '').toLowerCase();
    const isPot = cat.includes('pot') || type.includes('pot') || cat.includes('planter') || type.includes('planter');
    const isCare = cat.includes('care') || cat.includes('fertilizer') || cat.includes('soil') || cat.includes('nutrition') || type.includes('fertilizer') || type.includes('soil');
    const isCombo = cat.includes('combo') || cat.includes('gift') || cat.includes('bundle') || type.includes('combo');
    return !isPot && !isCare && !isCombo && p.stock <= 5;
  }).length;

  const lowStockPots = products.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    const type = (p.plantType || '').toLowerCase();
    return (cat.includes('pot') || type.includes('pot') || cat.includes('planter') || type.includes('planter')) && p.stock <= 5;
  }).length;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview & Stats', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'cms', label: '🏠 Home Page Sections', icon: <Home className="w-4 h-4" /> },
    { id: 'plants', label: '🌿 All Plants Catalog', icon: <Leaf className="w-4 h-4" />, badge: lowStockLivePlants },
    { id: 'pots-planters', label: '🪴 Pots & Planters', icon: <Package className="w-4 h-4" />, badge: lowStockPots },
    { id: 'plant-care', label: '🧪 Plant Care & Organic Food', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'combos', label: '🎁 Combos & Gifts', icon: <Gift className="w-4 h-4" /> },
    { id: 'projects', label: '🌿 Projects & Landscaping', icon: <Trees className="w-4 h-4" /> },
    { id: 'orders', label: '🚚 Track Order & Shipments', icon: <Truck className="w-4 h-4" />, badge: orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length },
    { id: 'categories', label: '🗂️ Collections & Categories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'reviews', label: '⭐ Customer Reviews', icon: <Star className="w-4 h-4" /> },
    { id: 'coupons', label: '🏷️ Coupons & Promos', icon: <Tag className="w-4 h-4" /> },
    { id: 'settings', label: '⚙️ Store & Helpline Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return 'Overview & Business Analytics';
      case 'cms':
        return 'Front Page Sections & Merchandising CMS';
      case 'plants':
        return 'Live Plants & Houseplants Inventory';
      case 'pots-planters':
        return 'Pots, Planters & Ceramics Catalog';
      case 'plant-care':
        return 'Plant Care, Organic Nutrition & Bio-Fertilizers';
      case 'combos':
        return 'Curated Combos, Green Gifts & Starter Kits';
      case 'projects':
        return 'Botanical Installations & Landscaping Portfolio';
      case 'orders':
        return 'Orders, Delivery Tracking & Courier Dispatch';
      case 'categories':
        return 'Product Collections & Navigation Taxonomy';
      case 'reviews':
        return 'Customer Stories & Star Ratings Moderation';
      case 'coupons':
        return 'Discount Coupons & Promotional Offers';
      case 'settings':
        return 'Store Helpline, Payment Gateways & Policies';
      default:
        return 'Admin Console';
    }
  };

  return (
    <div className={`h-screen flex flex-col md:flex-row font-sans overflow-hidden transition-colors duration-200 ${
      adminDarkMode ? 'admin-dark-mode bg-[#0E150F] text-[#E5EAE3]' : 'bg-[#FDFCF9] text-[#1A1A1A]'
    }`}>
      {/* Sidebar Navigation - Fixed & Sticky (Does not move when scrolling) */}
      <aside className="w-full md:w-64 bg-[#182319] text-[#E5E2D9] flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 md:overflow-y-auto z-40 border-r border-[#2A3B2C] shadow-lg">
        <div>
          {/* Top Admin Brand */}
          <div className="p-4 sm:p-5 border-b border-[#2A3B2C] flex items-center justify-between sticky top-0 bg-[#182319] z-10">
            <div className="flex items-center gap-2.5">
              <Buddy4PlantLogo size={36} showText={false} variant="full-circle" />
              <div>
                <h1 className="font-serif font-bold text-white text-base leading-none tracking-wide">buddy4plant</h1>
                <span className="text-[10px] text-[#A3B899] font-semibold tracking-widest uppercase mt-0.5 block">
                  Admin Hub
                </span>
              </div>
            </div>
          </div>

          {/* Nav list */}
          <nav className="p-3 sm:p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-[#2D4A27] text-white shadow-xs font-bold'
                    : 'text-[#B0BBAA] hover:text-white hover:bg-[#253222]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="bg-[#8B5E3C] text-white font-bold px-1.5 py-0.2 rounded-full text-[10px] shrink-0">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar info & Return to store */}
        <div className="p-4 border-t border-[#2A3628] space-y-2 text-xs sticky bottom-0 bg-[#182319] z-10">
          <button
            onClick={() => navigate('/')}
            className="w-full px-3.5 py-2 bg-[#253222] hover:bg-[#2D4A27] text-[#E5E2D9] flex items-center justify-center gap-2 font-medium text-[11px] uppercase tracking-wider transition-colors rounded-lg"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Storefront
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('b4p_admin_secured_session');
              promptSignOut();
            }}
            className="w-full px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-200 flex items-center justify-center gap-2 font-medium text-[11px] uppercase tracking-wider transition-colors rounded-lg border border-rose-800/40"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-300" />
            Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas - Independently Scrollable */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <header className={`h-16 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-colors ${
          adminDarkMode ? 'bg-[#152016] border-b border-[#243525] text-white' : 'bg-white border-b border-[#E5E2D9] text-[#1A1A1A]'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`font-serif font-bold text-lg ${adminDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
              {getTabTitle(activeTab)}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Link to Storefront */}
            <button
              id="header-visit-storefront"
              onClick={() => navigate('/')}
              className="px-3.5 py-1.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
              title="Visit live storefront in customer view"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Visit Live Storefront</span>
              <span className="sm:hidden">Store</span>
            </button>
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleAdminDarkMode}
              className={`p-2 transition-colors rounded-lg flex items-center gap-1.5 text-xs font-semibold ${
                adminDarkMode
                  ? 'text-amber-300 hover:bg-[#253222] bg-[#253222]/70 border border-amber-400/20'
                  : 'text-[#5A5A5A] hover:text-[#1A1A1A] hover:bg-[#F5F2EB] border border-black/5'
              }`}
              title={adminDarkMode ? 'Switch Admin to Light Mode' : 'Switch Admin to Dark Mode'}
            >
              {adminDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{adminDarkMode ? 'Dark' : 'Light'}</span>
            </button>

            <button
              onClick={loadAllData}
              disabled={loading}
              className={`p-2 transition-colors rounded-lg ${
                adminDarkMode ? 'text-[#A3B3A2] hover:text-white hover:bg-[#253222]' : 'text-[#5A5A5A] hover:text-[#1A1A1A] hover:bg-[#F5F2EB]'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className={`flex items-center gap-2 pl-3 border-l text-xs ${adminDarkMode ? 'border-[#283A2A]' : 'border-[#E5E2D9]'}`}>
              <span className="w-7 h-7 bg-[#2D4A27] text-white flex items-center justify-center font-bold text-xs rounded-full">
                <i className="fa-solid fa-user-shield text-xs" />
              </span>
              <span className="font-semibold text-[#1A1A1A] hidden sm:inline">b4padpl</span>
              <button
                onClick={() => {
                  sessionStorage.removeItem('b4p_admin_secured_session');
                  promptSignOut();
                }}
                className="ml-2 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] rounded transition-colors flex items-center gap-1 border border-rose-200"
                title="Sign out of Admin console"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Body content based on active tab */}
        <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeTab === 'overview' && (
            <AdminOverview
              orders={orders}
              products={products}
              navigate={navigate}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'cms' && <AdminCMS />}

          {activeTab === 'plants' && (
            <AdminProducts
              products={products}
              categories={categories}
              onRefresh={loadAllData}
              sectionFilter="plants"
              sectionTitle="All Live Plants & Houseplants"
              sectionDescription="Manage indoor plants, air purifiers, succulents, flowering plants, and desktop greens."
            />
          )}

          {activeTab === 'pots-planters' && (
            <AdminProducts
              products={products}
              categories={categories}
              onRefresh={loadAllData}
              sectionFilter="pots-planters"
              sectionTitle="Pots & Planters Collection"
              sectionDescription="Manage ceramic planters, self-watering pots, metal planters, and terracotta containers."
            />
          )}

          {activeTab === 'plant-care' && (
            <AdminProducts
              products={products}
              categories={categories}
              onRefresh={loadAllData}
              sectionFilter="plant-care"
              sectionTitle="Plant Care & Organic Plant Food"
              sectionDescription="Manage organic bio-fertilizers, neem elixir oils, cold-pressed kelp feed, and potting soils."
            />
          )}

          {activeTab === 'combos' && (
            <AdminProducts
              products={products}
              categories={categories}
              onRefresh={loadAllData}
              sectionFilter="combos"
              sectionTitle="Combos & Green Gifts"
              sectionDescription="Manage curated botanical gift boxes, beginner starter kits, duo/trio plant bundles, and festive gifting."
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjects onRefresh={loadAllData} />
          )}

          {activeTab === 'orders' && (
            <AdminOrders orders={orders} onRefresh={loadAllData} />
          )}

          {activeTab === 'categories' && (
            <AdminCategories categories={categories} onRefresh={loadAllData} />
          )}

          {activeTab === 'reviews' && (
            <AdminReviews />
          )}

          {activeTab === 'coupons' && (
            <AdminCoupons coupons={coupons} onRefresh={loadAllData} />
          )}

          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};
