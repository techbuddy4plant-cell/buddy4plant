import React, { useState } from 'react';
import {
  Building2,
  Save,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Leaf,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { AdminToastNotification } from './AdminToastNotification';

export const AdminAboutUs: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { homepageCMS, updateHomepageCMS } = useStoreSettings();
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState(
    (homepageCMS as any).aboutTitle || 'Cultivating Calm in Indian Living Spaces'
  );
  const [subtitle, setSubtitle] = useState(
    (homepageCMS as any).aboutSubtitle ||
      'Founded with a vision to reconnect urban homes with pristine botanical nature, buddy4plant nurtures climate-resilient plants suited for Indian living conditions.'
  );
  const [storyHeading, setStoryHeading] = useState(
    (homepageCMS as any).aboutStoryHeading || 'Greenhouse to Doorstep'
  );
  const [storyContent, setStoryContent] = useState(
    (homepageCMS as any).aboutStoryContent ||
      'Unlike traditional roadside nurseries where plants sit in low-grade heavy clay soil and face transplant shock, every buddy4plant specimen is grown in our eco-controlled greenhouses across Western Ghats and Bengaluru. We pot our plants in aerated, sterilized cocopeat enriched with organic vermicompost, perlite, and neem cake.'
  );

  const [metric1Value, setMetric1Value] = useState((homepageCMS as any).aboutMetric1Value || '0%');
  const [metric1Label, setMetric1Label] = useState((homepageCMS as any).aboutMetric1Label || 'Single-Use Plastics');
  const [metric1Desc, setMetric1Desc] = useState((homepageCMS as any).aboutMetric1Desc || 'All packaging is 100% recyclable honeycomb board.');

  const [metric2Value, setMetric2Value] = useState((homepageCMS as any).aboutMetric2Value || '7 Days');
  const [metric2Label, setMetric2Label] = useState((homepageCMS as any).aboutMetric2Label || 'Transit Guarantee');
  const [metric2Desc, setMetric2Desc] = useState((homepageCMS as any).aboutMetric2Desc || 'Immediate free replacement if damaged in transit.');

  const [metric3Value, setMetric3Value] = useState((homepageCMS as any).aboutMetric3Value || '24x7');
  const [metric3Label, setMetric3Label] = useState((homepageCMS as any).aboutMetric3Label || 'Plant Doctor Advice');
  const [metric3Desc, setMetric3Desc] = useState((homepageCMS as any).aboutMetric3Desc || 'Direct WhatsApp access to certified botanists.');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHomepageCMS({
        ...homepageCMS,
        aboutTitle: title,
        aboutSubtitle: subtitle,
        aboutStoryHeading: storyHeading,
        aboutStoryContent: storyContent,
        aboutMetric1Value: metric1Value,
        aboutMetric1Label: metric1Label,
        aboutMetric1Desc: metric1Desc,
        aboutMetric2Value: metric2Value,
        aboutMetric2Label: metric2Label,
        aboutMetric2Desc: metric2Desc,
        aboutMetric3Value: metric3Value,
        aboutMetric3Label: metric3Label,
        aboutMetric3Desc: metric3Desc,
      } as any);
      setShowToast(true);
    } catch (err) {
      console.error('Error saving About Us CMS:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminToastNotification
        show={showToast}
        message="About Us page content published live to the storefront!"
        onClose={() => setShowToast(false)}
        onViewStorefront={() => window.open('/about', '_blank')}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-[#E5E2D9] rounded-lg shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2D4A27]" />
            About us — Sanctuary Story &amp; Nursery Heritage
          </h2>
          <p className="text-xs text-[#5A5A5A] font-light mt-0.5">
            Manage your brand origin story, sustainable packaging commitment, and nursery ethos displayed on the /about storefront page.
          </p>
        </div>

        <button
          onClick={() => navigate('/about')}
          className="px-3.5 py-2 bg-[#F5F2EB] hover:bg-[#EAE5D9] text-[#1A1A1A] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors border border-[#D5CFC2] self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#5A5A5A]" />
          View Live About Page
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 border border-[#E5E2D9] space-y-6 text-xs rounded-lg shadow-xs">
        {/* Main Heading & Intro */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#2D4A27]" />
            1. Nursery Vision &amp; Headline
          </h3>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Main Page Headline (H1)</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E2D9] rounded text-sm font-serif font-bold focus:outline-none focus:border-[#2D4A27]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Introductory Subtitle / Narrative</label>
            <textarea
              rows={2}
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E2D9] rounded focus:outline-none focus:border-[#2D4A27]"
            />
          </div>
        </div>

        {/* Nursery Story & Growing Practices */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2D4A27]" />
            2. Greenhouse to Doorstep Journey
          </h3>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Section Title</label>
            <input
              type="text"
              value={storyHeading}
              onChange={(e) => setStoryHeading(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E2D9] rounded font-semibold focus:outline-none focus:border-[#2D4A27]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1A1A1A] mb-1">Story Narrative Content</label>
            <textarea
              rows={5}
              value={storyContent}
              onChange={(e) => setStoryContent(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E2D9] rounded focus:outline-none focus:border-[#2D4A27] leading-relaxed"
            />
          </div>
        </div>

        {/* 3 Pillars / Metric Badges */}
        <div className="space-y-4 pb-6 border-b border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2D4A27]" />
            3. Three Brand Metrics &amp; Sustainability Guarantees
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric 1 */}
            <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] rounded-lg space-y-2">
              <label className="block font-bold text-[#1A1A1A]">Pillar 1 (e.g. Eco Packaging)</label>
              <input
                type="text"
                placeholder="Stat / Value (e.g. 0%)"
                value={metric1Value}
                onChange={(e) => setMetric1Value(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded font-serif font-bold text-base"
              />
              <input
                type="text"
                placeholder="Label"
                value={metric1Label}
                onChange={(e) => setMetric1Label(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded font-semibold text-xs"
              />
              <textarea
                rows={2}
                placeholder="Short Description"
                value={metric1Desc}
                onChange={(e) => setMetric1Desc(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded text-[11px]"
              />
            </div>

            {/* Metric 2 */}
            <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] rounded-lg space-y-2">
              <label className="block font-bold text-[#1A1A1A]">Pillar 2 (e.g. Guarantee)</label>
              <input
                type="text"
                placeholder="Stat / Value (e.g. 7 Days)"
                value={metric2Value}
                onChange={(e) => setMetric2Value(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded font-serif font-bold text-base"
              />
              <input
                type="text"
                placeholder="Label"
                value={metric2Label}
                onChange={(e) => setMetric2Label(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded font-semibold text-xs"
              />
              <textarea
                rows={2}
                placeholder="Short Description"
                value={metric2Desc}
                onChange={(e) => setMetric2Desc(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded text-[11px]"
              />
            </div>

            {/* Metric 3 */}
            <div className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] rounded-lg space-y-2">
              <label className="block font-bold text-[#1A1A1A]">Pillar 3 (e.g. Plant Doctor)</label>
              <input
                type="text"
                placeholder="Stat / Value (e.g. 24x7)"
                value={metric3Value}
                onChange={(e) => setMetric3Value(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded font-serif font-bold text-base"
              />
              <input
                type="text"
                placeholder="Label"
                value={metric3Label}
                onChange={(e) => setMetric3Label(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded font-semibold text-xs"
              />
              <textarea
                rows={2}
                placeholder="Short Description"
                value={metric3Desc}
                onChange={(e) => setMetric3Desc(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            {saving ? 'Publishing About Us...' : 'Publish About Us Live'}
          </button>
        </div>
      </form>
    </div>
  );
};
