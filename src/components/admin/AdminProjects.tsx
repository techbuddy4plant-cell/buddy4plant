import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  Trees,
  Check
} from 'lucide-react';
import { BotanicalProject } from '../../types';
import { getProjects, saveProject, deleteProject } from '../../services/projectService';
import { PlantImage, PLANT_FALLBACK_IMAGES } from '../../utils/imageFallback';

interface AdminProjectsProps {
  onRefresh?: () => void;
}

const SAMPLE_PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1599598425947-320d43702580?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
];

const CATEGORY_PRESETS = [
  'Residential Balcony',
  'Corporate Green Interior',
  'Rooftop Terrace',
  'Villa Courtyard',
  'Hospitality Greenery',
  'Vertical Garden',
];

export const AdminProjects: React.FC<AdminProjectsProps> = ({ onRefresh }) => {
  const [projects, setProjects] = useState<BotanicalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<BotanicalProject | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [speciesCount, setSpeciesCount] = useState(20);
  const [plantHighlights, setPlantHighlights] = useState('');
  const [tag, setTag] = useState('Completed Project');
  const [area, setArea] = useState('');
  const [duration, setDuration] = useState('');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    const handleDataChanged = () => {
      fetchProjects();
    };
    window.addEventListener('b4p_store_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('b4p_store_data_changed', handleDataChanged);
    };
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setLocation('Bengaluru, Karnataka');
    setCategory('Residential Balcony');
    setImage(SAMPLE_PROJECT_IMAGES[0]);
    setDescription('');
    setSpeciesCount(25);
    setPlantHighlights('Monstera Deliciosa, Fiddle Leaf Fig, Areca Palm, Organic Kelp Fed Soil');
    setTag('Completed Project');
    setArea('180 sq. ft');
    setDuration('2 Weeks');
    setFeatured(true);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: BotanicalProject) => {
    setEditingProject(p);
    setTitle(p.title);
    setLocation(p.location);
    setCategory(p.category);
    setImage(p.image);
    setDescription(p.description);
    setSpeciesCount(p.speciesCount || 10);
    setPlantHighlights(p.plantHighlights?.join(', ') || '');
    setTag(p.tag || 'Completed Project');
    setArea(p.area || '');
    setDuration(p.duration || '');
    setFeatured(p.featured ?? true);
    setActive(p.active ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const highlightsList = plantHighlights
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const projectData: BotanicalProject = {
      id: editingProject ? editingProject.id : `proj_${Date.now()}`,
      title: title.trim(),
      location: location.trim() || 'Pan-India',
      category: category.trim() || 'Botanical Space',
      image: image.trim() || SAMPLE_PROJECT_IMAGES[0],
      description: description.trim(),
      speciesCount: Number(speciesCount) || 10,
      plantHighlights: highlightsList,
      tag: tag.trim() || 'Completed Project',
      area: area.trim(),
      duration: duration.trim(),
      featured,
      active,
    };

    await saveProject(projectData);
    setIsModalOpen(false);
    fetchProjects();
    onRefresh?.();
  };

  const handleDelete = async (id: string, projTitle: string) => {
    if (window.confirm(`Are you sure you want to delete project "${projTitle}"?`)) {
      await deleteProject(id);
      fetchProjects();
      onRefresh?.();
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">
              Landscaping &amp; Botanical Projects
            </h2>
            <span className="bg-[#EBF3EC] text-[#2D6A4F] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {projects.length} Showcases
            </span>
          </div>
          <p className="text-xs text-[#5A5A5A] font-light mt-0.5">
            Manage your custom balcony transformations, biophilic office spaces, and terrace case studies.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all self-start sm:self-auto rounded-md shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Add New Project
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E5E2D9] flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by title, location or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
          />
          <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-[#8A8A8A] hover:text-[#1A1A1A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#1F3B22] text-white'
                : 'bg-[#F2EFEB] text-[#5A5A5A] hover:bg-[#E5E2D9]'
            }`}
          >
            All Projects
          </button>
          {CATEGORY_PRESETS.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#1F3B22] text-white'
                  : 'bg-[#F2EFEB] text-[#5A5A5A] hover:bg-[#E5E2D9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6A7B6B] font-medium">
          Loading project showcases...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white border border-[#E5E2D9] rounded-2xl p-12 text-center">
          <Trees className="w-12 h-12 text-[#A3B899] mx-auto mb-3" />
          <h3 className="font-serif font-bold text-base text-[#1A1A1A]">No projects found</h3>
          <p className="text-xs text-[#6A7B6B] mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No projects match "${searchQuery}". Try clearing search.`
              : 'Add your first biophilic transformation or balcony project.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-[#2D4A27] text-white text-xs font-bold uppercase tracking-wider rounded-lg"
          >
            Create Project Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#E5E2D9] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Image & Badge */}
              <div className="relative aspect-video w-full bg-[#F5F2EB] overflow-hidden group">
                <PlantImage
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                    {p.category}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.active !== false
                        ? 'bg-[#1F3B22] text-emerald-200'
                        : 'bg-[#E5E2D9] text-[#6A7B6B]'
                    }`}
                  >
                    {p.active !== false ? 'Live on Site' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-[#2D6A4F] font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{p.location}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#1A1A1A] leading-snug">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#5A5A5A] font-light line-clamp-2 mt-2">
                    {p.description}
                  </p>

                  {/* Highlights & Stats */}
                  <div className="mt-3.5 pt-3 border-t border-[#F0ECE1] flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#1F3B22] flex items-center gap-1">
                      🌿 {p.speciesCount} Flora Species
                    </span>
                    {p.area && (
                      <span className="text-[#6A7B6B] font-medium bg-[#F5F2EB] px-2 py-0.5 rounded">
                        {p.area}
                      </span>
                    )}
                  </div>

                  {p.plantHighlights && p.plantHighlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {p.plantHighlights.slice(0, 3).map((h, i) => (
                        <span
                          key={i}
                          className="bg-[#FAF8F5] border border-[#EBE7DD] text-[#3B4E38] px-2 py-0.5 rounded text-[10px] font-medium"
                        >
                          {h}
                        </span>
                      ))}
                      {p.plantHighlights.length > 3 && (
                        <span className="text-[10px] text-[#7A7A7A] self-center">
                          +{p.plantHighlights.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-[#E5E2D9] flex items-center justify-between">
                  <span className="text-[10px] text-[#7A7A7A] uppercase font-bold tracking-wider">
                    {p.tag}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-[#5A5A5A] hover:text-[#1F3B22] hover:bg-[#F5F2EB] rounded transition-colors"
                      title="Edit project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-1.5 text-[#5A5A5A] hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responsive Edit/Create Modal (Fits on Screen with Sticky Header/Footer) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0F1710]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white border border-[#E5E2D9] max-w-xl w-full rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden animate-fadeIn my-auto">
            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-[#E5E2D9] flex items-center justify-between bg-[#FCFBF8] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EBF3EC] text-[#1F3B22] flex items-center justify-center font-bold">
                  <Trees className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1A1A] leading-none">
                    {editingProject ? 'Edit Botanical Project' : 'Create New Project Showcase'}
                  </h3>
                  <p className="text-[11px] text-[#6A7B6B] mt-0.5">
                    Updates live immediately on homepage and /projects page.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#6A7B6B] hover:text-[#1A1A1A] hover:bg-[#F2EFEB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="project-edit-form"
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
            >
              {/* Project Title */}
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Urban Balcony Sanctuary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] focus:ring-1 focus:ring-[#2D4A27]"
                />
              </div>

              {/* Grid 2 cols: Location & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar, Bengaluru"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">
                    Category Type *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Residential Balcony"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
              </div>

              {/* Quick Category Suggestion Chips */}
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-[#7A7A7A] font-semibold mr-1">Quick Select:</span>
                {CATEGORY_PRESETS.map((cat, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                      category === cat
                        ? 'bg-[#1F3B22] text-white border-[#1F3B22]'
                        : 'bg-[#FAF8F5] text-[#4A4A4A] border-[#E0DCD3] hover:border-[#1F3B22]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Cover Photo */}
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">
                  Project Cover Photo
                </label>

                {/* Compact Preview Thumbnail */}
                {image && (
                  <div className="relative aspect-video max-h-36 w-full bg-[#F5F2EB] border border-[#E5E2D9] rounded-lg mb-2 overflow-hidden">
                    <PlantImage
                      src={image}
                      alt="Project preview"
                      className="w-full h-full object-cover"
                    />
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
                    <span className="text-[10px] text-[#7A7A7A] block mb-1 font-semibold">
                      Sample Architecture Photos:
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {SAMPLE_PROJECT_IMAGES.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImage(imgUrl)}
                          className={`aspect-square rounded border overflow-hidden transition-all ${
                            image === imgUrl
                              ? 'border-[#2D4A27] ring-2 ring-[#2D4A27]'
                              : 'border-[#E5E2D9]'
                          }`}
                        >
                          <PlantImage
                            src={imgUrl}
                            alt={`Preset ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">
                  Project Case Study Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain what the client needed, before/after details, lighting setup, and plant care routine..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              {/* Grid 3 cols: Species Count, Area, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">
                    Species Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={speciesCount}
                    onChange={(e) => setSpeciesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">
                    Area / Dimensions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 150 sq. ft"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Weeks"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                  />
                </div>
              </div>

              {/* Plant Highlights */}
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">
                  Plant Highlights &amp; Care (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monstera Deliciosa, Fiddle Leaf Fig, Self-Watering Pots, Kelp Fed Soil"
                  value={plantHighlights}
                  onChange={(e) => setPlantHighlights(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              {/* Project Tag */}
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">
                  Status Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Completed Project, Featured Case Study"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5D2C9] rounded-lg text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>

              {/* Checkbox Toggles */}
              <div className="pt-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2D4A27] focus:ring-[#2D4A27]"
                  />
                  <span className="font-semibold text-[#1A1A1A]">Publish on Live Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2D4A27] focus:ring-[#2D4A27]"
                  />
                  <span className="font-semibold text-[#1A1A1A]">Feature on Homepage Showcase</span>
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
                form="project-edit-form"
                className="px-6 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
