import React, { useState } from 'react';
import { Sparkles, Save, CheckCircle2, RefreshCw } from 'lucide-react';
import { HomepageCMS } from '../../types';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const AdminCMS: React.FC = () => {
  const { homepageCMS, updateHomepageCMS } = useStoreSettings();
  const [formData, setFormData] = useState<HomepageCMS>({ ...homepageCMS });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHomepageCMS(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving CMS:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Homepage Merchandising & CMS</h2>
          <p className="text-xs text-[#5A5A5A] font-light">Live-edit storefront hero imagery, headline banners, and promo copy.</p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-[#2D4A27]/10 border border-[#2D4A27]/30 text-[#2D4A27] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D4A27]" />
          <span>Homepage CMS content updated and live across the customer storefront!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 border border-[#E5E2D9] space-y-6 text-xs">
        {/* Top Promotional Bar */}
        <div>
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] mb-3 flex items-center gap-2">
            <span>📢</span>
            Top Announcement Bar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Announcement Message</label>
              <input
                type="text"
                value={formData.announcementText || ''}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Announcement Link / Path</label>
              <input
                type="text"
                value={formData.announcementLink || '/plants'}
                onChange={(e) => setFormData({ ...formData, announcementLink: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="pt-6 border-t border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] mb-3 flex items-center gap-2">
            <i className="fa-solid fa-leaf text-[#2D4A27]" />
            Hero Banner Section
          </h3>

          <div className="space-y-4">
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
                <label className="block font-semibold text-[#1A1A1A] mb-1">Hero Background Image URL</label>
                <input
                  type="text"
                  value={formData.heroImage || ''}
                  onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-mono text-[11px] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Main Heading (H1)</label>
              <input
                type="text"
                value={formData.heroTitle || ''}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] font-serif text-sm font-bold focus:outline-none focus:border-[#2D4A27]"
              />
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
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[#E5E2D9] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing Changes...' : 'Publish to Storefront'}
          </button>
        </div>
      </form>
    </div>
  );
};
