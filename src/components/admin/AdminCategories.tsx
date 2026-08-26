import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon } from 'lucide-react';
import { Category } from '../../types';
import { saveCategory, deleteCategory } from '../../services/categoryService';
import { PlantImage } from '../../utils/imageFallback';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Botanical Collections & Categories</h2>
          <p className="text-xs text-[#5A5A5A] font-light">Organize plants by living space, light tier, and species families.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Collection
        </button>
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

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white border border-[#E5E2D9] max-w-md w-full p-6 z-10">
            <h3 className="font-serif font-bold text-lg text-[#1A1A1A] mb-4">
              {editingCategory ? 'Edit Collection' : 'Create New Collection'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Collection Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rare Foliage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="rare-foliage"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Sub-Categories (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Monsteras, Philodendrons, Alocasias"
                  value={subCategories}
                  onChange={(e) => setSubCategories(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2D4A27]"
                  />
                  <span className="font-medium text-[#1A1A1A]">Display in store navigation</span>
                </label>
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
                  className="px-5 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
