import React, { useState } from 'react';
import { Plus, Tag, Trash2, Check, X, Calendar, Percent } from 'lucide-react';
import { Coupon } from '../../types';
import { saveCoupon, deleteCoupon } from '../../services/couponService';

interface AdminCouponsProps {
  coupons: Coupon[];
  onRefresh: () => void;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ coupons, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(500);
  const [maxDiscount, setMaxDiscount] = useState<number>(300);
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderValue(499);
    setMaxDiscount(300);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const couponObj: Coupon = {
      id: `cpn_${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
      expiryDate: '2028-12-31',
      usageLimit: 500,
      usedCount: 0,
      active,
    };

    await saveCoupon(couponObj);
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = async (id: string, cCode: string) => {
    if (window.confirm(`Delete coupon code "${cCode}"?`)) {
      await deleteCoupon(id);
      onRefresh();
    }
  };

  const handleToggle = async (c: Coupon) => {
    await saveCoupon({ ...c, active: !c.active });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Discount Coupons & Offers</h2>
          <p className="text-xs text-[#5A5A5A] font-light">Configure promotional vouchers, festive codes, and minimum order rules.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white border border-[#E5E2D9] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 font-mono font-bold text-base text-[#2D4A27] bg-[#2D4A27]/5 px-2.5 py-1 border border-[#2D4A27]/20">
                  <Tag className="w-4 h-4 text-[#2D4A27]" />
                  {c.code}
                </div>
                <button
                  onClick={() => handleToggle(c)}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    c.active ? 'bg-[#2D4A27] text-white' : 'bg-[#E5E2D9] text-[#5A5A5A]'
                  }`}
                >
                  {c.active ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-[#5A5A5A] mt-4">
                <p>
                  Discount:{' '}
                  <strong className="text-[#1A1A1A]">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                  </strong>
                </p>
                <p>
                  Minimum Order Value: <strong className="text-[#1A1A1A]">₹{c.minOrderValue}</strong>
                </p>
                {c.maxDiscount && (
                  <p>
                    Max Discount Cap: <strong className="text-[#1A1A1A]">₹{c.maxDiscount}</strong>
                  </p>
                )}
                <p className="text-[11px] text-[#7A7A7A] font-light">Times Used: {c.usedCount} orders</p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#E5E2D9] flex justify-end">
              <button
                onClick={() => handleDelete(c.id, c.code)}
                className="text-[#7A7A7A] hover:text-rose-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-[#E5E2D9] max-w-md w-full p-6 z-10">
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A] mb-4">Create Promo Code</h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono uppercase font-bold focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-medium focus:outline-none focus:border-[#2D4A27]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">
                    Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>

                {discountType === 'percentage' && (
                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Max Cap (₹)</label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#5A5A5A] hover:bg-[#F5F2EB]"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
