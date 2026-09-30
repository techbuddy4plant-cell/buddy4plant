import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, ArrowLeft, X, Sparkles, RefreshCw, ChevronLeft, ChevronRight } from '../common/Icons';
import { Product, Category, FilterState } from '../../types';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { ProductCard } from '../common/ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { SortDropdown } from './SortDropdown';
import { setSeo, breadcrumbLd } from '../../utils/seo';

interface ProductListingPageProps {
  initialCategorySlug?: string;
  navigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

const QUICK_FILTERS = [
  { label: 'All Plants', slug: 'all' },
  { label: 'Indoor Plants', slug: 'indoor-plants' },
  { label: 'XL Plants', slug: 'xl-plants' },
  { label: 'Bundles', slug: 'plant-bundles' },
  { label: 'Low Light Plants', slug: 'low-light-plants' },
  { label: 'Cacti & Succulents', slug: 'cacti-succulents' },
  { label: 'Hanging Plants', slug: 'hanging-plants' },
  { label: 'Fruit Plants', slug: 'fruit-plants' },
  { label: 'Balcony', slug: 'location-balcony' },
  { label: 'Workspace', slug: 'location-workspace' },
  { label: 'Living Room', slug: 'location-living-room' },
  { label: 'Bedroom', slug: 'location-bedroom' },
];

const LOCATION_LABELS: Record<string, string> = {
  'location-balcony': 'Balcony',
  'location-workspace': 'Workspace',
  'location-living-room': 'Living Room',
  'location-bedroom': 'Bedroom',
};

/** A plant belongs to a sub-category if it is its main category OR it is tagged with it. */
const LOCATION_FIELD: Record<string, string> = {
  'location-balcony': 'Balcony',
  'location-workspace': 'Office Desk',
  'location-living-room': 'Living Room',
  'location-bedroom': 'Bedroom',
};

const matchesPlantCategory = (p: Product, slug: string) =>
  p.category === slug ||
  (p.tags || []).some((t) => t.toLowerCase() === slug) ||
  // Products added in the admin (no location tags) fall back to their "location" field
  (!!LOCATION_FIELD[slug] &&
    !(p.id || '').startsWith('b4p-') &&
    !(p.tags || []).some((t) => t.startsWith('location-')) &&
    p.location === LOCATION_FIELD[slug]);

const PLANT_CARE_FILTERS = [
  { label: 'All Plant Care', slug: 'plant-care' },
  { label: 'Fertilizers & Plant Food', slug: 'fertilizers' },
  { label: 'Soil & Potting Mix', slug: 'potting-soil' },
  { label: 'Pest Control', slug: 'pest-control' },
  { label: 'Garden Tools', slug: 'garden-tools' },
  { label: 'Watering Solutions', slug: 'watering-tools' },
  { label: 'Gardening Decor', slug: 'garden-decor' },
];

const POTS_FILTERS = [
  { label: 'All Pots & Planters', slug: 'pots-planters' },
  { label: 'Plastic Pots', slug: 'plastic-pots' },
  { label: 'Ceramic Pots', slug: 'ceramic-pots' },
  { label: 'Hanging Planters', slug: 'hanging-planters' },
  { label: 'Planter Stands', slug: 'planter-stands' },
];

const GIFTING_FILTERS = [
  { label: 'All Gifts', slug: 'gifting' },
  { label: 'Corporate Gifting', slug: 'corporate-gifting' },
  { label: 'Festive Gifting', slug: 'festive-gifting' },
  { label: 'Green Gifting', slug: 'green-gifting' },
];

const isGiftingCategory = (cat?: string) => ['gifting', 'corporate-gifting', 'festive-gifting', 'green-gifting', 'combos'].includes(cat || '');

const isPlantCareCategory = (cat?: string) =>
  ['plant-care', 'fertilizers', 'potting-soil', 'pest-control', 'garden-tools', 'watering-tools', 'garden-decor', 'growth-boosters'].includes(cat || '');

const isPotsCategory = (cat?: string) =>
  ['pots-planters', 'ceramic-pots', 'plastic-pots', 'hanging-planters', 'planter-stands', 'terracotta-pots', 'self-watering', 'metal-planters'].includes(cat || '');

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
    maxPrice: 10000,
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

  // Pagination (24 plants per page, like large plant stores). Page is kept in the URL (?page=2).
  const PAGE_SIZE = 24;
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const n = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  });

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

  const isPlantCareSection = isPlantCareCategory(filters.category);
  const isPotsSection = isPotsCategory(filters.category);
  const isGiftingSection = isGiftingCategory(filters.category);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Section isolation
        if (isGiftingSection) {
          const tags = (p.tags || []).map((t) => t.toLowerCase());
          if (filters.category === 'gifting') {
            if (!isGiftingCategory(p.category) && !tags.some((t) => isGiftingCategory(t))) return false;
          } else if (p.category !== filters.category && !tags.includes(filters.category)) {
            return false;
          }
        } else if (isPlantCareSection) {
          if (filters.category === 'plant-care') {
            if (!isPlantCareCategory(p.category) && !p.tags?.some(t => ['plant-care', 'fertilizer', 'soil', 'neem', 'tonic'].includes(t.toLowerCase()))) {
              return false;
            }
          } else {
            if (p.category !== filters.category && !p.subCategory?.toLowerCase().includes(filters.category.replace('-', ' '))) {
              return false;
            }
          }
        } else if (isPotsSection) {
          if (filters.category === 'pots-planters') {
            if (!isPotsCategory(p.category)) return false;
          } else {
            if (p.category !== filters.category) return false;
          }
        } else {
          // Live Plants section
          if (filters.category === 'all' || filters.category === 'plants') {
            // Strictly exclude plant-care, pots and gifting hampers from the main plants catalogue!
            if (isPlantCareCategory(p.category) || isPotsCategory(p.category) || isGiftingCategory(p.category)) {
              return false;
            }
          } else {
            if (isPlantCareCategory(p.category) || isPotsCategory(p.category)) return false;
            if (!matchesPlantCategory(p, filters.category)) {
              return false;
            }
          }
        }

        if (p.price < filters.minPrice || p.price > filters.maxPrice) {
          return false;
        }
        if (filters.light.length > 0 && !filters.light.some((l) => p.lightRequirement?.includes(l))) {
          return false;
        }
        if (filters.maintenance.length > 0 && !filters.maintenance.includes(p.maintenanceLevel)) {
          return false;
        }
        if (filters.location.length > 0 && !filters.location.some((loc) => p.location?.includes(loc))) {
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
          const matchesDesc = p.shortDescription?.toLowerCase().includes(q) || false;
          if (!matchesName && !matchesDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
        return 0;
      });
  }, [products, filters, isPlantCareSection, isPotsSection, isGiftingSection]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pagedProducts = filteredProducts.slice(pageStart, pageStart + PAGE_SIZE);

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(next);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (next === 1) url.searchParams.delete('page');
      else url.searchParams.set('page', String(next));
      window.history.replaceState({}, '', url.pathname + url.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Go back to page 1 whenever the filters / category / sorting change (not on first load)
  const filtersKey = JSON.stringify(filters);
  const lastFiltersKey = React.useRef(filtersKey);
  useEffect(() => {
    if (lastFiltersKey.current === filtersKey) return;
    lastFiltersKey.current = filtersKey;
    goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const pageNumbers = (() => {
    const pages: (number | '...')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '...') pages.push('...');
    }
    return pages;
  })();

  const currentCategory = categories.find((c) => c.slug === filters.category);
  useEffect(() => {
    const path = window.location.pathname;
    const name = currentCategory?.name || (filters.category === 'all' ? 'All Plants' : 'Shop');
    setSeo({
      title: `${name} - Buy Online in Lucknow & India`,
      description: (currentCategory?.description || `Shop ${name.toLowerCase()} online from Buddy4Plant, a Lucknow nursery.`).slice(0, 160),
      path,
      jsonLd: [breadcrumbLd([{ name: 'Home', path: '/' }, { name, path }])],
    });
  }, [currentCategory?.slug, filters.category]);
  const activeChips = isGiftingSection ? GIFTING_FILTERS : isPlantCareSection ? PLANT_CARE_FILTERS : isPotsSection ? POTS_FILTERS : QUICK_FILTERS;

  return (
    <div className="bg-[#FAF5EE] min-h-screen py-8 sm:py-12 text-[#182018] relative">
      {/* Decorative Botanical Foliage Framing (Left & Right top corners as in reference design) */}
      <div className="pointer-events-none absolute -top-8 -left-10 w-48 sm:w-72 lg:w-88 h-64 sm:h-96 opacity-85 z-0 select-none hidden sm:block overflow-hidden">
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Palm Fronds & Tropical Leaves */}
          <path d="M-20 40C40 30 110 90 140 160C110 140 50 120 -20 110" fill="#3D5A42" fillOpacity="0.75" />
          <path d="M-10 80C60 80 130 150 160 230C130 200 60 170 -10 160" fill="#4B6E52" fillOpacity="0.8" />
          <path d="M-30 0C50 -10 150 40 200 120C150 90 60 70 -30 60" fill="#2E4833" fillOpacity="0.85" />
          <path d="M10 140C80 140 150 220 170 310C140 270 80 230 10 210" fill="#5B7E62" fillOpacity="0.75" />
          <path d="M-40 180C30 190 90 270 100 360C80 320 30 270 -40 250" fill="#3A563F" fillOpacity="0.7" />
          {/* Subtle warm highlights */}
          <path d="M20 60C70 60 120 120 140 190C120 160 80 130 20 120" stroke="#8EB093" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -top-8 -right-10 w-48 sm:w-72 lg:w-88 h-64 sm:h-96 opacity-85 z-0 select-none hidden sm:block overflow-hidden">
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-x-[-1]">
          {/* Palm Fronds & Tropical Leaves */}
          <path d="M-20 40C40 30 110 90 140 160C110 140 50 120 -20 110" fill="#3D5A42" fillOpacity="0.75" />
          <path d="M-10 80C60 80 130 150 160 230C130 200 60 170 -10 160" fill="#4B6E52" fillOpacity="0.8" />
          <path d="M-30 0C50 -10 150 40 200 120C150 90 60 70 -30 60" fill="#2E4833" fillOpacity="0.85" />
          <path d="M10 140C80 140 150 220 170 310C140 270 80 230 10 210" fill="#5B7E62" fillOpacity="0.75" />
          <path d="M-40 180C30 190 90 270 100 360C80 320 30 270 -40 250" fill="#3A563F" fillOpacity="0.7" />
          {/* Subtle warm highlights */}
          <path d="M20 60C70 60 120 120 140 190C120 160 80 130 20 120" stroke="#8EB093" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A746B] mb-6 sm:mb-8 font-sans">
          <button onClick={() => navigate('/')} className="hover:text-[#182018] transition-colors">
            Home
          </button>
          <span className="text-[#B5ACA0]">/</span>
          <span className="text-[#182018] font-medium">
            {isGiftingSection ? 'Gifting' : isPlantCareSection ? 'Plant Care Collection' : isPotsSection ? 'Pots & Planters' : 'Nursery Catalogue'}
          </span>
          {currentCategory && (
            <>
              <span className="text-[#B5ACA0]">/</span>
              <span className="text-[#1A3824] font-semibold">{currentCategory.name}</span>
            </>
          )}
        </div>

        {/* Editorial Header */}
        <div className="mb-8 sm:mb-12">
          <div className="max-w-3xl">
            <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2 font-sans">
              {isGiftingSection ? 'GIFTS THAT GROW' : isPlantCareSection ? 'PLANT NUTRITION & DOCTOR CARE' : isPotsSection ? 'ARTISANAL PLANTERS' : 'BOTANICAL SANCTUARY'}
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-[#141C14] tracking-tight leading-[1.08]">
              {isGiftingSection
                ? (currentCategory ? currentCategory.name : 'Plant Gifts for Every Occasion')
                : isPlantCareSection
                ? (currentCategory ? currentCategory.name : 'Plant Care, Organic Fertilizers & Soils')
                : isPotsSection
                ? (currentCategory ? currentCategory.name : 'Pots, Planters & Drainage Systems')
                : (currentCategory ? currentCategory.name : LOCATION_LABELS[filters.category] ? `Plants for ${LOCATION_LABELS[filters.category]}` : 'All Plants')}
            </h1>
            <p className="mt-3 text-xs sm:text-[15px] text-[#5C554B] leading-relaxed max-w-2xl">
              {isGiftingSection
                ? (filters.category === 'corporate-gifting'
                  ? 'Plant hampers for employees, clients and festive occasions - custom branding, bulk pricing and pan-India delivery. Enquire on WhatsApp for a quote.'
                  : filters.category === 'festive-gifting'
                  ? 'Lucky plants, festive bundles and gift-ready pots for Diwali, Ganpati, housewarmings and every celebration.'
                  : 'Living gifts that keep growing - easy plants for birthdays, anniversaries, housewarmings and thank-yous.')
                : isPlantCareSection
                ? 'Cold-pressed neem shields, bio-active organic plant foods, vermicompost, and microbiome-rich potting mixes engineered for lush leaf growth and disease immunity.'
                : isPotsSection
                ? 'Handcrafted terracotta, artisanal glazed ceramics, and smart self-watering containers designed to let root systems breathe.'
                : (currentCategory?.description ||
                  'Ethically acclimatized houseplants and rare specimens, hand-nurtured to thrive effortlessly in contemporary living spaces.')}
            </p>
          </div>

          {/* Quick Filter Pill Chips */}
          <div className="flex items-center gap-2.5 mt-7 overflow-x-auto pb-2 scrollbar-none">
            {activeChips.map((chip) => {
              const isActive = filters.category === chip.slug;
              return (
                <button
                  key={chip.slug}
                  onClick={() => setFilters((prev) => ({ ...prev, category: chip.slug }))}
                  className={`shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-xs ${
                    isActive
                      ? 'bg-[#1A3824] text-white shadow-sm ring-1 ring-[#1A3824]'
                      : 'bg-white/90 border border-[#DDD5C7] text-[#3D372E] hover:border-[#1A3824] hover:bg-white'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">
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
            <div className="bg-[#F5EEE4]/80 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-[#E5DDD0] mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 shadow-xs">
              <span className="text-xs text-[#5C554B]">
                Showing{' '}
                <strong className="text-[#141C14] font-semibold">
                  {filteredProducts.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredProducts.length)}
                </strong>{' '}
                of <strong className="text-[#141C14] font-semibold">{filteredProducts.length}</strong>{' '}
                {isPotsSection || isPlantCareSection || isGiftingSection ? 'products' : 'plants'}
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
              <div className="py-28 text-center text-xs text-[#7A746B]">
                <div className="w-8 h-8 border-2 border-[#1A3824] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Gathering botanical collection...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#F5EEE4]/80 rounded-3xl border border-[#E5DDD0] p-12 text-center my-8 shadow-xs">
                <p className="text-sm font-semibold text-[#141C14]">
                  No flora matches your current filter criteria.
                </p>
                <p className="text-xs text-[#7A746B] mt-1">
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
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                  {pagedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      navigate={navigate}
                      onQuickView={onQuickView}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Pages" className="mt-12 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button
                        onClick={() => goToPage(safePage - 1)}
                        disabled={safePage === 1}
                        className="h-10 px-4 rounded-full border border-[#DDD5C7] bg-white text-[#182018] text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1A3824] shadow-xs transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>
                      {pageNumbers.map((n, idx) =>
                        n === '...' ? (
                          <span key={`dots-${idx}`} className="px-1 text-xs text-[#7A746B]">…</span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => goToPage(n)}
                            aria-current={n === safePage ? 'page' : undefined}
                            className={`h-10 w-10 rounded-full text-xs font-bold transition-all shadow-xs ${
                              n === safePage
                                ? 'bg-[#1A3824] text-white'
                                : 'bg-white border border-[#DDD5C7] text-[#182018] hover:border-[#1A3824]'
                            }`}
                          >
                            {n}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => goToPage(safePage + 1)}
                        disabled={safePage === totalPages}
                        className="h-10 px-4 rounded-full border border-[#DDD5C7] bg-white text-[#182018] text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#1A3824] shadow-xs transition-colors"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[#7A746B]">
                      Page {safePage} of {totalPages}
                    </span>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
