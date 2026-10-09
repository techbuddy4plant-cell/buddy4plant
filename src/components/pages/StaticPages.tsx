import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  HelpCircle,
  Leaf
} from '../common/Icons';
import { getAllReviews } from '../../services/reviewService';
import { INITIAL_REVIEWS } from '../../data/initialSettings';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const AboutUsPage: React.FC = () => {
  // Text is edited in Admin > About us
  const { homepageCMS } = useStoreSettings();
  const c = homepageCMS as any;
  const title = c.aboutTitle || 'Cultivating Calm in Indian Living Spaces';
  const subtitle =
    c.aboutSubtitle ||
    'Buddy4Plant is a Lucknow nursery and landscaping company growing healthy plants and green spaces for homes, offices and campuses.';
  const storyHeading = c.aboutStoryHeading || 'From Our Nursery to Your Space';
  const story =
    c.aboutStoryContent ||
    'We grow and supply healthy plants, pots and organic plant care from Lucknow, and our landscaping team designs, builds and maintains gardens for homes, offices and government campuses across Uttar Pradesh and Delhi.';
  const metrics = [1, 2, 3]
    .map((i) => ({ value: c[`aboutMetric${i}Value`], label: c[`aboutMetric${i}Label`], desc: c[`aboutMetric${i}Desc`] }))
    .filter((m) => m.value || m.label);
  const shown = metrics.length
    ? metrics
    : [
        { value: '18+', label: 'Landscaping Projects', desc: 'Government, institutional and private gardens across Uttar Pradesh and Delhi.' },
        { value: 'UP & Delhi', label: 'Service Area', desc: 'Site visits, landscaping and annual maintenance contracts.' },
        { value: 'WhatsApp', label: 'Plant Help', desc: 'Send us a photo of your plant and our team will guide you.' },
      ];
  return (
    <div className="bg-[#FAF5EE] min-h-screen py-12 text-[#182018]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2">Our Story</span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#141C14] mt-1">{title}</h1>
          <p className="text-xs sm:text-[15px] text-[#5C554B] mt-3 leading-relaxed">{subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFD3] shadow-sm space-y-8 text-[#3D372E] text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="font-editorial font-bold text-xl sm:text-2xl text-[#141C14] mb-3">{storyHeading}</h2>
            {String(story)
              .split(/\n\s*\n/)
              .map((para: string, i: number) => (
                <p key={i} className={i ? 'mt-3' : ''}>
                  {para}
                </p>
              ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#EFE8DD]">
            {shown.map((m, i) => (
              <div key={i} className="p-5 bg-[#FAF5EE] rounded-2xl border border-[#E8DFD3]">
                <span className="font-editorial font-bold text-2xl sm:text-3xl text-[#1A3824] block mb-1">{m.value}</span>
                <span className="font-bold text-[#141C14] text-xs block">{m.label}</span>
                {m.desc && <p className="text-[11px] text-[#7A746B] mt-1">{m.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlantDoctorPage: React.FC = () => {
  const [selectedIssue, setSelectedIssue] = useState<string | null>('yellow-leaves');

  const issues = [
    {
      id: 'yellow-leaves',
      title: 'Yellowing Leaves',
      icon: 'fa-solid fa-leaf text-amber-600',
      cause: 'Overwatering is the #1 culprit. Soil remains soggy, suffocating root oxygen absorption.',
      solution: 'Allow top 2 inches of soil to dry out before watering again. Ensure your planter has drainage holes at the bottom.',
    },
    {
      id: 'brown-tips',
      title: 'Crispy Brown Leaf Tips',
      icon: 'fa-solid fa-fire text-orange-500',
      cause: 'Low ambient room humidity (common with AC or heaters) or chlorinated hard tap water.',
      solution: 'Mist foliage every 2-3 days, use filtered or rested water, and group plants together to create a micro-humid zone.',
    },
    {
      id: 'drooping',
      title: 'Wilting & Drooping Stems',
      icon: 'fa-solid fa-temperature-arrow-down text-rose-500',
      cause: 'Severe underwatering or sudden temperature shock from direct AC drafts.',
      solution: 'Give a thorough deep bottom-watering bath. Move the plant away from direct airflow vents.',
    },
    {
      id: 'pests',
      title: 'White Fluff or Sticky Leaves (Pests)',
      icon: 'fa-solid fa-bug text-[#1A3824]',
      cause: 'Mealybugs or spider mites attracted to dusty or stagnant indoor foliage.',
      solution: 'Wipe leaves with diluted organic neem oil spray (included in our botanical care kit) once a week.',
    },
  ];

  const current = issues.find((i) => i.id === selectedIssue);

  return (
    <div className="bg-[#FAF5EE] min-h-screen py-12 text-[#182018]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2">
            Self-Help & Diagnostic Guide
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#141C14] mt-1">
            Plant Doctor
          </h1>
          <p className="text-xs sm:text-sm text-[#5C554B] mt-2">
            Diagnose common leaf symptoms in seconds or chat with our horticulturists on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Issue Selector */}
          <div className="md:col-span-5 space-y-2.5">
            {issues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  selectedIssue === issue.id
                    ? 'bg-[#1A3824] text-white border-[#1A3824] shadow-sm'
                    : 'bg-white text-[#182018] border-[#E8DFD3] hover:border-[#1A3824]'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0 border border-[#E8DFD3]">
                  <i className={`${issue.icon} text-base`} />
                </div>
                <span className="text-xs font-bold font-editorial">{issue.title}</span>
              </button>
            ))}
          </div>

          {/* Issue Remedy Card */}
          <div className="md:col-span-7">
            {current && (
              <div className="bg-white rounded-3xl p-8 border border-[#E8DFD3] shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 pb-4 border-b border-[#EFE8DD]">
                  <div className="w-11 h-11 rounded-2xl bg-[#EBF5EC] border border-[#C5E1C9] flex items-center justify-center shrink-0">
                    <i className={`${current.icon} text-xl`} />
                  </div>
                  <div>
                    <h3 className="font-editorial font-bold text-lg text-[#141C14]">{current.title}</h3>
                    <span className="text-[11px] text-[#7A746B]">Botanical Symptom Analysis</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Likely Root Cause
                  </h4>
                  <p className="text-xs text-[#5C554B] leading-relaxed">{current.cause}</p>
                </div>

                <div className="p-4 bg-[#EBF5EC]/70 rounded-2xl border border-[#C5E1C9]">
                  <h4 className="font-bold text-xs text-[#1A3824] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    Recommended Action
                  </h4>
                  <p className="text-xs text-[#1A3824] leading-relaxed">{current.solution}</p>
                </div>

                <div className="pt-4 border-t border-[#EFE8DD]">
                  <a
                    href="https://wa.me/918004881668?text=Hi%20Plant%20Doctor,%20I%20need%20help%20with%20my%20plant"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1A3824] hover:underline"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    Send a photo to WhatsApp Plant Doctor (+91 80048 81668) &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export const ContactUsPage: React.FC = () => {
  const { settings } = useStoreSettings();
  const wa = (settings.whatsappSupportNumber || settings.contactPhone || '918004881668').replace(/\D/g, '');
  const email = settings.contactEmail || 'contactus@buddy4plant.in';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    topic: 'Plant Care Advice',
    message: '',
  });

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi Buddy4Plant Team, my name is ${formData.name || 'a customer'}.\n\nTopic: ${formData.topic}\nPhone: ${formData.phone || 'N/A'}\nMessage: ${formData.message}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-[#FAF5EE] min-h-screen py-10 sm:py-16 text-[#182018] relative overflow-hidden">
      {/* Decorative Botanical Foliage Framing (Corner Accents) */}
      <div className="pointer-events-none absolute -top-8 -left-10 w-48 sm:w-72 lg:w-88 h-64 sm:h-96 opacity-85 z-0 select-none hidden sm:block">
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M-20 40C40 30 110 90 140 160C110 140 50 120 -20 110" fill="#3D5A42" fillOpacity="0.75" />
          <path d="M-10 80C60 80 130 150 160 230C130 200 60 170 -10 160" fill="#4B6E52" fillOpacity="0.8" />
          <path d="M-30 0C50 -10 150 40 200 120C150 90 60 70 -30 60" fill="#2E4833" fillOpacity="0.85" />
          <path d="M10 140C80 140 150 220 170 310C140 270 80 230 10 210" fill="#5B7E62" fillOpacity="0.75" />
          <path d="M-40 180C30 190 90 270 100 360C80 320 30 270 -40 250" fill="#3A563F" fillOpacity="0.7" />
          <path d="M20 60C70 60 120 120 140 190C120 160 80 130 20 120" stroke="#8EB093" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -top-8 -right-10 w-48 sm:w-72 lg:w-88 h-64 sm:h-96 opacity-85 z-0 select-none hidden sm:block">
        <svg viewBox="0 0 320 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-x-[-1]">
          <path d="M-20 40C40 30 110 90 140 160C110 140 50 120 -20 110" fill="#3D5A42" fillOpacity="0.75" />
          <path d="M-10 80C60 80 130 150 160 230C130 200 60 170 -10 160" fill="#4B6E52" fillOpacity="0.8" />
          <path d="M-30 0C50 -10 150 40 200 120C150 90 60 70 -30 60" fill="#2E4833" fillOpacity="0.85" />
          <path d="M10 140C80 140 150 220 170 310C140 270 80 230 10 210" fill="#5B7E62" fillOpacity="0.75" />
          <path d="M-40 180C30 190 90 270 100 360C80 320 30 270 -40 250" fill="#3A563F" fillOpacity="0.7" />
          <path d="M20 60C70 60 120 120 140 190C120 160 80 130 20 120" stroke="#8EB093" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2.5 font-sans">
            BOTANICAL CONCIERGE & SUPPORT
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#141C14] tracking-tight leading-[1.1]">
            Get in Touch with Our Plant Artisans
          </h1>
          <p className="text-xs sm:text-[15px] text-[#5C554B] mt-3.5 leading-relaxed font-normal">
            Whether you need urgent leaf diagnosis from our botanists, want to customize corporate green hampers,
            or wish to explore landscape styling for your residence, we are here for you.
          </p>
        </div>

        {/* 3 Signature Luxury Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {/* Card 1: WhatsApp Plant Doctor */}
          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD3] shadow-[0_4px_20px_-8px_rgba(20,40,25,0.06)] hover:shadow-lg hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF7EC] border border-[#BCE8C2] flex items-center justify-center text-[#25D366] group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-7 h-7 text-[#25D366]" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7EC] text-[#1E6B2A] text-[10px] font-bold tracking-wide uppercase border border-[#BCE8C2]">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  Live Botanist
                </span>
              </div>
              <h3 className="font-editorial font-bold text-xl text-[#141C14] mb-1.5">WhatsApp Concierge</h3>
              <p className="text-xs text-[#6B645A] leading-relaxed mb-4">
                Fastest way to get plant advice. Send photos of yellowing leaves or pests for instant recommendations.
              </p>
            </div>
            <div className="pt-4 border-t border-[#EFE8DD] space-y-3">
              <a
                href={`https://wa.me/${wa}?text=Hi%20Buddy4Plant%20Team,%20I%20would%20like%20assistance`}
                target="_blank"
                rel="noreferrer"
                className="w-full pill-btn-dark py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Card 2: Email Care & Corporate */}
          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD3] shadow-[0_4px_20px_-8px_rgba(20,40,25,0.06)] hover:shadow-lg hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF5EE] border border-[#E5DDD0] flex items-center justify-center text-[#1A3824] group-hover:scale-105 transition-transform">
                  <Mail className="w-7 h-7 text-[#1A3824]" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F5EEE4] text-[#5C554B] text-[10px] font-bold tracking-wide uppercase border border-[#E5DDD0]">
                  Replies in 2–4 Hrs
                </span>
              </div>
              <h3 className="font-editorial font-bold text-xl text-[#141C14] mb-1.5">Email Support</h3>
              <p className="text-xs text-[#6B645A] leading-relaxed mb-4">
                For order invoices, bulk corporate gifting catalogues, and supplier collaborations.
              </p>
            </div>
            <div className="pt-4 border-t border-[#EFE8DD] space-y-3">
              <span className="text-xs font-semibold text-[#182018] block truncate">{email}</span>
              <a
                href={`mailto:${email}`}
                className="w-full pill-btn-light py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#DDD5C7]"
              >
                <Mail className="w-4 h-4 text-[#1A3824]" />
                Send Email
              </a>
            </div>
          </div>

          {/* Card 3: Nursery Studio Visit */}
          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD3] shadow-[0_4px_20px_-8px_rgba(20,40,25,0.06)] hover:shadow-lg hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF5EE] border border-[#E5DDD0] flex items-center justify-center text-[#1A3824] group-hover:scale-105 transition-transform">
                  <MapPin className="w-7 h-7 text-[#1A3824]" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F5EEE4] text-[#5C554B] text-[10px] font-bold tracking-wide uppercase border border-[#E5DDD0]">
                  Mon – Sun • 8 AM – 8 PM
                </span>
              </div>
              <h3 className="font-editorial font-bold text-xl text-[#141C14] mb-1.5">Nursery Studio</h3>
              <p className="text-xs text-[#6B645A] leading-relaxed mb-4">
                Visit our nursery to see our plants and pots in person.
              </p>
            </div>
            <div className="pt-4 border-t border-[#EFE8DD] space-y-3">
              <span className="text-xs font-semibold text-[#182018] block line-clamp-1">
                {settings.storeAddress || 'Lucknow, Uttar Pradesh, India'}
              </span>
              <a
                href="/store-locator"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/store-locator');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  window.scrollTo({ top: 0 });
                }}
                className="w-full pill-btn-light py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#DDD5C7]"
              >
                <MapPin className="w-4 h-4 text-[#1A3824]" />
                View Store Locator
              </a>
            </div>
          </div>
        </div>

        {/* Interactive Direct Message Form & Botanical Promise */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white p-8 sm:p-12 rounded-4xl border border-[#E8DFD3] shadow-sm">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-bold text-[#486B44] uppercase tracking-[0.24em] block font-sans">
              DIRECT INQUIRY
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141C14]">
              Leave a Message with Our Garden Team
            </h2>
            <p className="text-xs sm:text-sm text-[#5C554B] leading-relaxed">
              Have a specific question about an upcoming landscaping project, order customization, or plant care issue? Fill in your details and connect immediately on WhatsApp.
            </p>

            <div className="space-y-4 pt-4 border-t border-[#EFE8DD]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF5EC] flex items-center justify-center text-[#1A3824] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#1A3824]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#141C14]">7-Day Fresh Transit Guarantee</h4>
                  <p className="text-[11px] text-[#7A746B]">Free plant replacement if transit damage occurs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF5EC] flex items-center justify-center text-[#1A3824] shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4 text-[#1A3824]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#141C14]">Acclimatized Root Systems</h4>
                  <p className="text-[11px] text-[#7A746B]">Slow-grown in Indian climate to thrive indoors and outdoors</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF5EC] flex items-center justify-center text-[#1A3824] shrink-0 mt-0.5">
                  <Truck className="w-4 h-4 text-[#1A3824]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#141C14]">Safe Pan-India Transit</h4>
                  <p className="text-[11px] text-[#7A746B]">Zero-spill root chambers & insulated protective packaging</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#FAF5EE] p-6 sm:p-8 rounded-3xl border border-[#E5DDD0]">
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#141C14] uppercase tracking-wider mb-1.5 font-sans">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-xl px-4 py-2.5 text-xs text-[#141C14] focus:outline-none focus:border-[#1A3824]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#141C14] uppercase tracking-wider mb-1.5 font-sans">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-xl px-4 py-2.5 text-xs text-[#141C14] focus:outline-none focus:border-[#1A3824]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#141C14] uppercase tracking-wider mb-1.5 font-sans">
                  Inquiry Topic
                </label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-xl px-4 py-2.5 text-xs text-[#141C14] focus:outline-none focus:border-[#1A3824]"
                >
                  <option value="Plant Care Advice">Plant Care Advice & Leaf Diagnosis</option>
                  <option value="Order Tracking & Status">Order Tracking & Delivery Status</option>
                  <option value="Balcony / Garden Landscaping">Balcony & Garden Landscaping</option>
                  <option value="Corporate / Bulk Gifting">Corporate & Festive Bulk Gifting</option>
                  <option value="Artisanal Pots & Soil">Artisanal Pots & Soil Recommendations</option>
                  <option value="General Inquiry">General Nursery Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#141C14] uppercase tracking-wider mb-1.5 font-sans">
                  How can we help?
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your plant or garden query here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-xl p-4 text-xs text-[#141C14] focus:outline-none focus:border-[#1A3824]"
                />
              </div>

              <button
                type="submit"
                className="w-full pill-btn-dark py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                Submit via WhatsApp Concierge
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReviewsPage: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchReviews = async () => {
    try {
      const data = await getAllReviews();
      // Sample reviews that came with the template are never shown
      setReviews(data.filter((r: any) => r.approved && !INITIAL_REVIEWS.some((d) => d.id === r.id)));
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
    window.addEventListener('b4p_reviews_changed', fetchReviews);
    window.addEventListener('b4p_store_data_changed', fetchReviews);
    return () => {
      window.removeEventListener('b4p_reviews_changed', fetchReviews);
      window.removeEventListener('b4p_store_data_changed', fetchReviews);
    };
  }, []);

  return (
    <div className="bg-[#FAF5EE] min-h-screen py-12 font-sans text-[#182018]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2">
            Real Customer Stories
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#141C14] mt-1">
            Customer Reviews
          </h1>
          <p className="text-xs sm:text-[15px] text-[#5C554B] mt-3">
            Real reviews and photo feedback from plant lovers across India whose spaces have blossomed with buddy4plant.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#7A746B]">Loading verified reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-white p-8 border border-[#E8DFD3] rounded-3xl shadow-sm max-w-lg mx-auto">
            <p className="text-xs sm:text-sm text-[#7A746B]">No reviews published yet. Be the first to share your plant journey!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white p-6 border border-[#E8DFD3] rounded-3xl shadow-sm flex flex-col justify-between hover:border-[#1A3824]/40 hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fa-solid fa-star text-xs ${i < r.rating ? 'text-amber-500' : 'text-stone-200'}`}
                        />
                      ))}
                    </div>
                    {r.verifiedPurchase && (
                      <span className="text-[10px] font-bold text-[#1A3824] bg-[#EBF5EC] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#C5E1C9]">
                        <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <h3 className="font-editorial font-bold text-base text-[#141C14] mb-1">{r.title || 'Exceptional Botanical Specimen'}</h3>
                  <p className="text-xs text-[#5C554B] leading-relaxed mb-4 italic">"{r.comment}"</p>
                </div>

                <div className="pt-3.5 border-t border-[#EFE8DD] flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-[#141C14] block">{r.userName}</span>
                    <span className="text-[#A25A34] font-medium">{r.productName || 'Botanical Houseplant'}</span>
                  </div>
                  <span className="text-[#9A9388]">
                    {new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {navigate && (
          <div className="mt-14 text-center">
            <button
              onClick={() => navigate('/plants')}
              className="px-8 py-3.5 bg-[#1A3824] hover:bg-[#20492C] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-colors"
            >
              Explore Living Plants Catalogue &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const CareGuidePage: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  return (
    <div className="bg-[#FAF5EE] min-h-screen py-12 font-sans text-[#182018]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2">
            Nursery Knowledge Hub
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#141C14] mt-1">
            Plant Care &amp; Watering Guide
          </h1>
          <p className="text-xs sm:text-[15px] text-[#5C554B] mt-3">
            Essential care rhythms to keep your indoor tropicals, succulents, and balcony gardens vibrant in Indian seasons.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-7 sm:p-9 border border-[#E8DFD3] rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-800 border border-sky-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-sky-700" />
              </div>
              <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14]">1. The Finger-Dip Watering Rule</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C554B] leading-relaxed">
              Always test the top 1 to 2 inches of soil with your index finger before watering. If dry and crumbly, give a thorough soak until water seeps from drainage holes. If damp and cool, wait 2–3 more days. In summer (March to June), water twice weekly; in monsoon and winter, reduce frequency by 50%.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-9 border border-[#E8DFD3] rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-700" />
              </div>
              <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14]">2. Understanding Indirect Light</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C554B] leading-relaxed">
              Most indoor houseplants crave bright, diffused natural daylight (near east or north-facing windows). Direct midday scorching sunlight can burn delicate leaves. If your room lacks natural light, rotate your plants near a window once a week or supplement with standard 4000K LED illumination.
            </p>
          </div>

          <div className="bg-white p-7 sm:p-9 border border-[#E8DFD3] rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EBF5EC] text-[#1A3824] border border-[#C5E1C9] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14]">3. Organic Plant Food &amp; Bio-Nutrients</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5C554B] leading-relaxed">
              Plants potted in containers eventually deplete their potting mix minerals. Feed with our cold-pressed organic kelp elixir or vermicompost bio-fertilizer every 2 to 3 weeks during active growth (February through October). Always apply feed to moist soil to prevent root shock.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export const TermsAndConditionsPage: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  const { settings } = useStoreSettings();
  const email = settings.contactEmail || 'contactus@buddy4plant.in';
  const phone = settings.contactPhone || '+91 80048 81668';
  const address = settings.storeAddress || 'Buddy4Plant Nursery, Lucknow, Uttar Pradesh, India';

  return (
    <div className="bg-[#FAF5EE] min-h-screen py-12 font-sans text-[#182018]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2">
            Legal &amp; Compliance
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#141C14] mt-1">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-[15px] text-[#5C554B] mt-3">
            Last Updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-white p-7 sm:p-11 border border-[#E8DFD3] rounded-3xl space-y-8 text-xs sm:text-sm text-[#5C554B] leading-relaxed shadow-sm">
          <div>
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">1. Agreement to Terms</h2>
            <p>
              Welcome to Buddy4Plant (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms &amp; Conditions govern your access to and use of our website, living plants catalog, gardening services, and online checkout portal. By accessing our platform or placing an order, you agree to be bound by these terms.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">2. Products, Living Plants &amp; Pricing</h2>
            <p>
              We specialize in plants, indoor plants, planters, organic soils, and landscaping services. Because living plants naturally vary in leaf shape, variegation, and height, photographs displayed are representative of healthy, mature specimens. All prices are listed in Indian Rupees (INR ₹) inclusive of applicable GST unless explicitly noted otherwise.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">3. Payment &amp; Security</h2>
            <p>
              Online payments are processed securely by Razorpay. We accept all major Credit/Debit Cards (Visa, MasterCard, RuPay, American Express), UPI, Net Banking, and select digital wallets. Cardholder data is securely tokenized and never stored on our local servers.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">4. Order Confirmation &amp; Fulfillment</h2>
            <p>
              Upon successful payment or COD authorization, an official electronic order receipt with a unique Order Number (e.g., B4P-XXXXXX) is generated and sent via email/SMS. Orders are inspected by our horticulturists in Lucknow and dispatched within 24–48 business hours with live courier tracking.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">5. 7-Day Live Plant Guarantee &amp; Returns</h2>
            <p>
              We stand behind every plant shipped from our nursery. If your plant arrives damaged or in poor health due to transit conditions, notify us within 7 calendar days of delivery with photos via WhatsApp or email for an immediate, free replacement or full refund.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">6. Intellectual Property &amp; Brand Rights</h2>
            <p>
              All proprietary botanical imagery, text, brand marks, logos, care guides, and design layouts are the exclusive property of Buddy4Plant. Unauthorized commercial reproduction or harvesting of site assets is strictly prohibited.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">7. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with these terms or transactions shall be subject to the exclusive jurisdiction of the competent courts in Lucknow, Uttar Pradesh.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD] bg-[#FAF5EE] p-5 rounded-2xl border border-[#E8DFD3]">
            <h3 className="font-editorial font-bold text-base text-[#141C14] mb-2">Merchant Contact Information</h3>
            <p className="text-xs text-[#5C554B]">
              <strong>Entity Name:</strong> Buddy4Plant Botanical Nursery<br />
              <strong>Operating Address:</strong> {address}<br />
              <strong>Support Email:</strong> <a href={`mailto:${email}`} className="text-[#1A3824] underline">{email}</a><br />
              <strong>WhatsApp:</strong> <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-[#1A3824] underline">Chat with us</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  const { settings } = useStoreSettings();
  const email = settings.contactEmail || 'contactus@buddy4plant.in';
  const address = settings.storeAddress || 'Buddy4Plant Nursery, Lucknow, Uttar Pradesh, India';

  return (
    <div className="bg-[#FAF5EE] min-h-screen py-12 font-sans text-[#182018]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2">
            Data Protection &amp; Trust
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#141C14] mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-[15px] text-[#5C554B] mt-3">
            How we protect your personal information, delivery addresses, and payment data.
          </p>
        </div>

        <div className="bg-white p-7 sm:p-11 border border-[#E8DFD3] rounded-3xl space-y-8 text-xs sm:text-sm text-[#5C554B] leading-relaxed shadow-sm">
          <div>
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">1. Information We Collect</h2>
            <p>
              When you browse our nursery catalog, create an account, or purchase plants, we collect necessary transactional information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[#5C554B]">
              <li><strong>Contact Details:</strong> Full Name, Email Address, and Mobile Phone Number.</li>
              <li><strong>Delivery Information:</strong> House/Flat address, Landmark, City, State, and PIN code.</li>
              <li><strong>Order History:</strong> Products purchased, payment receipts, order dates, and courier tracking numbers.</li>
              <li><strong>Technical Data:</strong> IP address, device browser type, and essential session cookies to remember your shopping cart.</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">2. How We Use Your Data</h2>
            <p>
              We process personal information strictly for legitimate commercial purposes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[#5C554B]">
              <li>Fulfilling and packing your plant orders at our nursery.</li>
              <li>Sharing delivery address and phone number with accredited courier partners (BlueDart, Delhivery) for doorstep shipment.</li>
              <li>Sending automated WhatsApp and email dispatch updates and tracking links.</li>
              <li>Providing responsive customer support and plant care assistance.</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">3. Payment Gateway Security (PCI-DSS Compliance)</h2>
            <p>
              All online card payments and UPI transactions are processed through our payment partner Razorpay. Buddy4Plant does NOT store, log, or have access to your full credit/debit card numbers, CVVs, or bank PINs.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">4. Cookies &amp; Local Storage</h2>
            <p>
              We use minimal, privacy-respecting cookies and browser local storage to maintain your authentication state, saved cart items, and wishlist preferences. We never sell or rent your personal browsing behavior to third-party ad networks.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">5. Data Retention &amp; Your Rights</h2>
            <p>
              You have the right to access, update, or request deletion of your saved delivery addresses and account profile at any time through your Account Dashboard or by contacting our grievance team at <a href={`mailto:${email}`} className="text-[#1A3824] underline">{email}</a>.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD] bg-[#FAF5EE] p-5 rounded-2xl border border-[#E8DFD3]">
            <h3 className="font-editorial font-bold text-base text-[#141C14] mb-2">Grievance &amp; Privacy Officer</h3>
            <p className="text-xs text-[#5C554B]">
              <strong>Buddy4Plant Data Protection Team</strong><br />
              {address}<br />
              Email: <a href={`mailto:${email}`} className="text-[#1A3824] underline">{email}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RefundPolicyPage: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  const { settings } = useStoreSettings();
  const email = settings.contactEmail || 'contactus@buddy4plant.in';
  const phone = settings.contactPhone || '+91 80048 81668';

  return (
    <div className="bg-[#FAF5EE] min-h-screen py-12 font-sans text-[#182018]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2">
            Hassle-Free Protection
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#141C14] mt-1">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs sm:text-[15px] text-[#5C554B] mt-3">
            Our 7-day live plant transit guarantee and straightforward refund process.
          </p>
        </div>

        <div className="bg-white p-7 sm:p-11 border border-[#E8DFD3] rounded-3xl space-y-8 text-xs sm:text-sm text-[#5C554B] leading-relaxed shadow-sm">
          <div>
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#1A3824]" />
              1. 7-Day Live Plant Replacement Guarantee
            </h2>
            <p>
              We pack every plant with moisture-lock root wrapping and corrugated transit armor. However, if your plant arrives wilted, broken, dried out, or damaged due to courier delays:
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-1.5 text-[#5C554B]">
              <li>Take a clear photo or short unboxing video of the plant and packaging within <strong>7 days</strong> of delivery.</li>
              <li>Send the photo along with your Order Number to our WhatsApp support at <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} className="text-[#1A3824] underline font-semibold">{phone}</a> or email <a href={`mailto:${email}`} className="text-[#1A3824] underline">{email}</a>.</li>
              <li>Our team will immediately approve and dispatch a fresh replacement plant free of cost, or initiate a full refund.</li>
            </ol>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">2. Order Cancellations</h2>
            <p>
              You can cancel your order any time before it is dispatched from our Lucknow nursery. To cancel an order, navigate to your Account Orders tab or contact our helpline with your order ID. Once dispatched and handed over to the courier partner, orders cannot be cancelled mid-transit.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">3. Non-Plant Goods Returns (Pots, Tools, Fertilizers)</h2>
            <p>
              Pots, planters, garden tools, and organic soil mixes can be returned within 7 days of delivery provided they are unused, in original packaging, and undamaged. Once received and inspected at our warehouse, your refund will be processed immediately.
            </p>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-3">4. Refund Processing &amp; Timeframe</h2>
            <p>
              Approved refunds are credited directly back to the original method of payment (credit card, debit card, net banking or UPI):
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-[#5C554B]">
              <li><strong>Online Card / UPI Payments:</strong> 5 to 7 business days depending on your issuing bank.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Refunded via direct bank account NEFT/IMPS transfer or UPI upon customer providing account details.</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-[#EFE8DD] bg-[#FAF5EE] p-5 rounded-2xl border border-[#E8DFD3]">
            <h3 className="font-editorial font-bold text-base text-[#141C14] mb-2">Need Help with a Return or Refund?</h3>
            <p className="text-xs text-[#5C554B]">
              WhatsApp Helpdesk: <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} className="text-[#1A3824] underline font-semibold">{phone}</a> (Mon–Sat, 9am–7pm)<br />
              Email: <a href={`mailto:${email}`} className="text-[#1A3824] underline">{email}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  return (
    <div className="bg-[#FAF5EE] min-h-screen py-12 font-sans text-[#182018]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.26em] block mb-2">
            Guaranteed Safe Delivery
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#141C14] mt-1">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs sm:text-[15px] text-[#5C554B] mt-3">
            Every buddy4plant order is dispatched in moisture-lock eco packaging designed to withstand up to 7 days of transit.
          </p>
        </div>

        <div className="bg-white p-7 sm:p-11 border border-[#E8DFD3] rounded-3xl space-y-7 text-xs sm:text-sm text-[#5C554B] leading-relaxed shadow-sm">
          <div>
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-2 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#1A3824]" />
              Shipping Timelines &amp; Courier Partners
            </h2>
            <p>
              We ship pan-India through trusted premier courier partners (BlueDart, Delhivery, Expressbees). Orders are inspected, soil-moisture balanced, and packed at our Lucknow nursery within 24–48 hours. Metro deliveries (including Delhi NCR, Mumbai, Bengaluru, Lucknow) typically arrive within 2–4 business days; rest of India takes 4–6 business days.
            </p>
          </div>

          <div className="pt-5 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-2 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#1A3824]" />
              Zero-Risk Transit Guarantee
            </h2>
            <p>
              If your plant arrives damaged, snapped, or excessively wilted during transit, send a photo to our WhatsApp Helpline (+91 80048 81668) or email contactus@buddy4plant.in within 7 days of delivery. We will immediately dispatch a fresh replacement plant free of cost—no questions asked!
            </p>
          </div>

          <div className="pt-5 border-t border-[#EFE8DD]">
            <h2 className="font-editorial font-bold text-lg sm:text-xl text-[#141C14] mb-2">
              Eco-Friendly Transit Box Technology
            </h2>
            <p>
              Our patented corrugated transit sleeves lock the pot firmly in place, keeping soil securely contained even when tilted upside down. Breathable micro-perforations ensure the foliage breathes freely while retaining critical root moisture.
            </p>
          </div>
        </div>

        {navigate && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/track-order')}
              className="px-7 py-3.5 bg-[#1A3824] hover:bg-[#20492C] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm cursor-pointer"
            >
              Track Your Active Shipment &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

