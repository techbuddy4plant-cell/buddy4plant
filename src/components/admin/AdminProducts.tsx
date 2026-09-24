import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  Eye,
  AlertCircle,
  Upload,
  Sparkles,
  Tag
} from 'lucide-react';
import { Product, Category, ProductVariant } from '../../types';
import { INITIAL_CATEGORIES } from '../../data/initialCategories';
import { saveProduct, deleteProduct, deleteAllProducts } from '../../services/productService';
import { PlantImage } from '../../utils/imageFallback';
import { PlantImageUploader } from './PlantImageUploader';
import { AdminToastNotification } from './AdminToastNotification';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  sectionFilter?: 'all' | 'plants' | 'pots-planters' | 'plant-care' | 'combos';
  sectionTitle?: string;
  sectionDescription?: string;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  onRefresh,
  sectionFilter = 'all',
  sectionTitle,
  sectionDescription,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const initialFormState: Partial<Product> = {
    name: '',
    slug: '',
    sku: 'VB-' + Math.floor(1000 + Math.random() * 9000),
    shortDescription: '',
    description: '',
    price: 499,
    compareAtPrice: 699,
    category: 'indoor-plants',
    plantType: 'Indoor Plants',
    plantSize: 'Medium (9-15")',
    lightRequirement: 'Bright Indirect Light',
    wateringFrequency: 'Once a week',
    maintenanceLevel: 'Easy',
    location: 'Living Room',
    indoorOutdoor: 'Indoor',
    petFriendly: true,
    featured: false,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'],
    tags: ['indoor', 'air purifying'],
    bestseller: false,
    newArrival: true,
    active: true,
    careInstructions: {
      light: 'Thrives in bright filtered natural sunlight. Avoid harsh direct midday rays.',
      water: 'Water thoroughly once the top 2 inches of soil feel dry to the touch.',
      temperature: '18°C – 32°C',
      fertilizer: 'Feed with organic liquid seaweed fertilizer once a month during spring and summer.',
      tips: 'Wipe leaves with a damp microfiber cloth to keep dust away and promote photosynthesis.',
    },
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

  const handleAddVariantRow = () => {
    setFormVariants((prev) => [
      ...prev,
      { size: `${prev.length + 1} KG`, price: 299, compareAtPrice: 399, unitRate: '' }
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    setFormVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPresetVariant = (size: string, defaultPrice?: number) => {
    setFormVariants((prev) => {
      if (prev.some(v => v.size.toLowerCase() === size.toLowerCase())) return prev;
      let price = defaultPrice || 199;
      let rate = '';
      if (size === '1 KG') { price = 199; rate = '₹199/kg'; }
      else if (size === '3 KG') { price = 299; rate = '(₹100/kg)'; }
      else if (size === '5 KG') { price = 349; rate = '(₹70/kg)'; }
      else if (size === '10 KG') { price = 649; rate = '(₹65/kg)'; }
      else if (size === '250 ML') { price = 199; rate = ''; }
      else if (size === '500 ML') { price = 349; rate = ''; }
      else if (size === '1 L') { price = 599; rate = ''; }
      return [...prev, { size, price, compareAtPrice: Math.round(price * 1.4), unitRate: rate }];
    });
  };
  // Guarantee available categories for every section (Plants, Pots, Care, Gifting)
  const availableCategories = React.useMemo(() => {
    const baseList = (categories && categories.length > 0) ? categories : INITIAL_CATEGORIES;
    
    // Tailored default categories based on section
    let sectionDefaults: { slug: string; name: string }[] = [];
    if (sectionFilter === 'plants') {
      sectionDefaults = [
        { slug: 'indoor-plants', name: 'Indoor Foliage Plants' },
        { slug: 'air-purifying', name: 'Air Purifying (NASA Detox)' },
        { slug: 'low-maintenance', name: 'Low Maintenance & Hardy' },
        { slug: 'cacti-succulents', name: 'Cacti & Succulents' },
        { slug: 'flowering-plants', name: 'Flowering Houseplants' },
        { slug: 'hanging-plants', name: 'Hanging & Trailing Vines' },
        { slug: 'pet-friendly', name: 'Pet Friendly Houseplants' },
      ];
    } else if (sectionFilter === 'pots-planters') {
      sectionDefaults = [
        { slug: 'pots-planters', name: 'Pots & Planters (General)' },
        { slug: 'self-watering', name: 'Self-Watering Sub-Irrigation' },
        { slug: 'ceramic-pots', name: 'Artisanal Glazed Ceramic Pots' },
        { slug: 'terracotta-pots', name: 'Natural Clay Terracotta Pots' },
        { slug: 'metal-planters', name: 'Metal Planters & Heavy Stands' },
      ];
    } else if (sectionFilter === 'plant-care') {
      sectionDefaults = [
        { slug: 'plant-care', name: 'Plant Care & Soil (General)' },
        { slug: 'fertilizers', name: 'Organic Bio-Fertilizers & Kelp Feed' },
        { slug: 'pest-control', name: 'Golden Neem Oil Pest Shields' },
        { slug: 'potting-soil', name: 'Aged Bark & Microbiome Soil' },
      ];
    } else if (sectionFilter === 'combos') {
      sectionDefaults = [
        { slug: 'combos', name: 'Curated Combos & Value Packs' },
        { slug: 'gifting', name: 'Botanical Gifts & Starter Sets' },
        { slug: 'purifier-trio', name: 'Air Purifying Detox Trio' },
      ];
    } else {
      sectionDefaults = [
        { slug: 'indoor-plants', name: 'Indoor Foliage Plants' },
        { slug: 'air-purifying', name: 'Air Purifying Plants' },
        { slug: 'low-maintenance', name: 'Low Maintenance' },
        { slug: 'cacti-succulents', name: 'Cacti & Succulents' },
        { slug: 'flowering-plants', name: 'Flowering Houseplants' },
        { slug: 'pots-planters', name: 'Pots & Planters' },
        { slug: 'plant-care', name: 'Plant Care & Soil' },
        { slug: 'combos', name: 'Combos & Gift Packs' },
      ];
    }

    const seenSlugs = new Set<string>();
    const result: { slug: string; name: string }[] = [];

    // Add section defaults first
    for (const item of sectionDefaults) {
      if (!seenSlugs.has(item.slug)) {
        seenSlugs.add(item.slug);
        result.push(item);
      }
    }

    // Add any database categories
    for (const c of baseList) {
      if (!seenSlugs.has(c.slug)) {
        seenSlugs.add(c.slug);
        result.push({ slug: c.slug, name: c.name });
      }
    }

    return result;
  }, [categories, sectionFilter]);


  const openAddModal = () => {
    let defaultCat = 'indoor-plants';
    let defaultType = 'Indoor Plants';
    let defaultTags = ['indoor', 'air purifying'];

    if (sectionFilter === 'pots-planters') {
      defaultCat = 'pots-planters';
      defaultType = 'Self-Watering Planters';
      defaultTags = ['ceramic', 'self-watering', 'planter'];
    } else if (sectionFilter === 'plant-care') {
      defaultCat = 'plant-care';
      defaultType = 'Organic Plant Food';
      defaultTags = ['organic', 'bio-fertilizer', 'soil nutrition'];
    } else if (sectionFilter === 'combos') {
      defaultCat = 'combos';
      defaultType = 'Combo Pack';
      defaultTags = ['gift bundle', 'starter kit'];
    }

    setEditingProduct(null);
    let initVariants: ProductVariant[] = [];
    if (sectionFilter === 'plant-care') {
      initVariants = [
        { size: '1 KG', price: 199, compareAtPrice: 299, unitRate: '₹199/kg' },
        { size: '5 KG', price: 349, compareAtPrice: 499, unitRate: '(₹70/kg)' },
        { size: '10 KG', price: 649, compareAtPrice: 899, unitRate: '(₹65/kg)' },
      ];
    }
    setFormVariants(initVariants);
    setFormData({
      ...initialFormState,
      category: defaultCat,
      plantType: defaultType,
      tags: defaultTags,
      price: initVariants.length > 0 ? initVariants[0].price : initialFormState.price,
      compareAtPrice: initVariants.length > 0 ? initVariants[0].compareAtPrice : initialFormState.compareAtPrice,
    });
    setProductImages(initialFormState.images || ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80']);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setProductImages(p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80']);
    if (p.variants && p.variants.length > 0) {
      setFormVariants(p.variants);
    } else if (p.weightOptions && p.weightOptions.length > 0) {
      setFormVariants(p.weightOptions.map((opt, i) => {
        const ratio = i === 0 ? 1 : i === 1 ? 1.75 : i === 2 ? 3.25 : 5.5;
        const price = Math.round(p.price * ratio);
        return {
          size: opt,
          price,
          compareAtPrice: p.compareAtPrice ? Math.round(p.compareAtPrice * ratio) : Math.round(price * 1.4),
          unitRate: opt.toLowerCase().includes('kg') ? `(₹${Math.round(price / (i === 0 ? 1 : i === 1 ? 5 : 10))}/kg)` : undefined,
        };
      }));
    } else if (p.weightVolume) {
      setFormVariants([{ size: p.weightVolume, price: p.price, compareAtPrice: p.compareAtPrice }]);
    } else {
      setFormVariants([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.name?.trim() || !formData.price) {
      setError('Please fill in required plant name and price.');
      return;
    }

    setIsSaving(true);
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const images = productImages.length > 0
        ? productImages
        : ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'];

      let fallbackCat = 'indoor-plants';
      if (sectionFilter === 'plant-care') fallbackCat = 'plant-care';
      else if (sectionFilter === 'pots-planters') fallbackCat = 'pots-planters';
      else if (sectionFilter === 'combos') fallbackCat = 'combos';

      const finalCategory = formData.category || fallbackCat;
      const validVariants = formVariants
        .filter((v) => v.size && v.size.trim())
        .map((v) => ({
          size: v.size.trim(),
          price: Number(v.price) || 0,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          unitRate: v.unitRate ? v.unitRate.trim() : undefined,
          inStock: v.inStock !== undefined ? v.inStock : true,
        }));
      const primaryPrice = validVariants.length > 0 ? validVariants[0].price : Number(formData.price);
      const primaryCompare = validVariants.length > 0 ? validVariants[0].compareAtPrice : (formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined);
      const primarySize = validVariants.length > 0 ? validVariants[0].size : (formData.plantSize || (sectionFilter === 'plant-care' ? '1 KG' : 'Medium (9-15")'));

      const productToSave: Product = {
        id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
        name: formData.name,
        slug,
        sku: formData.sku || 'VB-100',
        shortDescription: formData.shortDescription || '',
        description: formData.description || '',
        price: primaryPrice,
        compareAtPrice: primaryCompare,
        category: finalCategory,
        plantType: formData.plantType || (sectionFilter === 'plant-care' ? 'Plant Care & Nutrition' : 'Indoor Plants'),
        plantSize: primarySize,
        weightVolume: validVariants.length > 0 ? validVariants[0].size : formData.weightVolume,
        weightOptions: validVariants.map(v => v.size),
        variants: validVariants,
        lightRequirement: (formData.lightRequirement as any) || 'Bright Indirect Light',
        wateringFrequency: (formData.wateringFrequency as any) || 'Once a week',
        maintenanceLevel: (formData.maintenanceLevel as any) || 'Easy',
        location: (formData.location as any) || 'Living Room',
        indoorOutdoor: (formData.indoorOutdoor as any) || 'Indoor',
        petFriendly: Boolean(formData.petFriendly),
        featured: Boolean(formData.featured),
        stock: Number(formData.stock) || 0,
        images: images,
        tags: formData.tags || ['plant'],
        rating: editingProduct ? editingProduct.rating : 5.0,
        reviewCount: editingProduct ? editingProduct.reviewCount : 1,
        bestseller: Boolean(formData.bestseller),
        newArrival: Boolean(formData.newArrival),
        active: formData.active !== undefined ? formData.active : true,
        careInstructions: formData.careInstructions || {
          light: 'Bright indirect daylight',
          water: 'Water when topsoil is dry',
          temperature: '18°C – 32°C',
          fertilizer: 'Organic fertilizer monthly',
          tips: 'Wipe leaves periodically'
        },
        createdAt: editingProduct ? editingProduct.createdAt : Date.now(),
        updatedAt: Date.now(),
      };

      await saveProduct(productToSave);
      setIsModalOpen(false);
      onRefresh();
      setToastMsg(`Plant "${productToSave.name}" published live to storefront!`);
      setShowToast(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the product catalogue?`)) {
      await deleteProduct(id);
      onRefresh();
      setToastMsg(`Removed "${name}" from store catalogue.`);
      setShowToast(true);
    }
  };

  const handleDeleteAll = async () => {
    const count = products.length;
    if (count === 0) return;
    if (window.confirm(`⚠️ Are you sure you want to delete ALL ${count} products from the store? This will completely clear the inventory and cannot be undone.`)) {
      setIsSaving(true);
      try {
        await deleteAllProducts();
        onRefresh();
        setToastMsg(`Deleted all ${count} products from store catalogue.`);
        setShowToast(true);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleToggleActive = async (p: Product) => {
    await saveProduct({ ...p, active: !p.active, updatedAt: Date.now() });
    onRefresh();
  };

  const handleToggleBestseller = async (p: Product) => {
    await saveProduct({ ...p, bestseller: !p.bestseller, updatedAt: Date.now() });
    onRefresh();
  };

  // Filter by section and search
  const filteredProducts = products.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    const type = (p.plantType || '').toLowerCase();
    const name = (p.name || '').toLowerCase();

    // 1. Section matching
    if (sectionFilter === 'pots-planters') {
      const isPot = cat.includes('pot') || cat.includes('planter') || type.includes('pot') || type.includes('planter') || name.includes('pot') || name.includes('planter');
      if (!isPot) return false;
    } else if (sectionFilter === 'plant-care') {
      const isCare = cat.includes('care') || cat.includes('fertilizer') || cat.includes('soil') || type.includes('care') || type.includes('food') || type.includes('fertilizer') || name.includes('elixir') || name.includes('neem') || name.includes('fertilizer');
      if (!isCare) return false;
    } else if (sectionFilter === 'combos') {
      const isCombo = cat.includes('combo') || cat.includes('gift') || type.includes('combo') || type.includes('bundle') || name.includes('combo') || name.includes('bundle') || name.includes('trio');
      if (!isCombo) return false;
    } else if (sectionFilter === 'plants') {
      const isPot = cat.includes('pot') || cat.includes('planter') || type.includes('pot') || type.includes('planter') || name.includes('pot') || name.includes('planter');
      const isCare = cat.includes('care') || cat.includes('fertilizer') || cat.includes('soil') || type.includes('care') || type.includes('food') || type.includes('fertilizer') || name.includes('elixir') || name.includes('neem');
      const isCombo = cat.includes('combo') || cat.includes('gift') || type.includes('combo') || type.includes('bundle') || name.includes('combo') || name.includes('bundle') || name.includes('trio');
      if (isPot || isCare || isCombo) return false;
    }

    // 2. Search query matching
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Specific category dropdown filter
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const displayTitle =
    sectionTitle ||
    (sectionFilter === 'plants'
      ? 'Live Plants & Houseplants Catalog'
      : sectionFilter === 'pots-planters'
      ? 'Pots, Planters & Ceramics'
      : sectionFilter === 'plant-care'
      ? 'Plant Care & Organic Bio-Fertilizers'
      : sectionFilter === 'combos'
      ? 'Combos & Gift Packs'
      : 'Plant Catalogue & Inventory');

  const displayDesc =
    sectionDescription ||
    (sectionFilter === 'plants'
      ? 'Manage botanical live specimens, light tiers, watering frequency, and stock.'
      : sectionFilter === 'pots-planters'
      ? 'Manage self-watering pots, ceramic planters, terracotta, colors, and stock.'
      : sectionFilter === 'plant-care'
      ? 'Manage cold-pressed kelp, bio-fertilizers, neem sprays, and potting mixes.'
      : sectionFilter === 'combos'
      ? 'Manage bundled plant sets, festive gifts, and beginner green kits.'
      : 'Manage plant species, pricing, live stock, and care parameters.');

  const addBtnLabel =
    sectionFilter === 'plants'
      ? 'Add Live Plant'
      : sectionFilter === 'pots-planters'
      ? 'Add Planter / Pot'
      : sectionFilter === 'plant-care'
      ? 'Add Plant Care Item'
      : sectionFilter === 'combos'
      ? 'Add Combo / Gift Pack'
      : 'Add New Item';

  return (
    <div className="space-y-6">
      <AdminToastNotification
        show={showToast}
        message={toastMsg}
        onClose={() => setShowToast(false)}
        onViewStorefront={() => window.open('/plants', '_blank')}
      />

      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">{displayTitle}</h2>
            <span className="bg-[#EBF3EC] text-[#2D6A4F] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filteredProducts.length} Items
            </span>
          </div>
          <p className="text-xs text-[#5A5A5A] font-light mt-0.5">{displayDesc}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {products.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all rounded-md"
              title="Delete all products from store catalogue"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Clear All Products ({products.length})
            </button>
          )}
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all rounded-md shadow-xs"
          >
            <Plus className="w-4 h-4" />
            {addBtnLabel}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 border border-[#E5E2D9] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by plant name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#2D4A27]"
          />
          <Search className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-2.5" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-[#E5E2D9] text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E5E2D9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F2EB] text-[#5A5A5A] font-semibold border-b border-[#E5E2D9] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">{sectionFilter === 'plant-care' ? 'Plant Care Item' : sectionFilter === 'pots-planters' ? 'Planter' : 'Plant'}</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4 text-center">Bestseller</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2D9] text-[#1A1A1A]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#7A7A7A]">
                    No plants found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FDFCF9] transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <PlantImage
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 object-cover border border-[#E5E2D9]"
                      />
                      <div>
                        <span className="font-semibold text-[#1A1A1A] block">{p.name}</span>
                        <span className="text-[11px] text-[#7A7A7A]">{p.weightVolume || p.plantSize || 'Standard'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#5A5A5A] text-[11px]">{p.sku}</td>

                    <td className="py-3 px-4">
                      <span className="bg-[#F5F2EB] text-[#1A1A1A] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          p.stock === 0
                            ? 'text-rose-600 font-bold'
                            : p.stock <= 5
                            ? 'text-[#8B5E3C] font-bold'
                            : 'text-[#1A1A1A]'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleBestseller(p)}
                        className={`p-1.5 transition-colors ${
                          p.bestseller
                            ? 'bg-[#8B5E3C]/10 text-[#8B5E3C]'
                            : 'text-[#C5C2B9] hover:text-[#5A5A5A]'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${p.bestseller ? 'fill-[#8B5E3C] text-[#8B5E3C]' : ''}`} />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          p.active
                            ? 'bg-[#2D4A27]/10 text-[#2D4A27]'
                            : 'bg-[#E5E2D9] text-[#5A5A5A]'
                        }`}
                      >
                        {p.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-[#5A5A5A] hover:text-[#2D4A27] hover:bg-[#2D4A27]/5 transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-[#5A5A5A] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white text-[#1A1A1A] border border-[#E5E2D9] max-w-3xl w-full z-10 max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden" style={{ color: '#1A1A1A' }}>
            {/* Modal Sticky Header */}
            <div className="px-6 py-4 border-b border-[#E5E2D9] flex items-center justify-between shrink-0 bg-white sticky top-0 z-20">
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1A1A1A]">
                  {editingProduct ? 'Edit Botanical Specimen' : 'Add New Plant to Catalogue'}
                </h3>
                <p className="text-[11px] text-[#5A5A5A]">
                  Manage photos, pricing, inventory stock, and care requirements.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#7A7A7A] hover:text-[#1A1A1A] hover:bg-[#F5F2EB] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form id="product-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* SECTION 1: Basic Info & Pricing */}
              <div className="space-y-3 pb-4 border-b border-[#E5E2D9]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D4A27] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4A27] text-white flex items-center justify-center text-[10px]">1</span>
                  Basic Information & Pricing
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Plant Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fiddle Leaf Fig"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">SKU / Item Code</label>
                    <input
                      type="text"
                      placeholder="e.g. VB-FLF-01"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="499"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Original / Compare Price (₹)</label>
                    <input
                      type="number"
                      placeholder="699"
                      value={formData.compareAtPrice || ''}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Category *</label>
                    <select
                      value={formData.category || (sectionFilter === 'plant-care' ? 'plant-care' : 'indoor-plants')}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-medium focus:outline-none focus:border-[#2D4A27]"
                    >
                      {availableCategories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1A1A1A] mb-1">Available Stock Units</label>
                    <input
                      type="number"
                      value={formData.stock !== undefined ? formData.stock : 25}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>
                </div>

                {/* Ugaoo-style Size & Weight Variant Builder */}
                <div className="p-4 bg-[#F2F8F3] border border-[#BDE8C6] rounded-xl space-y-3.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#1F4522] flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#1F4522]" />
                        Size &amp; Pack Variants (Ugaoo-Style Cards)
                      </h4>
                      <p className="text-[11px] text-[#3D7142]">
                        Configure pack sizes (e.g. 1 KG, 3 KG, 5 KG, 10 KG), pricing, and rate subtitles. These display as interactive clickable cards on the product page!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="px-3 py-1.5 bg-[#1F4522] hover:bg-[#142F16] text-white text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 shadow-xs transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Variant
                    </button>
                  </div>

                  {/* Variants Table */}
                  <div className="overflow-x-auto bg-white rounded-lg border border-[#C5DAC3] shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#EAF5EC] text-[#1F4522] font-bold text-[10px] uppercase border-b border-[#C5DAC3]">
                        <tr>
                          <th className="py-2.5 px-3">Size / Pack (e.g. 1 KG, 3 KG)</th>
                          <th className="py-2.5 px-3">Price (₹)</th>
                          <th className="py-2.5 px-3">Compare MRP (₹)</th>
                          <th className="py-2.5 px-3">Subtitle (e.g. ₹70/kg)</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E2D9]">
                        {formVariants.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-[#7A7A7A] text-[11px]">
                              No custom variants added. Click below to add 1 KG, 3 KG, 5 KG, etc.
                            </td>
                          </tr>
                        ) : (
                          formVariants.map((v, idx) => (
                            <tr key={idx} className="hover:bg-[#FAFDFB]">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={v.size}
                                  onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                                  placeholder="e.g. 3 KG"
                                  className="w-24 px-2 py-1 border border-[#DDD9CF] rounded text-xs font-bold text-[#141414]"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                                  placeholder="199"
                                  className="w-24 px-2 py-1 border border-[#DDD9CF] rounded text-xs font-bold text-[#1F4522]"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={v.compareAtPrice || ''}
                                  onChange={(e) => handleUpdateVariant(idx, 'compareAtPrice', Number(e.target.value))}
                                  placeholder="299"
                                  className="w-24 px-2 py-1 border border-[#DDD9CF] rounded text-xs text-[#7A7A7A]"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={v.unitRate || ''}
                                  onChange={(e) => handleUpdateVariant(idx, 'unitRate', e.target.value)}
                                  placeholder="e.g. (₹70/kg)"
                                  className="w-28 px-2 py-1 border border-[#DDD9CF] rounded text-xs text-[#555555]"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantRow(idx)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Delete variant"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Fast One-Click Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[#3D7142] uppercase mr-1">One-Click Presets:</span>
                    {['1 KG', '3 KG', '5 KG', '10 KG', '500 GM', '250 ML', '500 ML', '1 L'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddPresetVariant(preset)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white text-[#1F4522] border border-[#BDE8C6] hover:bg-[#DCEDDA] rounded-md transition-colors shadow-2xs"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Architectural statement foliage with lush violin-shaped leaves."
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
              </div>

              {/* SECTION 2: Plant Photos */}
              <div className="space-y-3 pb-4 border-b border-[#E5E2D9]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D4A27] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#2D4A27] text-white flex items-center justify-center text-[10px]">2</span>
                  Plant Photos & Gallery
                </h4>
                <PlantImageUploader images={productImages} onChange={setProductImages} />
              </div>

              {/* SECTION 3: Plant Care & Badges */}
              <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-[10px]">3</span>
                  Plant Care & Store Highlights
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5A5A5A] mb-1">Light Requirement</label>
                    <input
                      type="text"
                      value={formData.lightRequirement || 'Bright Indirect Light'}
                      onChange={(e) => setFormData({ ...formData, lightRequirement: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] text-xs text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5A5A5A] mb-1">Watering</label>
                    <input
                      type="text"
                      value={formData.wateringFrequency || 'Once a week'}
                      onChange={(e) => setFormData({ ...formData, wateringFrequency: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] text-xs text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5A5A5A] mb-1">Best Location</label>
                    <input
                      type="text"
                      value={formData.location || 'Living Room'}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] text-xs text-[#1A1A1A]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2 border-t border-[#E5E2D9]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.petFriendly || false}
                      onChange={(e) => setFormData({ ...formData, petFriendly: e.target.checked })}
                      className="w-4 h-4 rounded text-[#2D4A27]"
                    />
                    <span className="font-medium text-[#1A1A1A]">Pet Friendly</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bestseller || false}
                      onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                      className="w-4 h-4 rounded text-[#2D4A27]"
                    />
                    <span className="font-medium text-[#1A1A1A]">Mark as Bestseller</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.newArrival !== false}
                      onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })}
                      className="w-4 h-4 rounded text-[#2D4A27]"
                    />
                    <span className="font-medium text-[#1A1A1A]">New Arrival</span>
                  </label>
                </div>
              </div>

            </form>

            {/* Sticky Action Footer */}
            <div className="px-6 py-3.5 bg-[#FAF9F5] border-t border-[#E5E2D9] flex items-center justify-end gap-3 shrink-0 sticky bottom-0 z-20">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-[#5A5A5A] hover:bg-[#F5F2EB] font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs rounded-lg disabled:opacity-50"
              >
                {isSaving ? (
                  'Saving Plant...'
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Plant to Catalogue
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
