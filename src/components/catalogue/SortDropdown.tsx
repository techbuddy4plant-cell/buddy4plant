import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { FilterState } from '../../types';

interface SortDropdownProps {
  sortBy: FilterState['sortBy'];
  onChange: (sort: FilterState['sortBy']) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onChange }) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <ArrowUpDown className="w-3.5 h-3.5 text-[#7A7A7A]" />
      <span className="text-[#7A7A7A] font-medium hidden sm:inline">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value as FilterState['sortBy'])}
        className="bg-white border border-[#E5E2D9] px-3 py-1.5 font-medium text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] text-xs"
      >
        <option value="featured">Featured / Curated</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
        <option value="newest">New Arrivals</option>
      </select>
    </div>
  );
};
