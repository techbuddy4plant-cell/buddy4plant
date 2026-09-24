import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  Upload,
  Palette,
  Image as ImageIcon,
  ShieldCheck,
  Star,
  Type,
  ExternalLink,
  RotateCcw,
  Compass,
  MessageCircle,
  Briefcase,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { HomepageCMS } from '../../types';
import { INITIAL_HOMEPAGE_CMS } from '../../data/initialSettings';
import { useStoreSettings, calculateLuminance, getAutoTextColor } from '../../context/StoreSettingsContext';
import { PlantImage } from '../../utils/imageFallback';
import { AdminToastNotification } from './AdminToastNotification';

const HERO_WALLPAPER_PRESETS = [
  { name: 'Kyari Living Plants (Default)', url: '/editorial/kyari-living-plants-hero.jpg' },
  { name: 'Artisanal Botanical Jar', url: '/editorial/hero-botanical-branch.jpg' },
  { name: 'Botanica Stone Slab', url: '/editorial/botanica-stone-slab.jpg' },
  { name: 'Light Botanical Haven', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Lush Monstera Wall', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Modern Plant Shelf', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Balcony Sanctuary', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=85' },
];

const SITE_BACKGROUND_PRESETS = [
  { name: 'Botanical Cream (Default)', color: '#FDFCF9', preview: '#FDFCF9' },
  { name: 'Minimal Pure White', color: '#FFFFFF', preview: '#FFFFFF' },
  { name: 'Soft Sage Green', color: '#F4F7F2', preview: '#F4F7F2' },
  { name: 'Warm Terracotta Sand', color: '#FAF4EE', preview: '#FAF4EE' },
  { name: 'Dark Luxury Forest', color: '#182319', preview: '#182319' },
  { name: 'Midnight Charcoal', color: '#111827', preview: '#111827' },
];

const TEXT_COLOR_PRESETS = [
  { name: 'Charcoal Black', hex: '#1A1A1A' },
  { name: 'Crisp White', hex: '#FFFFFF' },
  { name: 'Soft Pearl', hex: '#F3F4F6' },
  { name: 'Muted Forest Mist', hex: '#D6E2D5' },
  { name: 'Warm Cream', hex: '#F7F5EE' },
  { name: 'Botanical Gold', hex: '#D4AF37' },
];

const PRIMARY_COLOR_PRESETS = [
  { name: 'Botanical Emerald', hex: '#2D4A27' },
  { name: 'Earthy Terracotta', hex: '#8B5E3C' },
  { name: 'Midnight Charcoal', hex: '#1A1A1A' },
  { name: 'Warm Olive', hex: '#4A5D36' },
  { name: 'Deep Forest', hex: '#0D5C3A' },
];

export const AdminCMS: React.FC = () => {
  const { homepageCMS, updateHomepageCMS, settings, updateStoreSettings } = useStoreSettings();
  const [formData, setFormData] = useState<HomepageCMS>({
    ...INITIAL_HOMEPAGE_CMS,
    ...homepageCMS,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('Storefront custom design & homepage content published live!');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setFormData({
      ...INITIAL_HOMEPAGE_CMS,
      ...homepageCMS,
    });
  }, [homepageCMS]);

  const currentBg = formData.siteBackground || '#FDFCF9';
  const autoComputedText = getAutoTextColor(currentBg);
  const currentText =
    formData.siteTextColor && formData.siteTextColor !== 'auto'
      ? formData.siteTextColor
      : autoComputedText;
  const isAutoText = !formData.siteTextColor || formData.siteTextColor === 'auto';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Homepage CMS
      await updateHomepageCMS(formData);

      // 2. Also sync top announcement text to store settings so ticker updates
      if (formData.announcementText) {
        await updateStoreSettings({
          ...settings,
          announcementBarText: formData.announcementText,
          announcementBarActive: true,
        });
      }

      setToastMsg('Published Live! All storefront details and sections updated successfully.');
      setShowToast(true);
    } catch (err) {
      console.error('Error saving CMS:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all storefront sections and text back to original buddy4plant defaults?')) {
      setFormData({ ...INITIAL_HOMEPAGE_CMS });
    }
  };

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFormData((prev) => ({ ...prev, heroImage: ev.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFormData((prev) => ({ ...prev, siteBackground: ev.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AdminToastNotification
        show={showToast}
        message={toastMsg}
        onClose={() => setShowToast(false)}
        onViewStorefront={() => window.open('/', '_blank')}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-[#E5E2D9] rounded-lg">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A] flex items-center gap-2">
            <span>🏠</span>
            Storefront Merchandising &amp; Live Section Editor
          </h2>
          <p className="text-xs text-[#5A5A5A] font-light mt-0.5">
            Every section, banner, headline, trust badge, and description on the storefront is fully customizable below.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-2 bg-[#F5F2EB] hover:bg-[#EAE5D9] text-[#1A1A1A] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors border border-[#D5CFC2]"
            title="Restore original storefront text defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5A5A5A]" />
            Reset Defaults
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
            View Storefront
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 border border-[#E5E2D9] space-y-8 text-xs rounded-lg shadow-xs">
        
        {/* SECTION 1: Top Announcement Bar */}
        <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] space-y-3 rounded-lg">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <span>📢</span>
            1. Top Storefront Announcement Bar Message
          </h3>
          <p className="text-[#5A5A5A] text-[11px]">
            Displays at the very top of every storefront page in an animated ticker.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Announcement Message *</label>
              <input
                type="text"
                placeholder="e.g. Welcome to buddy4plant: Free Ceramic Pot with Orders above ₹1,499!"
                value={formData.announcementText || ''}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-medium focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Target Link / Path</label>
              <input
                type="text"
                value={formData.announcementLink || '/plants'}
                onChange={(e) => setFormData({ ...formData, announcementLink: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Custom Site Background & Theme Colors */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#2D4A27]" />
            2. Custom Site Background &amp; Theme Colors
          </h3>
          <p className="text-[#5A5A5A] text-[11px]">Customize store background style and primary brand colors.</p>

          <div>
            <span className="font-bold text-[#1A1A1A] block mb-2">Choose Site Background Preset:</span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {SITE_BACKGROUND_PRESETS.map((preset, idx) => {
                const isSelected = formData.siteBackground === preset.color;
                const isDarkPreset = preset.color === '#182319' || preset.color === '#111827';
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, siteBackground: preset.color })}
                    className={`p-3 border text-left transition-all flex flex-col items-center justify-between h-20 rounded ${
                      isSelected
                        ? 'border-[#2D4A27] ring-2 ring-[#2D4A27]/20 shadow-xs'
                        : 'border-[#E5E2D9] hover:border-[#2D4A27]'
                    }`}
                    style={{ backgroundColor: preset.preview }}
                  >
                    <span className={`text-[10px] font-bold text-center ${isDarkPreset ? 'text-white' : 'text-[#1A1A1A]'}`}>
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="bg-[#2D4A27] text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-xs">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1">
              <label className="block font-semibold text-[#1A1A1A] mb-1">Custom Background URL or Hex</label>
              <input
                type="text"
                value={formData.siteBackground || ''}
                onChange={(e) => setFormData({ ...formData, siteBackground: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div className="self-end">
              <label className="px-4 py-2 bg-[#2D4A27]/10 hover:bg-[#2D4A27]/20 text-[#2D4A27] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-[#2D4A27]/30 rounded">
                <Upload className="w-3.5 h-3.5" />
                Upload Background File
                <input type="file" accept="image/*" className="hidden" onChange={handleBgFileUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: Hero Banner Headline & Primary Slide */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#2D4A27]" />
            3. Hero Banner Headline &amp; Primary Slide Merchandising
          </h3>

          <div className="relative aspect-21/9 w-full bg-[#182319] border border-[#E5E2D9] overflow-hidden rounded">
            <PlantImage src={formData.heroImage} alt="Hero banner preview" className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-center text-white max-w-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3B899] mb-1">
                {formData.heroBadge || "India's Premier Live Plants & Planters Destination"}
              </span>
              <h4 className="font-serif font-bold text-lg leading-tight mb-2">
                {formData.heroTitle || 'Adding Life to Your Spaces.'}
              </h4>
              <p className="text-xs text-gray-200 line-clamp-2">{formData.heroSubtitle}</p>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#1A1A1A] block mb-2">Quick Botanical Wallpapers:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {HERO_WALLPAPER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, heroImage: preset.url })}
                  className={`relative aspect-video border overflow-hidden transition-all rounded ${
                    formData.heroImage === preset.url ? 'border-[#2D4A27] ring-2 ring-[#2D4A27]' : 'border-[#E5E2D9]'
                  }`}
                >
                  <PlantImage src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] p-0.5 truncate text-center font-medium">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Hero Image URL</label>
              <input
                type="text"
                value={formData.heroImage || ''}
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Upload Hero Banner from Device</label>
              <label className="w-full px-3 py-2 bg-[#F5F2EB] hover:bg-[#E5E2D9] text-[#1A1A1A] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[#E5E2D9] transition-colors rounded">
                <Upload className="w-4 h-4 text-[#2D4A27]" />
                Choose Hero Photo File
                <input type="file" accept="image/*" className="hidden" onChange={handleHeroFileUpload} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Top Eyebrow Badge</label>
              <input
                type="text"
                value={formData.heroBadge || ''}
                onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Main Headline (H1)</label>
              <input
                type="text"
                value={formData.heroTitle || ''}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-serif text-sm font-bold focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Hero Subtitle / Description</label>
            <textarea
              rows={2}
              value={formData.heroSubtitle || ''}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Primary Button Label</label>
              <input
                type="text"
                value={formData.heroPrimaryButtonText || ''}
                onChange={(e) => setFormData({ ...formData, heroPrimaryButtonText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Primary Button Link</label>
              <input
                type="text"
                value={formData.heroPrimaryButtonLink || '/plants'}
                onChange={(e) => setFormData({ ...formData, heroPrimaryButtonLink: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Secondary Button Label</label>
              <input
                type="text"
                value={formData.heroSecondaryButtonText || ''}
                onChange={(e) => setFormData({ ...formData, heroSecondaryButtonText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Secondary Button Link</label>
              <input
                type="text"
                value={formData.heroSecondaryButtonLink || '/plants/plant-care'}
                onChange={(e) => setFormData({ ...formData, heroSecondaryButtonLink: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: 4-Pillar Trust Propositions */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2D4A27]" />
            4. Homepage 4-Pillar Trust Propositions (Shown under Hero &amp; in Promise Section)
          </h3>
          <p className="text-[#5A5A5A] text-[11px]">Format: Title — Description (separated by em-dash &quot;—&quot; or hyphen &quot;-&quot;).</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pillar 1: Safe Transit</label>
              <input
                type="text"
                value={formData.trustBadge1 || ''}
                onChange={(e) => setFormData({ ...formData, trustBadge1: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pillar 2: Self-Watering</label>
              <input
                type="text"
                value={formData.trustBadge2 || ''}
                onChange={(e) => setFormData({ ...formData, trustBadge2: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pillar 3: Organic Nutrition</label>
              <input
                type="text"
                value={formData.trustBadge3 || ''}
                onChange={(e) => setFormData({ ...formData, trustBadge3: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pillar 4: Plant Doctor Helpline</label>
              <input
                type="text"
                value={formData.trustBadge4 || ''}
                onChange={(e) => setFormData({ ...formData, trustBadge4: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Botanica & Organic Soil Science */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2D4A27]" />
            5. Botanica &amp; Organic Soil Science Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Title</label>
              <input
                type="text"
                value={formData.botanicaTitle || 'Slow-grown.\\nNurtured weekly.'}
                onChange={(e) => setFormData({ ...formData, botanicaTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Button Label &amp; Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Button Label"
                  value={formData.botanicaButtonText || 'Shop Organic Plant Food'}
                  onChange={(e) => setFormData({ ...formData, botanicaButtonText: e.target.value })}
                  className="w-1/2 px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
                />
                <input
                  type="text"
                  placeholder="/plants/plant-care"
                  value={formData.botanicaButtonLink || '/plants/plant-care'}
                  onChange={(e) => setFormData({ ...formData, botanicaButtonLink: e.target.value })}
                  className="w-1/2 px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Section Subtitle</label>
            <textarea
              rows={2}
              value={formData.botanicaSubtitle || ''}
              onChange={(e) => setFormData({ ...formData, botanicaSubtitle: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27] rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Stone Slab Image URL</label>
            <input
              type="text"
              value={formData.botanicaImage || '/editorial/botanica-stone-slab.jpg'}
              onChange={(e) => setFormData({ ...formData, botanicaImage: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] rounded"
            />
          </div>
        </div>

        {/* SECTION 6: What's Inside Arched Bio-Active Cards */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2D4A27]" />
            6. &ldquo;What&apos;s Inside&rdquo; Bio-Active Ingredients Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Title</label>
              <input
                type="text"
                value={formData.whatsInsideTitle || "What's inside"}
                onChange={(e) => setFormData({ ...formData, whatsInsideTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Subtitle</label>
              <input
                type="text"
                value={formData.whatsInsideSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, whatsInsideSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: Shop by Living Space */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2D4A27]" />
            7. &ldquo;Shop by Living Space&rdquo; Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Title</label>
              <input
                type="text"
                value={formData.livingSpacesTitle || 'Shop by Living Space'}
                onChange={(e) => setFormData({ ...formData, livingSpacesTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Subtitle</label>
              <input
                type="text"
                value={formData.livingSpacesSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, livingSpacesSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 8: Curated Projects Showcase */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#2D4A27]" />
            8. Curated Botanical Projects Showcase
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Title</label>
              <input
                type="text"
                value={formData.projectsTitle || 'Curated Botanical Projects'}
                onChange={(e) => setFormData({ ...formData, projectsTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Subtitle</label>
              <input
                type="text"
                value={formData.projectsSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, projectsSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 9: Why Choose Us / The Botanical Promise */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#2D4A27]" />
            9. &ldquo;The Botanical Promise&rdquo; / Why Choose Us Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Title</label>
              <input
                type="text"
                value={formData.whyChooseUsTitle || 'Cultivated with Patience & Precision'}
                onChange={(e) => setFormData({ ...formData, whyChooseUsTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Subtitle</label>
              <input
                type="text"
                value={formData.whyChooseUsSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, whyChooseUsSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 10: Customer Reviews & Testimonials */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            10. Customer Stories &amp; Testimonials Section
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Headline</label>
              <input
                type="text"
                value={formData.reviewsTitle || 'Loved in 50,000+ Homes'}
                onChange={(e) => setFormData({ ...formData, reviewsTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Subheading</label>
              <input
                type="text"
                value={formData.reviewsSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, reviewsSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 11: WhatsApp Plant Doctor Consultation Banner */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            11. WhatsApp Plant Doctor Consultation Banner
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Banner Headline</label>
              <input
                type="text"
                value={formData.consultationTitle || 'Got Questions About Your Houseplants?'}
                onChange={(e) => setFormData({ ...formData, consultationTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Button Text</label>
              <input
                type="text"
                value={formData.consultationButtonText || 'Chat on WhatsApp Now'}
                onChange={(e) => setFormData({ ...formData, consultationButtonText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Banner Description</label>
            <input
              type="text"
              value={formData.consultationSubtitle || ''}
              onChange={(e) => setFormData({ ...formData, consultationSubtitle: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
            />
          </div>
        </div>

        {/* SECTION 12: Footer & Studio Branding */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <span>🌿</span>
            12. Footer Statement &amp; Newsletter
          </h3>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Studio Philosophy Statement</label>
            <textarea
              rows={2}
              value={formData.footerTagline || ''}
              onChange={(e) => setFormData({ ...formData, footerTagline: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Newsletter Box Title</label>
              <input
                type="text"
                value={formData.newsletterTitle || 'The Botanical Journal'}
                onChange={(e) => setFormData({ ...formData, newsletterTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Newsletter Subtitle</label>
              <input
                type="text"
                value={formData.newsletterSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, newsletterSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] rounded"
              />
            </div>
          </div>
        </div>

        {/* SECTION 13: Amazon-Style Badges */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
            13. Amazon-Style Store Highlights &amp; Badges
          </h3>

          <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] flex items-center justify-between rounded">
            <div>
              <span className="font-bold text-[#1A1A1A] block">Enable Amazon-Style Choice &amp; Trust Badges</span>
              <span className="text-[11px] text-[#5A5A5A]">Renders gold badges on bestseller items and eco-packaging trust seals.</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amazonBadgesEnabled !== false}
                onChange={(e) => setFormData({ ...formData, amazonBadgesEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-[#2D4A27]"
              />
            </label>
          </div>
        </div>

        {/* Submit Publish Button */}
        <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded transition-colors"
          >
            Reset Form to Defaults
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md rounded"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            {saving ? 'Publishing Changes...' : 'Publish Changes Live to Storefront'}
          </button>
        </div>
      </form>
    </div>
  );
};
