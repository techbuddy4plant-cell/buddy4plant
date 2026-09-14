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
  LogOut
} from 'lucide-react';
import { Order, Product, Category, Coupon } from '../../types';
import { getOrders, subscribeToAllOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getCoupons } from '../../services/couponService';
import { useAuth } from '../../context/AuthContext';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCategories } from './AdminCategories';
import { AdminCoupons } from './AdminCoupons';
import { AdminCMS } from './AdminCMS';
import { AdminSettings } from './AdminSettings';
import { Buddy4PlantLogo } from '../common/Buddy4PlantLogo';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

type AdminTab = 'overview' | 'products' | 'orders' | 'categories' | 'coupons' | 'cms' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { profile, user, promptSignOut } = useAuth();
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

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview & Stats', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders & Shipments', icon: <ShoppingBag className="w-4 h-4" />, badge: orders.filter((o) => o.orderStatus === 'Pending').length },
    { id: 'products', label: 'Plants & Stock', icon: <Package className="w-4 h-4" />, badge: products.filter((p) => p.stock <= 5).length },
    { id: 'categories', label: 'Collections / Cats', icon: <Layers className="w-4 h-4" /> },
    { id: 'coupons', label: 'Coupons & Promos', icon: <Tag className="w-4 h-4" /> },
    { id: 'cms', label: 'Homepage CMS', icon: <Palette className="w-4 h-4" /> },
    { id: 'settings', label: 'Store & Payments', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#182319] text-[#E5E2D9] flex flex-col justify-between shrink-0">
        <div>
          {/* Top Admin Brand */}
          <div className="p-4 sm:p-5 border-b border-[#2A3B2C] flex items-center justify-between">
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
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-[#2D4A27] text-white'
                    : 'text-[#B0BBAA] hover:text-white hover:bg-[#253222]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="bg-[#8B5E3C] text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar info & Return to store */}
        <div className="p-4 border-t border-[#2A3628] space-y-2 text-xs">
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

      {/* Main Admin Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#E5E2D9] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-lg text-[#1A1A1A] capitalize">
              {activeTab === 'cms' ? 'Homepage Merchandising & CMS' : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 text-[#5A5A5A] hover:text-[#1A1A1A] hover:bg-[#F5F2EB] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-[#E5E2D9] text-xs">
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

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              categories={categories}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders orders={orders} onRefresh={loadAllData} />
          )}

          {activeTab === 'categories' && (
            <AdminCategories categories={categories} onRefresh={loadAllData} />
          )}

          {activeTab === 'coupons' && (
            <AdminCoupons coupons={coupons} onRefresh={loadAllData} />
          )}

          {activeTab === 'cms' && <AdminCMS />}

          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};
