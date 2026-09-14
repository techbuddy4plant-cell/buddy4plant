import React from 'react';
import { FilterState, Category } from '../../types';
import { RotateCcw, X, Check, Sun, Droplets, PawPrint } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: Category[];
  totalProductsCount: number;
  filteredCount: number;
  onReset: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  categories,
  totalProductsCount,
  filteredCount,
  onReset,
  isMobileOpen,
  onMobileClose,
}) => {
  const plantTypes = ['Indoor Plants', 'Flowering Plants', 'Cacti & Succulents', 'Hanging Plants'];
  const lightLevels = ['Low Light', 'Medium Light', 'Bright Indirect Light', 'Direct Sunlight'];
  const maintenanceLevels = ['Easy', 'Moderate', 'High'];
  const locations = ['Living Room', 'Bedroom', 'Office Desk', 'Balcony', 'Windowsill'];

  const toggleArrayFilter = (field: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentList = (prev[field] as string[]) || [];
      const updated = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];
      return { ...prev, [field]: updated };
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DC]">
        <div>
          <h3 className="font-editorial font-bold text-base text-[#141414]">Filter Flora</h3>
          <p className="text-[11px] text-[#7A7A7A]">
            Showing {filteredCount} of {totalProductsCount} specimens
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#1F3B22] font-semibold hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Category selector */}
      <div>
        <label className="text-[10px] font-bold text-[#141414] uppercase tracking-[0.2em] block mb-2.5">
          Collection
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
            className={`w-full text-left px-3.5 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
              filters.category === 'all'
                ? 'bg-[#1F3B22] text-white font-semibold shadow-xs'
                : 'text-[#141414] hover:bg-[#F0EDE5]'
            }`}
          >
            <span>All Collections</span>
          </button>
          {categories
            .filter((c) => c.active)
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilters((prev) => ({ ...prev, category: cat.slug }))}
                className={`w-full text-left px-3.5 py-2 text-xs rounded-xl flex items-center justify-between transition-colors ${
                  filters.category === cat.slug
                    ? 'bg-[#1F3B22] text-white font-semibold shadow-xs'
                    : 'text-[#141414] hover:bg-[#F0EDE5]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Sunlight Requirement */}
      <div className="border-t border-[#E8E5DC] pt-5">
        <label className="text-[10px] font-bold text-[#141414] uppercase tracking-[0.2em] block mb-2.5">
          Natural Light Rhythm
        </label>
        <div className="space-y-1.5">
          {lightLevels.map((lvl) => {
            const isChecked = filters.light.includes(lvl);
            return (
              <button
                key={lvl}
                onClick={() => toggleArrayFilter('light', lvl)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                  isChecked
                    ? 'bg-[#1F3B22]/10 text-[#1F3B22] font-semibold border border-[#1F3B22]/30'
                    : 'text-[#5C5C5C] hover:bg-[#F0EDE5]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-3 h-3 text-[#1F3B22]" />
                  {lvl}
                </span>
                {isChecked && <Check className="w-3.5 h-3.5 text-[#1F3B22]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pet Friendly Toggle */}
      <div className="border-t border-[#E8E5DC] pt-5">
        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              petFriendly: prev.petFriendly === true ? null : true,
            }))
          }
          className={`w-full px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
            filters.petFriendly === true
              ? 'bg-[#1F3B22] text-white border-[#1F3B22] shadow-xs'
              : 'bg-[#FAF9F5] border-[#DDD9CF] text-[#141414] hover:border-[#1F3B22]'
          }`}
        >
          <span className="flex items-center gap-2">
            <PawPrint className="w-4 h-4" />
            100% Pet Friendly Only
          </span>
          {filters.petFriendly === true && <Check className="w-4 h-4" />}
        </button>
      </div>

      {/* Maintenance Level */}
      <div className="border-t border-[#E8E5DC] pt-5">
        <label className="text-[10px] font-bold text-[#141414] uppercase tracking-[0.2em] block mb-2.5">
          Care Commitment
        </label>
        <div className="flex flex-wrap gap-2">
          {maintenanceLevels.map((lvl) => {
            const isSelected = filters.maintenance.includes(lvl);
            return (
              <button
                key={lvl}
                onClick={() => toggleArrayFilter('maintenance', lvl)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  isSelected
                    ? 'bg-[#1F3B22] text-white border-[#1F3B22] font-semibold shadow-xs'
                    : 'bg-white border-[#DDD9CF] text-[#5C5C5C] hover:border-[#1F3B22]'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-[#E8E5DC] pt-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] font-bold text-[#141414] uppercase tracking-[0.2em]">
            Price Budget
          </label>
          <span className="text-xs font-bold text-[#1F3B22]">Up to ₹{filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="199"
          max="3500"
          step="50"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxPrice: parseInt(e.target.value, 10) }))
          }
          className="w-full accent-[#1F3B22] cursor-pointer"
        />
      </div>

      {/* In Stock Only */}
      <div className="border-t border-[#E8E5DC] pt-5">
        <label className="flex items-center gap-2.5 text-xs text-[#333333] cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
            className="w-4 h-4 accent-[#1F3B22] rounded cursor-pointer"
          />
          <span>In Stock Specimen Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-[#FAF9F5] border border-[#E5E2D9] rounded-3xl p-6 self-start shadow-xs sticky top-24">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-[#FAF9F5] p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-editorial text-lg font-bold text-[#141414]">Filter Flora</h3>
                  <button onClick={onMobileClose} className="p-1 text-[#7A7A7A]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {content}
              </div>
              <div className="pt-6 border-t border-[#E8E5DC] mt-6">
                <button
                  onClick={onMobileClose}
                  className="w-full pill-btn-dark py-3 text-xs font-bold uppercase tracking-wider text-center"
                >
                  View ({filteredCount}) Flora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
