import React from 'react';
import { ArrowUpDown } from '../common/Icons';
import { FilterState } from '../../types';

interface SortDropdownProps {
  sortBy: FilterState['sortBy'];
  onChange: (sort: FilterState['sortBy']) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onChange }) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <ArrowUpDown className="w-3.5 h-3.5 text-[#6E685E]" />
      <span className="text-[#6E685E] font-medium hidden sm:inline">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value as FilterState['sortBy'])}
        className="bg-white border border-[#DDD5C7] rounded-full px-3.5 py-1.5 font-medium text-[#1A1A1A] focus:outline-none focus:border-[#1F3B22] text-xs cursor-pointer shadow-xs transition-colors"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">New Arrivals</option>
      </select>
    </div>
  );
};
