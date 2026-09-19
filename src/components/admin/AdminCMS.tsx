import React, { useState } from 'react';
import { Sparkles, Save, CheckCircle2, Upload, Palette, Image as ImageIcon, ShieldCheck, Star, Type } from 'lucide-react';
import { HomepageCMS } from '../../types';
import { useStoreSettings, calculateLuminance, getAutoTextColor } from '../../context/StoreSettingsContext';
import { PlantImage } from '../../utils/imageFallback';
import { AdminToastNotification } from './AdminToastNotification';

const HERO_WALLPAPER_PRESETS = [
  { name: 'Light Botanical Haven', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Lush Monstera Wall', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Modern Plant Shelf', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Balcony Sanctuary', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=85' },
  { name: 'Terracotta Nursery', url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1600&q=85' },
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
  const [formData, setFormData] = useState<HomepageCMS>({ ...homepageCMS });
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('Storefront custom design & homepage content published live!');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setFormData({ ...homepageCMS });
  }, [homepageCMS]);

  const currentBg = formData.siteBackground || '#FDFCF9';
  const autoComputedText = getAutoTextColor(currentBg);
  const currentText = (formData.siteTextColor && formData.siteTextColor !== 'auto') ? formData.siteTextColor : autoComputedText;
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

      setToastMsg(`Published Live! Top message "${formData.announcementText || 'Updated'}" is now live on storefront.`);
      setShowToast(true);
    } catch (err) {
      console.error('Error saving CMS:', err);
    } finally {
      setSaving(false);
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Homepage Merchandising & Custom Theme Studio</h2>
          <p className="text-xs text-[#5A5A5A] font-light">Custom design, site background, top announcement ticker, and hero wallpapers by admin choice.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 border border-[#E5E2D9] space-y-8 text-xs">
        {/* SECTION 1: Top Announcement Bar */}
        <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] space-y-3">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <span>📢</span>
            Top Storefront Announcement Bar Message
          </h3>
          <p className="text-[#5A5A5A] text-[11px]">This message displays at the very top of every storefront page in an animated ticker.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Announcement Message *</label>
              <input
                type="text"
                placeholder="e.g. 🎉 Monsoon Sale: Free Ceramic Pot with Orders above ₹1,499!"
                value={formData.announcementText || ''}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-medium focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Target Link / Path</label>
              <input
                type="text"
                value={formData.announcementLink || '/plants'}
                onChange={(e) => setFormData({ ...formData, announcementLink: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Custom Site Background & Color Theme Studio */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#2D4A27]" />
            Custom Site Background & Theme Colors
          </h3>
          <p className="text-[#5A5A5A] text-[11px]">Customize your store background style and primary brand colors at will.</p>

          {/* Site Background Color presets */}
          <div>
            <span className="font-bold text-[#1A1A1A] block mb-2">Choose Site Background Preset:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {SITE_BACKGROUND_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, siteBackground: preset.color })}
                  className={`p-3 border text-left transition-all flex flex-col items-center justify-between h-20 ${
                    formData.siteBackground === preset.color
                      ? 'border-[#2D4A27] ring-2 ring-[#2D4A27]/20 shadow-xs'
                      : 'border-[#E5E2D9] hover:border-[#2D4A27]'
                  }`}
                  style={{ backgroundColor: preset.preview }}
                >
                  <span className={`text-[10px] font-bold text-center ${preset.color === '#182319' ? 'text-white' : 'text-[#1A1A1A]'}`}>
                    {preset.name}
                  </span>
                  {formData.siteBackground === preset.color && (
                    <span className="bg-[#2D4A27] text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-xs">
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1">
              <label className="block font-semibold text-[#1A1A1A] mb-1">Custom Background Image URL or CSS Color</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/... OR #FDFCF9"
                value={formData.siteBackground || ''}
                onChange={(e) => setFormData({ ...formData, siteBackground: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div className="self-end">
              <label className="px-4 py-2 bg-[#2D4A27]/10 hover:bg-[#2D4A27]/20 text-[#2D4A27] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-[#2D4A27]/30">
                <Upload className="w-3.5 h-3.5" />
                Upload Custom Background File
                <input type="file" accept="image/*" className="hidden" onChange={handleBgFileUpload} />
              </label>
            </div>
          </div>

          {/* Primary Accent Color Presets */}
          <div className="pt-3">
            <span className="font-bold text-[#1A1A1A] block mb-2">Brand Accent Color:</span>
            <div className="flex flex-wrap gap-3 items-center">
              {PRIMARY_COLOR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryColor: p.hex })}
                  className={`px-3 py-1.5 text-[11px] font-bold flex items-center gap-2 border transition-all ${
                    formData.primaryColor === p.hex ? 'border-[#1A1A1A] ring-2 ring-[#1A1A1A]/20' : 'border-[#E5E2D9]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: p.hex }} />
                  <span>{p.name}</span>
                </button>
              ))}
              <input
                type="color"
                value={formData.primaryColor || '#2D4A27'}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-[#E5E2D9] cursor-pointer"
                title="Custom color picker"
              />
            </div>
          </div>

          {/* Site Text Color & Dynamic Contrast Control */}
          <div className="pt-4 border-t border-[#E5E2D9] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-[#1A1A1A] block text-xs flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#2D4A27]" />
                  Site Text Color & Auto Contrast System
                </span>
                <p className="text-[#5A5A5A] text-[11px]">
                  Let buddy4plant automatically compute the highest contrast text color based on your background, or choose a custom font color.
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F5F2EB] p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, siteTextColor: 'auto' })}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    isAutoText
                      ? 'bg-[#2D4A27] text-white shadow-xs'
                      : 'text-[#5A5A5A] hover:text-[#1A1A1A]'
                  }`}
                >
                  Auto Contrast (Smart)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isAutoText) {
                      setFormData({ ...formData, siteTextColor: autoComputedText });
                    }
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    !isAutoText
                      ? 'bg-[#2D4A27] text-white shadow-xs'
                      : 'text-[#5A5A5A] hover:text-[#1A1A1A]'
                  }`}
                >
                  Custom Color
                </button>
              </div>
            </div>

            {/* Auto mode indicator badge */}
            {isAutoText ? (
              <div className="p-3 bg-[#EBF3EC] border border-[#2D4A27]/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: autoComputedText }}
                  />
                  <span className="text-xs text-[#1F341C] font-semibold">
                    Smart Detection Active: Optimal text color computed as <code className="bg-white/80 px-1 py-0.5 rounded font-bold font-mono text-[#182319]">{autoComputedText}</code> ({autoComputedText === '#F3F4F6' ? 'Light text for dark background' : 'Dark text for light background'})
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D4A27] bg-white px-2 py-0.5 rounded border border-[#2D4A27]/20 w-max">
                  AAA High Contrast
                </span>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2.5 items-center">
                  {TEXT_COLOR_PRESETS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, siteTextColor: t.hex })}
                      className={`px-3 py-1.5 text-[11px] font-bold flex items-center gap-2 border transition-all ${
                        formData.siteTextColor === t.hex ? 'border-[#1A1A1A] ring-2 ring-[#1A1A1A]/20 bg-white' : 'border-[#E5E2D9] bg-white hover:border-[#2D4A27]'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: t.hex }} />
                      <span>{t.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.siteTextColor || '#1A1A1A'}
                      onChange={(e) => setFormData({ ...formData, siteTextColor: e.target.value })}
                      className="w-8 h-8 rounded border border-[#E5E2D9] cursor-pointer"
                      title="Custom text color picker"
                    />
                    <input
                      type="text"
                      value={formData.siteTextColor || ''}
                      onChange={(e) => setFormData({ ...formData, siteTextColor: e.target.value })}
                      placeholder="#1A1A1A"
                      className="w-24 px-2 py-1 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-xs focus:outline-none focus:border-[#2D4A27]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Live Typography Contrast Sample */}
            <div
              className="p-4 border border-[#E5E2D9] rounded-lg transition-colors duration-200 mt-2 shadow-xs"
              style={{
                backgroundColor: currentBg.startsWith('http') || currentBg.startsWith('/') ? '#182319' : currentBg,
                color: currentText,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                  Live Contrast Preview
                </span>
                <span className="text-[10px] opacity-80 font-mono">
                  Background: {currentBg.length > 25 ? currentBg.substring(0, 25) + '...' : currentBg} • Text: {currentText}
                </span>
              </div>
              <h4 className="text-base font-serif font-bold tracking-wide mb-1" style={{ color: currentText }}>
                Ficus Lyrata Bambino • Bio-Active Plant Nutrition
              </h4>
              <p className="text-xs opacity-90 leading-relaxed max-w-xl">
                Cold-pressed kelp feed and volcanic pumice blend designed to nourish indoor greenery and root vitality in all seasons.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Hero Banner & Wallpaper Selector */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#2D4A27]" />
            Hero Banner Image & Headline Merchandising
          </h3>

          {/* Current Hero Preview */}
          <div className="relative aspect-21/9 w-full bg-[#182319] border border-[#E5E2D9] overflow-hidden rounded-xs">
            <PlantImage src={formData.heroImage} alt="Hero banner preview" className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-center text-white max-w-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3B899] mb-1">
                {formData.heroBadge || 'Premium Botanical Living'}
              </span>
              <h4 className="font-serif font-bold text-lg leading-tight mb-2">
                {formData.heroTitle || 'Bring Home a Little More Green.'}
              </h4>
              <p className="text-xs text-gray-200 line-clamp-2">{formData.heroSubtitle}</p>
            </div>
          </div>

          {/* 1-Click Wallpapers */}
          <div>
            <span className="text-[11px] font-bold text-[#1A1A1A] block mb-2">1-Click Botanical Wallpapers:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {HERO_WALLPAPER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, heroImage: preset.url })}
                  className={`relative aspect-video border overflow-hidden transition-all ${
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
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Upload Hero Banner from Device</label>
              <label className="w-full px-3 py-2 bg-[#F5F2EB] hover:bg-[#E5E2D9] text-[#1A1A1A] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[#E5E2D9] transition-colors">
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
                placeholder="Greenery for Calm Living"
                value={formData.heroBadge || ''}
                onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Main Headline (H1)</label>
              <input
                type="text"
                value={formData.heroTitle || ''}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-serif text-sm font-bold focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Hero Subtitle / Description</label>
            <textarea
              rows={2}
              value={formData.heroSubtitle || ''}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Primary Button Label</label>
              <input
                type="text"
                value={formData.heroPrimaryButtonText || ''}
                onChange={(e) => setFormData({ ...formData, heroPrimaryButtonText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Primary Button Link</label>
              <input
                type="text"
                value={formData.heroPrimaryButtonLink || '/plants'}
                onChange={(e) => setFormData({ ...formData, heroPrimaryButtonLink: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Botanica & Soil Science Formulation */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2D4A27]" />
            Botanica &amp; Organic Soil Science Section
          </h3>
          <p className="text-[#5A5A5A] text-[11px]">Controls the stone slab formulation section highlighting cold-pressed bio-actives.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Title</label>
              <input
                type="text"
                placeholder="Slow-grown. Nurtured weekly."
                value={formData.botanicaTitle || 'Slow-grown. Nurtured weekly.'}
                onChange={(e) => setFormData({ ...formData, botanicaTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Button Action Link</label>
              <input
                type="text"
                value={formData.botanicaButtonLink || '/plants/plant-care'}
                onChange={(e) => setFormData({ ...formData, botanicaButtonLink: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Section Subtitle</label>
            <textarea
              rows={2}
              value={formData.botanicaSubtitle || 'Organic plant food and microbiome fertilizers crafted from what takes nature years to form. Feeds roots deep, settles clean.'}
              onChange={(e) => setFormData({ ...formData, botanicaSubtitle: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Travertine Stone Slab Image URL</label>
            <input
              type="text"
              value={formData.botanicaImage || '/editorial/botanica-stone-slab.jpg'}
              onChange={(e) => setFormData({ ...formData, botanicaImage: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
            />
          </div>
        </div>

        {/* SECTION 5: What's Inside Arched Bio-Active Cards */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#2D4A27]" />
            &ldquo;What&apos;s Inside&rdquo; Bio-Active Ingredients Section
          </h3>
          <p className="text-[#5A5A5A] text-[11px]">Headline &amp; copy for the three arched active ingredient cards.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Title</label>
              <input
                type="text"
                value={formData.whatsInsideTitle || "What's inside"}
                onChange={(e) => setFormData({ ...formData, whatsInsideTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Section Subtitle</label>
              <input
                type="text"
                value={formData.whatsInsideSubtitle || 'Each organic nutrient was chosen because it works for living plants. Not because it looks good on a label.'}
                onChange={(e) => setFormData({ ...formData, whatsInsideSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: 4-Pillar Trust Propositions */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2D4A27]" />
            Homepage 4-Pillar Trust Propositions
          </h3>
          <p className="text-[#5A5A5A] text-[11px]">The four value cards shown below the hero banner on the homepage.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pillar 1: Safe Transit</label>
              <input
                type="text"
                value={formData.trustBadge1 || 'Safe Pan-India Transit — Guaranteed zero leaf breakage'}
                onChange={(e) => setFormData({ ...formData, trustBadge1: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pillar 2: Self-Watering</label>
              <input
                type="text"
                value={formData.trustBadge2 || 'Self-Watering Planters — Hydrates for 10-14 days'}
                onChange={(e) => setFormData({ ...formData, trustBadge2: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pillar 3: Organic Nutrition</label>
              <input
                type="text"
                value={formData.trustBadge3 || '100% Organic Nutrition — Cold-pressed kelp & microbes'}
                onChange={(e) => setFormData({ ...formData, trustBadge3: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pillar 4: Plant Doctor</label>
              <input
                type="text"
                value={formData.trustBadge4 || 'Free Plant Doctor Help — Direct WhatsApp guidance'}
                onChange={(e) => setFormData({ ...formData, trustBadge4: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: Amazon-Style Trust Badges */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
            Amazon-Style Store Highlights &amp; Badges
          </h3>

          <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#1A1A1A] block">Enable Amazon-Style &ldquo;Choice&rdquo; &amp; &ldquo;Trust&rdquo; Badges</span>
              <span className="text-[11px] text-[#5A5A5A]">Renders gold star badges on bestseller items and eco-packaging trust seals.</span>
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
        <div className="pt-4 border-t border-[#E5E2D9] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            {saving ? 'Publishing Changes...' : 'Publish Changes Live to Storefront'}
          </button>
        </div>
      </form>
    </div>
  );
};
