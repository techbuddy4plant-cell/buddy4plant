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
  Sparkles
} from 'lucide-react';
import { Product, Category } from '../../types';
import { saveProduct, deleteProduct } from '../../services/productService';
import { PlantImage } from '../../utils/imageFallback';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [imageUrlInput, setImageUrlInput] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({ ...p });
    setImageUrlInput(p.images.join(', '));
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
      const images = imageUrlInput.trim()
        ? imageUrlInput.split(',').map((url) => url.trim()).filter(Boolean)
        : formData.images || [];

      const productToSave: Product = {
        id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
        name: formData.name,
        slug,
        sku: formData.sku || 'VB-100',
        shortDescription: formData.shortDescription || '',
        description: formData.description || '',
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        category: formData.category || 'indoor-plants',
        plantType: formData.plantType || 'Indoor Plants',
        plantSize: (formData.plantSize as any) || 'Medium (9-15")',
        lightRequirement: (formData.lightRequirement as any) || 'Bright Indirect Light',
        wateringFrequency: (formData.wateringFrequency as any) || 'Once a week',
        maintenanceLevel: (formData.maintenanceLevel as any) || 'Easy',
        location: (formData.location as any) || 'Living Room',
        indoorOutdoor: (formData.indoorOutdoor as any) || 'Indoor',
        petFriendly: Boolean(formData.petFriendly),
        featured: Boolean(formData.featured),
        stock: Number(formData.stock) || 0,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'],
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

  // Filter and search
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Plant Catalogue & Inventory</h2>
          <p className="text-xs text-[#5A5A5A] font-light">Manage plant species, pricing, live stock, and care parameters.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Plant
        </button>
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
                <th className="py-3.5 px-4">Plant</th>
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
                        <span className="text-[11px] text-[#7A7A7A]">{p.plantSize}</span>
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

          <div className="relative bg-white border border-[#E5E2D9] max-w-2xl w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#7A7A7A] hover:text-[#1A1A1A]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-[#1A1A1A] mb-4">
              {editingProduct ? 'Edit Botanical Specimen' : 'Add New Plant to Catalogue'}
            </h3>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Plant Common Name *</label>
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
                  <label className="block font-semibold text-[#1A1A1A] mb-1">SKU / Code</label>
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
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Compare at Price (₹)</label>
                  <input
                    type="number"
                    value={formData.compareAtPrice || ''}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Category</label>
                  <select
                    value={formData.category || 'indoor-plants'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-medium focus:outline-none focus:border-[#2D4A27]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Live Stock Units</label>
                  <input
                    type="number"
                    value={formData.stock !== undefined ? formData.stock : 20}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
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

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Image URLs (comma separated)</label>
                <textarea
                  rows={2}
                  placeholder="https://images.unsplash.com/... , https://images.unsplash.com/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              {/* Botanical Care Specs */}
              <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] space-y-3">
                <span className="font-bold text-[#1A1A1A] block">Botanical Specs & Care</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5A5A5A] mb-1">Light</label>
                    <input
                      type="text"
                      value={formData.lightRequirement || 'Bright Indirect Light'}
                      onChange={(e) => setFormData({ ...formData, lightRequirement: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] text-xs text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5A5A5A] mb-1">Water</label>
                    <input
                      type="text"
                      value={formData.wateringFrequency || 'Once a week'}
                      onChange={(e) => setFormData({ ...formData, wateringFrequency: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] text-xs text-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5A5A5A] mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location || 'Living Room'}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] text-xs text-[#1A1A1A]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
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
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#5A5A5A] hover:bg-[#F5F2EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider"
                >
                  {isSaving ? 'Saving...' : 'Save Botanical Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
