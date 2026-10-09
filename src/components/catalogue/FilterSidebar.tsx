import React from 'react';
import { FilterState, Category } from '../../types';
import { RotateCcw, X, Check, Sun, Droplets, PawPrint } from '../common/Icons';

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
    <div className="space-y-3 text-[11px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E6DDD0]">
        <div>
          <h3 className="font-editorial font-bold text-xs text-[#141C14]">Filters</h3>
          <p className="text-[9.5px] text-[#7A746B]">
            {filteredCount} of {totalProductsCount} products
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-[10.5px] text-[#1A3824] font-semibold hover:underline flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          Reset
        </button>
      </div>

      {/* Category selector */}
      <div>
        <label className="text-[8.5px] font-bold text-[#141C14] uppercase tracking-[0.2em] block mb-1 font-sans">
          Collection
        </label>
        <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
            className={`w-full text-left px-2 py-1 text-[11px] rounded-md flex items-center justify-between transition-colors ${
              filters.category === 'all'
                ? 'bg-[#1A3824] text-white font-semibold shadow-xs'
                : 'text-[#2D2A26] hover:bg-[#EBE3D6]'
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
                className={`w-full text-left px-2 py-1 text-[11px] rounded-md flex items-center justify-between transition-colors ${
                  filters.category === cat.slug
                    ? 'bg-[#1A3824] text-white font-semibold shadow-xs'
                    : 'text-[#2D2A26] hover:bg-[#EBE3D6]'
                }`}
              >
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Sunlight Requirement */}
      <div className="border-t border-[#E6DDD0] pt-2.5">
        <label className="text-[8.5px] font-bold text-[#141C14] uppercase tracking-[0.2em] block mb-1 font-sans">
          Light Rhythm
        </label>
        <div className="grid grid-cols-2 gap-1">
          {lightLevels.map((lvl) => {
            const isChecked = filters.light.includes(lvl);
            return (
              <button
                key={lvl}
                onClick={() => toggleArrayFilter('light', lvl)}
                className={`text-left px-1.5 py-1 rounded-md text-[10px] leading-tight flex items-center justify-between transition-all ${
                  isChecked
                    ? 'bg-[#1A3824] text-white font-semibold shadow-xs'
                    : 'bg-white/80 border border-[#DDD5C7] text-[#5C554B] hover:border-[#1A3824]'
                }`}
              >
                <span className="truncate">{lvl.replace(' Sunlight', '').replace(' Light', '')}</span>
                {isChecked && <Check className="w-2.5 h-2.5 text-white shrink-0 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pet Friendly Toggle */}
      <div className="border-t border-[#E6DDD0] pt-2.5">
        <button
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              petFriendly: prev.petFriendly === true ? null : true,
            }))
          }
          className={`w-full px-2.5 py-1.5 rounded-lg border text-[10.5px] font-semibold flex items-center justify-between transition-all ${
            filters.petFriendly === true
              ? 'bg-[#1A3824] text-white border-[#1A3824] shadow-xs'
              : 'bg-white/80 border-[#DDD5C7] text-[#141C14] hover:border-[#1A3824]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <PawPrint className="w-3 h-3" />
            100% Pet Friendly
          </span>
          {filters.petFriendly === true && <Check className="w-3 h-3" />}
        </button>
      </div>

      {/* Care Commitment */}
      <div className="border-t border-[#E6DDD0] pt-2.5">
        <label className="text-[8.5px] font-bold text-[#141C14] uppercase tracking-[0.2em] block mb-1 font-sans">
          Care Level
        </label>
        <div className="grid grid-cols-3 gap-1">
          {maintenanceLevels.map((lvl) => {
            const isSelected = filters.maintenance.includes(lvl);
            return (
              <button
                key={lvl}
                onClick={() => toggleArrayFilter('maintenance', lvl)}
                className={`py-0.5 text-[10px] rounded-md border text-center transition-all ${
                  isSelected
                    ? 'bg-[#1A3824] text-white border-[#1A3824] font-semibold shadow-xs'
                    : 'bg-white border-[#DDD5C7] text-[#5C554B] hover:border-[#1A3824]'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-[#E6DDD0] pt-2.5">
        <div className="flex justify-between items-center mb-1">
          <label className="text-[8.5px] font-bold text-[#141C14] uppercase tracking-[0.2em] font-sans">
            Price Budget
          </label>
          <span className="text-[10px] font-bold text-[#1A3824]">Up to ₹{filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max="10000"
          step="50"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxPrice: parseInt(e.target.value, 10) }))
          }
          className="w-full accent-[#1A3824] cursor-pointer h-1.5"
        />
      </div>

      {/* In Stock Only */}
      <div className="border-t border-[#E6DDD0] pt-2">
        <label className="flex items-center gap-1.5 text-[10.5px] text-[#332E27] cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
            className="w-3 h-3 accent-[#1A3824] rounded cursor-pointer"
          />
          <span>In stock only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Compact, stays fixed / sticky below the navbar without being cut off) */}
      <aside className="hidden lg:block w-52 xl:w-56 shrink-0 bg-[#F5EEE4]/95 border border-[#E5DDD0] rounded-2xl p-3.5 self-start shadow-xs sticky top-28 lg:top-32 max-h-[calc(100vh-8.5rem)] overflow-y-auto overscroll-contain pr-1.5 custom-scrollbar z-10">
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
            <div className="w-screen max-w-sm bg-[#FAF5EE] p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-editorial text-lg font-bold text-[#141C14]">Filters</h3>
                  <button onClick={onMobileClose} className="p-1 text-[#7A746B]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {content}
              </div>
              <div className="pt-6 border-t border-[#E6DDD0] mt-6">
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
