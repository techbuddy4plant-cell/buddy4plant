import React, { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Star, Image as ImageIcon, Link as LinkIcon, Check, Sparkles } from 'lucide-react';
import { PLANT_FALLBACK_IMAGES, PlantImage } from '../../utils/imageFallback';

interface PlantImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

// Curated categorized plant photos for 1-click selection
const PRESET_GALLERY = [
  {
    category: 'Indoor Foliage',
    photos: [
      { name: 'Peace Lily / Monstera', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80' },
      { name: 'Snake Plant (Sansevieria)', url: 'https://images.unsplash.com/photo-1599598425947-320d43702580?auto=format&fit=crop&w=800&q=80' },
      { name: 'Golden Pothos / Vine', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80' },
      { name: 'Monstera Deliciosa', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80' },
      { name: 'ZZ Plant (Zamioculcas)', url: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=800&q=80' },
    ],
  },
  {
    category: 'Palms & Tropical',
    photos: [
      { name: 'Areca Palm', url: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80' },
      { name: 'Terracotta Potted Plant', url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nursery Greenery', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80' },
    ],
  },
  {
    category: 'Succulents & Small',
    photos: [
      { name: 'Jade Succulent', url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80' },
      { name: 'Aglaonema Pink / Red', url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=800&q=80' },
      { name: 'Potted Succulent Desk', url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80' },
    ],
  },
];

export const PlantImageUploader: React.FC<PlantImageUploaderProps> = ({ images, onChange }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const newImages: string[] = [...images];

    fileList.forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const dataUrl = event.target.result as string;
            onChange([...newImages, dataUrl]);
            newImages.push(dataUrl);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddUrl = () => {
    setUrlError(null);
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('data:image/')) {
      setUrlError('Please enter a valid image URL starting with http:// or https://');
      return;
    }

    onChange([...images, cleanUrl]);
    setUrlInput('');
  };

  const handleSelectPreset = (photoUrl: string) => {
    if (images.includes(photoUrl)) return;
    onChange([...images, photoUrl]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-[#1A1A1A] text-xs">
          Plant Photos <span className="text-[#7A7A7A] font-normal">({images.length} added)</span>
        </label>
        <span className="text-[11px] text-[#2D4A27] font-medium">First image is the main cover photo</span>
      </div>

      {/* Selected Photos Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F9F8F5] border border-[#E5E2D9]">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative group aspect-square bg-white border ${
                idx === 0 ? 'border-[#2D4A27] ring-2 ring-[#2D4A27]/20' : 'border-[#E5E2D9]'
              } overflow-hidden shadow-xs`}
            >
              <PlantImage src={img} alt={`Plant photo ${idx + 1}`} className="w-full h-full object-cover" />

              {/* Cover badge */}
              {idx === 0 ? (
                <div className="absolute top-1.5 left-1.5 bg-[#2D4A27] text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 flex items-center gap-1 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  Main Cover
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleMakeCover(idx)}
                  className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 bg-[#1A1A1A]/80 hover:bg-[#2D4A27] text-white text-[9px] font-semibold px-1.5 py-0.5 transition-all"
                  title="Make this the main cover image"
                >
                  Set as Cover
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-xs transition-opacity shadow-xs"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="absolute bottom-1 right-1 bg-[#1A1A1A]/60 text-white text-[9px] font-mono px-1 py-0.5">
                #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Photo Tabs & Widget */}
      <div className="border border-[#E5E2D9] bg-white overflow-hidden">
        <div className="flex border-b border-[#E5E2D9] bg-[#F5F2EB]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#2D4A27] text-[#2D4A27] bg-white'
                : 'border-transparent text-[#5A5A5A] hover:text-[#1A1A1A]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Photo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'preset'
                ? 'border-[#2D4A27] text-[#2D4A27] bg-white'
                : 'border-transparent text-[#5A5A5A] hover:text-[#1A1A1A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
            Preset Library
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-[#2D4A27] text-[#2D4A27] bg-white'
                : 'border-transparent text-[#5A5A5A] hover:text-[#1A1A1A]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Paste Web URL
          </button>
        </div>

        <div className="p-4">
          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="text-center py-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="admin-plant-file-input"
              />
              <label
                htmlFor="admin-plant-file-input"
                className="inline-flex flex-col items-center justify-center px-6 py-5 border-2 border-dashed border-[#2D4A27]/30 hover:border-[#2D4A27] bg-[#2D4A27]/5 hover:bg-[#2D4A27]/10 cursor-pointer transition-colors w-full"
              >
                <Upload className="w-6 h-6 text-[#2D4A27] mb-2" />
                <span className="text-xs font-bold text-[#1A1A1A]">Click to choose plant photos from device</span>
                <span className="text-[11px] text-[#5A5A5A] mt-1">PNG, JPG, WEBP formats supported (select multiple)</span>
              </label>
            </div>
          )}

          {/* TAB 2: Preset Botanical Library */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <p className="text-[11px] text-[#5A5A5A]">
                Click any high-resolution botanical photo below to add it to your plant:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
                {PRESET_GALLERY.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#7A7A7A] uppercase tracking-wider block">
                      {group.category}
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {group.photos.map((item, pIdx) => {
                        const isSelected = images.includes(item.url);
                        return (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSelectPreset(item.url)}
                            className={`relative aspect-square border overflow-hidden transition-all text-left ${
                              isSelected ? 'border-[#2D4A27] ring-2 ring-[#2D4A27]' : 'border-[#E5E2D9] hover:border-[#2D4A27]'
                            }`}
                          >
                            <PlantImage src={item.url} alt={item.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#2D4A27]/40 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-[#1A1A1A]/80 text-white text-[8px] p-0.5 truncate text-center">
                              {item.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Paste URL */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-[#5A5A5A]">
                Enter direct image web link (e.g. Unsplash, Imgur, CDN):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#E5E2D9] text-xs font-mono focus:outline-none focus:border-[#2D4A27]"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-4 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Photo
                </button>
              </div>
              {urlError && <p className="text-[11px] text-rose-600 font-medium">{urlError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
