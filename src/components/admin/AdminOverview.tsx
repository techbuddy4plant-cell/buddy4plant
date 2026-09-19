import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Order, Product } from '../../types';
import { PlantImage } from '../../utils/imageFallback';

interface AdminOverviewProps {
  orders: Order[];
  products: Product[];
  navigate: (path: string) => void;
  setActiveTab: (tab: any) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  products,
  navigate,
  setActiveTab,
}) => {
  const totalSales = orders
    .filter((o) => o.paymentStatus === 'paid' || o.paymentMethod === 'cod')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);

  const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  return (
    <div className="space-y-8">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 border border-[#E5E2D9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#7A7A7A] uppercase tracking-widest">Total Revenue</span>
            <div className="w-9 h-9 bg-[#2D4A27]/10 text-[#2D4A27] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif font-bold text-2xl text-[#1A1A1A]">
              ₹{totalSales.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#2D4A27] font-semibold block mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +18.4% from last month
            </span>
          </div>
        </div>

        <div className="bg-white p-6 border border-[#E5E2D9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#7A7A7A] uppercase tracking-widest">Total Orders</span>
            <div className="w-9 h-9 bg-[#8B5E3C]/10 text-[#8B5E3C] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif font-bold text-2xl text-[#1A1A1A]">{totalOrders}</span>
            <span className="text-[11px] text-[#7A7A7A] block mt-1 font-light">
              {pendingOrders} awaiting fulfillment
            </span>
          </div>
        </div>

        <div className="bg-white p-6 border border-[#E5E2D9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#7A7A7A] uppercase tracking-widest">Avg. Order Value</span>
            <div className="w-9 h-9 bg-[#A3B899]/30 text-[#2D4A27] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif font-bold text-2xl text-[#1A1A1A]">
              ₹{averageOrderValue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-[#7A7A7A] block mt-1 font-light">Per checkout basket</span>
          </div>
        </div>

        <div className="bg-white p-6 border border-[#E5E2D9]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#7A7A7A] uppercase tracking-widest">Low Stock Warnings</span>
            <div className="w-9 h-9 bg-rose-50 text-rose-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif font-bold text-2xl text-[#1A1A1A]">
              {lowStockProducts.length}
            </span>
            <span className="text-[11px] text-rose-700 font-semibold block mt-1">
              Items need nursery restocking
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-8 bg-white p-6 border border-[#E5E2D9]">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Recent Customer Orders</h3>
              <p className="text-xs text-[#7A7A7A] font-light">Live order queue from storefront</p>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs text-[#2D4A27] font-semibold hover:underline"
            >
              View All Orders &rarr;
            </button>
          </div>

          <div className="divide-y divide-[#E5E2D9] mt-2">
            {orders.slice(0, 5).map((ord) => (
              <div key={ord.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A1A1A] font-mono">{ord.orderNumber}</span>
                    <span className="text-[#5A5A5A]">• {ord.customerName}</span>
                  </div>
                  <span className="text-[11px] text-[#7A7A7A]">
                    {ord.items.length} items • ₹{ord.total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    ord.orderStatus === 'Delivered'
                      ? 'bg-[#2D4A27]/10 text-[#2D4A27]'
                      : ord.orderStatus === 'Shipped'
                      ? 'bg-sky-50 text-sky-800'
                      : 'bg-[#F5F2EB] text-[#8B5E3C]'
                  }`}>
                    {ord.orderStatus}
                  </span>
                  <span className="text-[#7A7A7A] text-[11px]">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Plants */}
        <div className="lg:col-span-4 bg-white p-6 border border-[#E5E2D9] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Inventory Alerts</h3>
              <button
                onClick={() => setActiveTab('plants')}
                className="text-xs text-[#2D4A27] font-semibold hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {lowStockProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3 text-xs">
                  <PlantImage src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover border border-[#E5E2D9]" />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-[#1A1A1A] truncate">{p.name}</h5>
                    <span className="text-rose-700 font-bold text-[11px]">
                      {p.stock === 0 ? 'Out of stock' : `Only ${p.stock} units remaining`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E5E2D9] bg-[#F5F2EB] p-3 text-xs text-[#5A5A5A]">
            <span className="font-bold text-[#1A1A1A] block mb-1 flex items-center gap-1.5">
              <i className="fa-solid fa-lightbulb text-amber-600" />
              Pro-Tip for Nursery Restocking:
            </span>
            Keep minimum 10 units for bestsellers to prevent checkout cart abandonment.
          </div>
        </div>
      </div>
    </div>
  );
};
