import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, ArrowLeft, X, Sparkles, RefreshCw } from 'lucide-react';
import { Product, Category, FilterState } from '../../types';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { ProductCard } from '../common/ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { SortDropdown } from './SortDropdown';

interface ProductListingPageProps {
  initialCategorySlug?: string;
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

const QUICK_FILTERS = [
  { label: 'All Plants', slug: 'all' },
  { label: 'Air-Purifying', slug: 'air-purifying' },
  { label: 'Low Maintenance', slug: 'low-maintenance' },
  { label: 'Cacti & Succulents', slug: 'cacti-succulents' },
  { label: 'Curated Combos', slug: 'combos' },
  { label: 'Artisanal Pots', slug: 'pots-planters' },
];

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  initialCategorySlug = 'all',
  navigate,
  onQuickView,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const initialFilters: FilterState = {
    category: initialCategorySlug,
    plantType: [],
    minPrice: 0,
    maxPrice: 3500,
    light: [],
    maintenance: [],
    location: [],
    watering: [],
    petFriendly: null,
    inStockOnly: false,
    sortBy: 'featured',
    searchQuery: '',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    if (initialCategorySlug) {
      setFilters((prev) => ({ ...prev, category: initialCategorySlug }));
    }
  }, [initialCategorySlug]);

  const loadData = () => {
    Promise.all([getProducts(), getCategories()]).then(([pList, cList]) => {
      setProducts(pList);
      setCategories(cList);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    const handleDataChanged = () => {
      loadData();
    };
    window.addEventListener('b4p_store_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('b4p_store_data_changed', handleDataChanged);
    };
  }, []);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.category && filters.category !== 'all' && p.category !== filters.category) {
          return false;
        }
        if (p.price < filters.minPrice || p.price > filters.maxPrice) {
          return false;
        }
        if (filters.light.length > 0 && !filters.light.some((l) => p.lightRequirement.includes(l))) {
          return false;
        }
        if (filters.maintenance.length > 0 && !filters.maintenance.includes(p.maintenanceLevel)) {
          return false;
        }
        if (filters.location.length > 0 && !filters.location.some((loc) => p.location.includes(loc))) {
          return false;
        }
        if (filters.petFriendly === true && !p.petFriendly) {
          return false;
        }
        if (filters.inStockOnly && p.stock <= 0) {
          return false;
        }
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = p.shortDescription.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'newest') return b.createdAt - a.createdAt;
        return 0;
      });
  }, [products, filters]);

  const currentCategory = categories.find((c) => c.slug === filters.category);

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-10 text-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A] mb-8">
          <button onClick={() => navigate('/')} className="hover:text-[#141414] transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-[#141414] font-medium">Nursery Catalogue</span>
          {currentCategory && (
            <>
              <span>/</span>
              <span className="text-[#1F3B22] font-semibold">{currentCategory.name}</span>
            </>
          )}
        </div>

        {/* Editorial Header */}
        <div className="mb-10">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block mb-1.5">
              Botanical Sanctuary
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#141414] tracking-tight">
              {currentCategory ? currentCategory.name : 'Living Botanical Collection'}
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-[#5C5C5C] leading-relaxed">
              {currentCategory?.description ||
                'Ethically acclimatized houseplants, rare succulents, and cold-pressed organic botanical care, hand-nurtured to thrive in living spaces.'}
            </p>
          </div>

          {/* Quick Filter Pill Chips */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
            {QUICK_FILTERS.map((chip) => {
              const isActive = filters.category === chip.slug;
              return (
                <button
                  key={chip.slug}
                  onClick={() => setFilters((prev) => ({ ...prev, category: chip.slug }))}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1F3B22] text-white shadow-xs'
                      : 'bg-[#FAF9F5] border border-[#DDD9CF] text-[#4A4A4A] hover:border-[#1F3B22]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            totalProductsCount={products.length}
            filteredCount={filteredProducts.length}
            onReset={resetFilters}
            isMobileOpen={isMobileFilterOpen}
            onMobileClose={() => setIsMobileFilterOpen(false)}
          />

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar */}
            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E5E2D9] mb-6 flex items-center justify-between gap-4">
              <span className="text-xs text-[#5C5C5C]">
                Showing <strong className="text-[#141414] font-semibold">{filteredProducts.length}</strong> botanical specimens
              </span>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Trigger */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden pill-btn-light text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-4 py-2"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <SortDropdown
                  value={filters.sortBy}
                  onChange={(val) => setFilters((prev) => ({ ...prev, sortBy: val }))}
                />
              </div>
            </div>

            {/* Grid or Empty */}
            {loading ? (
              <div className="py-28 text-center text-xs text-[#7A7A7A]">
                <div className="w-8 h-8 border-2 border-[#1F3B22] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Gathering botanical collection...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#FAF9F5] rounded-3xl border border-[#E5E2D9] p-12 text-center my-8">
                <p className="text-sm font-semibold text-[#141414]">
                  No flora matches your current filter criteria.
                </p>
                <p className="text-xs text-[#7A7A7A] mt-1">
                  Try adjusting sunlight, maintenance, or price preferences.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 pill-btn-dark px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    navigate={navigate}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
