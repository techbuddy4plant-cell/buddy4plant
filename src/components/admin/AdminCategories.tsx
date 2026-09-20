import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon, Upload, Sparkles } from 'lucide-react';
import { Category } from '../../types';
import { saveCategory, deleteCategory, deleteAllCategories } from '../../services/categoryService';
import { PlantImage, PLANT_FALLBACK_IMAGES } from '../../utils/imageFallback';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [subCategories, setSubCategories] = useState('');
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80');
    setSubCategories('Living Room, Work Desk, Air Purifiers');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description);
    setImage(c.image);
    setSubCategories(c.subCategories?.join(', ') || '');
    setActive(c.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const subList = subCategories.split(',').map((s) => s.trim()).filter(Boolean);

    const catObj: Category = {
      id: editingCategory ? editingCategory.id : `cat_${Date.now()}`,
      name,
      slug: finalSlug,
      description,
      image: image || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
      subCategories: subList,
      featured: editingCategory ? editingCategory.featured : false,
      order: editingCategory ? editingCategory.order : 1,
      active,
    };

    await saveCategory(catObj);
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = async (id: string, catName: string) => {
    if (window.confirm(`Delete category "${catName}"?`)) {
      await deleteCategory(id);
      onRefresh();
    }
  };

  const handleDeleteAll = async () => {
    const count = categories.length;
    if (count === 0) return;
    if (window.confirm(`⚠️ Are you sure you want to delete ALL ${count} collections? This cannot be undone.`)) {
      await deleteAllCategories();
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Botanical Collections & Categories</h2>
          <p className="text-xs text-[#5A5A5A] font-light">Organize plants by living space, light tier, and species families.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {categories.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all rounded-md"
              title="Delete all categories"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Clear All ({categories.length})
            </button>
          )}
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all rounded-md shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add New Collection
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-[#E5E2D9] overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-video w-full bg-[#F5F2EB]">
              <PlantImage src={c.image} alt={c.name} className="w-full h-full object-cover" />
              <div className="absolute top-2.5 right-2.5">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    c.active ? 'bg-[#2D4A27] text-white' : 'bg-[#E5E2D9] text-[#5A5A5A]'
                  }`}
                >
                  {c.active ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1A1A1A]">{c.name}</h3>
                <span className="text-[11px] font-mono text-[#7A7A7A] block mb-2">/plants/{c.slug}</span>
                <p className="text-xs text-[#5A5A5A] font-light line-clamp-2">{c.description}</p>
                {c.subCategories && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {c.subCategories.map((s, idx) => (
                      <span key={idx} className="bg-[#F5F2EB] text-[#1A1A1A] px-2 py-0.5 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(c)}
                  className="p-1.5 text-[#5A5A5A] hover:text-[#2D4A27]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-1.5 text-[#5A5A5A] hover:text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Responsive Category Modal (Auto-fits screen height) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0F1710]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white border border-[#E5E2D9] max-w-lg w-full rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-fadeIn my-auto">
            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-[#E5E2D9] flex items-center justify-between bg-[#FCFBF8] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3EC] text-[#1F3B22] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1A1A] leading-none">
                    {editingCategory ? 'Edit Collection' : 'Create New Collection'}
                  </h3>
                  <p className="text-[11px] text-[#6A7B6B] mt-0.5">
                    Updates reflect in the storefront navigation and catalogue filters.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#6A7B6B] hover:text-[#1A1A1A] hover:bg-[#F2EFEB] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="category-edit-form"
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Collection Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rare Foliage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] focus:ring-1 focus:ring-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="rare-foliage"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of what species or plants belong in this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Collection Cover Photo</label>

                {/* Compact Preview Thumbnail */}
                {image && (
                  <div className="relative aspect-video max-h-36 w-full bg-[#F5F2EB] border border-[#E5E2D9] rounded-lg mb-2 overflow-hidden">
                    <PlantImage src={image} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
                    />
                    <label className="px-3 py-1.5 bg-[#2D4A27]/10 hover:bg-[#2D4A27]/20 text-[#2D4A27] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) setImage(ev.target.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Preset quick picks */}
                  <div>
                    <span className="text-[10px] text-[#7A7A7A] block mb-1 font-semibold">OR Choose Sample Cover:</span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {PLANT_FALLBACK_IMAGES.slice(0, 5).map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImage(imgUrl)}
                          className={`aspect-square rounded border overflow-hidden transition-all ${
                            image === imgUrl ? 'border-[#2D4A27] ring-2 ring-[#2D4A27]' : 'border-[#E5E2D9]'
                          }`}
                        >
                          <PlantImage src={imgUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Sub-Categories (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Monsteras, Philodendrons, Alocasias"
                  value={subCategories}
                  onChange={(e) => setSubCategories(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2D4A27] focus:ring-[#2D4A27]"
                  />
                  <span className="font-semibold text-[#1A1A1A]">Display in store navigation &amp; filters</span>
                </label>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="px-6 py-3.5 border-t border-[#E5E2D9] bg-[#FAF9F5] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-[#5A5A5A] hover:bg-[#EAE7DF] rounded-lg transition-colors font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="category-edit-form"
                className="px-6 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
              >
                Save Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
