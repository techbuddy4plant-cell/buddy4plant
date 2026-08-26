import React, { useState, useEffect, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowLeft, X, Sparkles } from 'lucide-react';
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
    maxPrice: 3000,
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

  // Sync category slug if changed
  useEffect(() => {
    if (initialCategorySlug) {
      setFilters((prev) => ({ ...prev, category: initialCategorySlug }));
    }
  }, [initialCategorySlug]);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([pList, cList]) => {
      setProducts(pList);
      setCategories(cList);
      setLoading(false);
    });
  }, []);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category check
      if (filters.category && filters.category !== 'all' && p.category !== filters.category) {
        return false;
      }
      // Price range
      if (p.price < filters.minPrice || p.price > filters.maxPrice) {
        return false;
      }
      // Sunlight
      if (filters.light.length > 0 && !filters.light.some((l) => p.lightRequirement.includes(l))) {
        return false;
      }
      // Maintenance
      if (filters.maintenance.length > 0 && !filters.maintenance.includes(p.maintenanceLevel)) {
        return false;
      }
      // Location / Space
      if (filters.location.length > 0 && !filters.location.some((loc) => p.location.includes(loc))) {
        return false;
      }
      // Pet friendly
      if (filters.petFriendly === true && !p.petFriendly) {
        return false;
      }
      // In stock
      if (filters.inStockOnly && p.stock <= 0) {
        return false;
      }
      // Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.shortDescription.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return b.createdAt - a.createdAt;
      return 0; // featured
    });
  }, [products, filters]);

  const currentCategory = categories.find((c) => c.slug === filters.category);

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A] mb-6">
          <button onClick={() => navigate('/')} className="hover:text-[#1A1A1A]">
            Home
          </button>
          <span>/</span>
          <span className="font-semibold text-[#1A1A1A] capitalize">
            {currentCategory ? currentCategory.name : 'All Plants Catalogue'}
          </span>
        </div>

        {/* Category Header */}
        <div className="bg-white p-6 sm:p-10 border border-[#E5E2D9] mb-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-[#2D4A27] uppercase tracking-[0.25em] block mb-1">
              Botanical Flora & Nursery Greens
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              {currentCategory ? currentCategory.name : 'Curated Plant Collection'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A5A5A] mt-2 leading-relaxed font-light">
              {currentCategory?.description ||
                'Discover resilient indoor, air-purifying, flowering, and foliage plants potted in premium organic cocopeat mix.'}
            </p>
          </div>
        </div>

        {/* Main Content Layout with Sidebar & Grid */}
        <div className="flex gap-8 items-start">
          {/* Desktop Filter Sidebar */}
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

          {/* Product Listing Area */}
          <div className="flex-1 min-w-0">
            {/* Action Bar (Filter toggle for mobile, sort dropdown, result count) */}
            <div className="bg-white p-4 border border-[#E5E2D9] flex items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 bg-[#F5F2EB] hover:bg-[#E5E2D9] text-[#1A1A1A] text-xs font-semibold flex items-center gap-2 border border-[#E5E2D9]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter ({filteredProducts.length})
              </button>

              <span className="text-xs text-[#7A7A7A] hidden sm:inline">
                Showing <strong className="text-[#1A1A1A]">{filteredProducts.length}</strong> green specimens
              </span>

              <SortDropdown
                sortBy={filters.sortBy}
                onChange={(sort) => setFilters((prev) => ({ ...prev, sortBy: sort }))}
              />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 text-center border border-[#E5E2D9]">
                <div className="w-14 h-14 bg-[#F5F2EB] flex items-center justify-center mx-auto text-xl mb-4 border border-[#E5E2D9]">
                  <i className="fa-solid fa-leaf text-[#2D4A27]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">No matching plants found</h3>
                <p className="text-xs text-[#5A5A5A] mt-1 max-w-sm mx-auto font-light">
                  Try adjusting your price range, light requirements, or reset your filters to view all available plants.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
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
