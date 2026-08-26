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
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
        <div>
          <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Filter Plants</h3>
          <p className="text-[11px] text-[#7A7A7A]">
            Showing {filteredCount} of {totalProductsCount} products
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#2D4A27] font-semibold hover:text-[#1A1A1A] flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Category selector */}
      <div>
        <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-2.5">
          Collection / Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
              filters.category === 'all'
                ? 'bg-[#2D4A27] text-white font-semibold'
                : 'text-[#1A1A1A] hover:bg-[#F5F2EB]'
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
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  filters.category === cat.slug
                    ? 'bg-[#2D4A27] text-white font-semibold'
                    : 'text-[#1A1A1A] hover:bg-[#F5F2EB]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-[#E5E2D9] pt-5">
        <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-2.5">
          Price Range: ₹{filters.minPrice} – ₹{filters.maxPrice}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="200"
            max="3000"
            step="50"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
            className="w-full accent-[#2D4A27] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#7A7A7A]">
            <span>₹200</span>
            <span>₹1,500</span>
            <span>₹3,000+</span>
          </div>
        </div>
      </div>

      {/* Pet Friendly Toggle */}
      <div className="border-t border-[#E5E2D9] pt-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.petFriendly === true}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                petFriendly: e.target.checked ? true : null,
              }))
            }
            className="w-4 h-4 text-[#2D4A27] accent-[#2D4A27] focus:ring-[#2D4A27]"
          />
          <span className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
            <PawPrint className="w-3.5 h-3.5 text-[#8B5E3C]" />
            100% Pet Friendly Only
          </span>
        </label>
      </div>

      {/* Light Requirement */}
      <div className="border-t border-[#E5E2D9] pt-5">
        <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-2.5">
          Sunlight / Exposure
        </label>
        <div className="space-y-1.5">
          {lightLevels.map((lvl) => (
            <label key={lvl} className="flex items-center gap-2 cursor-pointer text-xs text-[#5A5A5A] hover:text-[#1A1A1A]">
              <input
                type="checkbox"
                checked={filters.light.includes(lvl)}
                onChange={() => toggleArrayFilter('light', lvl)}
                className="w-4 h-4 text-[#2D4A27] accent-[#2D4A27] focus:ring-[#2D4A27]"
              />
              <span>{lvl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Maintenance Level */}
      <div className="border-t border-[#E5E2D9] pt-5">
        <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-2.5">
          Maintenance Level
        </label>
        <div className="space-y-1.5">
          {maintenanceLevels.map((lvl) => (
            <label key={lvl} className="flex items-center gap-2 cursor-pointer text-xs text-[#5A5A5A] hover:text-[#1A1A1A]">
              <input
                type="checkbox"
                checked={filters.maintenance.includes(lvl)}
                onChange={() => toggleArrayFilter('maintenance', lvl)}
                className="w-4 h-4 text-[#2D4A27] accent-[#2D4A27] focus:ring-[#2D4A27]"
              />
              <span>{lvl} Care</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location / Placement */}
      <div className="border-t border-[#E5E2D9] pt-5">
        <label className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block mb-2.5">
          Placement in House
        </label>
        <div className="space-y-1.5">
          {locations.map((loc) => (
            <label key={loc} className="flex items-center gap-2 cursor-pointer text-xs text-[#5A5A5A] hover:text-[#1A1A1A]">
              <input
                type="checkbox"
                checked={filters.location.includes(loc)}
                onChange={() => toggleArrayFilter('location', loc)}
                className="w-4 h-4 text-[#2D4A27] accent-[#2D4A27] focus:ring-[#2D4A27]"
              />
              <span>{loc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <div className="border-t border-[#E5E2D9] pt-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))}
            className="w-4 h-4 text-[#2D4A27] accent-[#2D4A27] focus:ring-[#2D4A27]"
          />
          <span className="text-xs font-medium text-[#1A1A1A]">In-Stock Only</span>
        </label>
      </div>
    </div>
  );

  // If on desktop sidebar
  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block w-64 bg-white p-6 border border-[#E5E2D9] shadow-xs shrink-0 self-start">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 overflow-y-auto border-r border-[#E5E2D9]">
            <div className="flex justify-end mb-2">
              <button
                onClick={onMobileClose}
                className="p-1 text-[#7A7A7A] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
