import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  Leaf,
  Sparkles,
  ArrowRight,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Mail,
  Check
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useStoreSettings();
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setIsSubscribed(true);
      setEmailInput('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#FAF9F5] text-[#141414] border-t border-[#E8E5DC] transition-colors">
      {/* Top Editorial Botanical Statement & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 border-b border-[#E8E5DC]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center justify-between">
          <div className="lg:col-span-7">
            <div className="cursor-pointer inline-block" onClick={() => navigate('/')}>
              <div className="flex items-center gap-3">
                <span className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141414]">
                  buddy4plant
                </span>
                <span className="text-[10px] font-bold tracking-[0.24em] text-[#5B6E58] uppercase border-l border-[#DCD7CB] pl-3 py-0.5">
                  Botanical Studio
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-[#5C5C5C] leading-relaxed max-w-xl font-normal">
              Cultivating mindful living spaces through hand-nurtured botanical flora, microbiome-rich organic soil,
              and artisanal planters designed to endure.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-[#F2EFE8] p-5 sm:p-6 rounded-3xl border border-[#E2DED4]">
              <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.22em] block mb-1.5">
                The Botanical Journal
              </span>
              <p className="text-xs text-[#525252] mb-3">
                Subscribe for seasonal watering rhythms, rare specimen drops, and indoor styling guides.
              </p>

              {isSubscribed ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1F3B22] bg-white px-4 py-2.5 rounded-full border border-[#D5DEC4]">
                  <Check className="w-4 h-4 text-[#1F3B22]" />
                  <span>Welcome to the journal. Check your inbox soon!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    className="grow bg-white border border-[#DDD9CF] px-4 py-2.5 rounded-full text-xs text-[#141414] placeholder-[#8A8A8A] focus:outline-none focus:border-[#1F3B22] focus:ring-1 focus:ring-[#1F3B22]"
                  />
                  <button
                    type="submit"
                    className="pill-btn-dark px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider shrink-0"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Clean Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Collections */}
          <div>
            <h4 className="text-[10px] font-bold text-[#141414] uppercase tracking-[0.24em] mb-4">
              Flora Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#5C5C5C]">
              <li>
                <button onClick={() => navigate('/plants/indoor-plants')} className="hover:text-[#1F3B22] transition-colors">
                  Indoor Foliage Plants
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/air-purifying')} className="hover:text-[#1F3B22] transition-colors">
                  NASA Air Cleaners
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/low-maintenance')} className="hover:text-[#1F3B22] transition-colors">
                  Low Maintenance &amp; Beginner
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/cacti-succulents')} className="hover:text-[#1F3B22] transition-colors">
                  Rare Cacti &amp; Succulents
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/combos')} className="hover:text-[#1F3B22] transition-colors">
                  Curated Sanctuary Packs
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Plant Doctor Clinic */}
          <div>
            <h4 className="text-[10px] font-bold text-[#141414] uppercase tracking-[0.24em] mb-4">
              Plant Care Clinic
            </h4>
            <ul className="space-y-2.5 text-xs text-[#5C5C5C]">
              <li>
                <button onClick={() => navigate('/plant-doctor')} className="hover:text-[#1F3B22] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F3B22]" />
                  WhatsApp Diagnosis Clinic
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/care-guide')} className="hover:text-[#1F3B22] transition-colors">
                  Seasonal Watering Rhythms
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/care-guide')} className="hover:text-[#1F3B22] transition-colors">
                  Organic Soil &amp; Repotting
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/care-guide')} className="hover:text-[#1F3B22] transition-colors">
                  Natural Pest Prevention
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: The Sanctuary */}
          <div>
            <h4 className="text-[10px] font-bold text-[#141414] uppercase tracking-[0.24em] mb-4">
              The Sanctuary
            </h4>
            <ul className="space-y-2.5 text-xs text-[#5C5C5C]">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#1F3B22] transition-colors">
                  Our Nursery Origins
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#1F3B22] transition-colors">
                  Botanical Ethics &amp; Peat-Free
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/reviews')} className="hover:text-[#1F3B22] transition-colors">
                  Verified Plant Parent Stories
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#1F3B22] transition-colors">
                  Sustainable Packaging Standard
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Client Services */}
          <div>
            <h4 className="text-[10px] font-bold text-[#141414] uppercase tracking-[0.24em] mb-4">
              Support &amp; Studio
            </h4>
            <ul className="space-y-2.5 text-xs text-[#5C5C5C]">
              <li>
                <button
                  onClick={() => navigate('/b4padmin')}
                  className="hover:text-[#1F3B22] transition-colors flex items-center gap-1.5 font-bold text-[#2D4A27]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D4A27]" />
                  Admin Portal &amp; CMS
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/my-orders')} className="hover:text-[#1F3B22] transition-colors">
                  Track Live Orders
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shipping-policy')} className="hover:text-[#1F3B22] transition-colors">
                  14-Day Transit Health Guarantee
                </button>
              </li>
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-[#1F3B22] transition-colors block">
                  {settings.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${(settings.whatsappSupportNumber || '919876543210').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1F3B22] transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#1F3B22]" />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Minimal Bottom Bar */}
      <div className="border-t border-[#E8E5DC] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7A7A7A]">
          <div>
            &copy; {new Date().getFullYear()} buddy4plant Studio. Handcrafted for mindful botanical living.
          </div>

          {/* Clean Social Icons */}
          <div className="flex items-center space-x-5 text-[#5C5C5C]">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-[#1F3B22] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-[#1F3B22] transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="hover:text-[#1F3B22] transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-[#141414] transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#141414] transition-colors">
              Terms
            </button>
            <button onClick={() => navigate('/shipping-policy')} className="hover:text-[#141414] transition-colors">
              Shipping &amp; Returns
            </button>
            <button onClick={() => navigate('/b4padmin')} className="hover:text-[#141414] transition-colors font-medium text-[#2D4A27]">
              Admin Console
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
