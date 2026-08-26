import React from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Buddy4PlantLogo } from './Buddy4PlantLogo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useStoreSettings();

  return (
    <footer className="bg-[#182319] text-[#D5DCD4] pt-16 pb-12 border-t border-[#2A3B2C]">
      {/* Brand Trust Metrics Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#2A3B2C]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-[#2D4A27]/60 border border-[#406837] flex items-center justify-center text-[#A3B899] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#FDFCF9] text-sm">Safe Transit Packaging</h4>
              <p className="text-xs text-[#95A593] mt-1 leading-relaxed font-light">
                Specialized breathable honeycomb boxes guaranteed to arrive healthy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-[#2D4A27]/60 border border-[#406837] flex items-center justify-center text-[#A3B899] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#FDFCF9] text-sm">Plant Health Warranty</h4>
              <p className="text-xs text-[#95A593] mt-1 leading-relaxed font-light">
                Free replacement if any plant arrives damaged or stressed within 7 days.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-[#2D4A27]/60 border border-[#406837] flex items-center justify-center text-[#A3B899] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#FDFCF9] text-sm">Organic Nursery Grown</h4>
              <p className="text-xs text-[#95A593] mt-1 leading-relaxed font-light">
                Nurtured with organic bio-stimulants and cold-pressed neem nutrients.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-[#2D4A27]/60 border border-[#406837] flex items-center justify-center text-[#A3B899] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#FDFCF9] text-sm">Free Plant Doctor Support</h4>
              <p className="text-xs text-[#95A593] mt-1 leading-relaxed font-light">
                Lifetime WhatsApp guidance from our horticulturists for all your greens.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <Buddy4PlantLogo size={46} textColor="#FDFCF9" />
            </div>
            <p className="text-xs text-[#95A593] leading-relaxed max-w-sm font-light">
              We bring sustainable greenery into modern living spaces. Every plant is acclimatized,
              potted in premium soil, and shipped directly from our botanical nurseries across India.
            </p>
            <div className="pt-2 space-y-2 text-xs text-[#95A593]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A3B899] shrink-0" />
                <span>{settings.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#A3B899] shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-[#FDFCF9]">
                  {settings.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#A3B899] shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-[#FDFCF9]">
                  {settings.contactPhone}
                </a>
              </div>
              {settings.whatsappSupportNumber && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://wa.me/${settings.whatsappSupportNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2D4A27] border border-[#45703C] text-[#D8E6D4] text-[10px] font-bold uppercase tracking-wider hover:bg-[#385B30] transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Plant Care Clinic
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-[10px] font-bold text-[#FDFCF9] uppercase tracking-[0.25em] mb-4">
              Explore Plants
            </h4>
            <ul className="space-y-2.5 text-xs text-[#95A593]">
              <li>
                <button onClick={() => navigate('/plants/indoor-plants')} className="hover:text-[#FDFCF9]">
                  Indoor Foliage
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/air-purifying')} className="hover:text-[#FDFCF9]">
                  Air Purifiers
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/low-maintenance')} className="hover:text-[#FDFCF9]">
                  Low Maintenance
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/cacti-succulents')} className="hover:text-[#FDFCF9]">
                  Cacti & Succulents
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/flowering-plants')} className="hover:text-[#FDFCF9]">
                  Flowering Beauties
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/combos')} className="hover:text-[#A3B899] text-[#A3B899] font-medium">
                  Curated Bundles
                </button>
              </li>
            </ul>
          </div>

          {/* Planters & Care */}
          <div>
            <h4 className="text-[10px] font-bold text-[#FDFCF9] uppercase tracking-[0.25em] mb-4">
              Planters & Care
            </h4>
            <ul className="space-y-2.5 text-xs text-[#95A593]">
              <li>
                <button onClick={() => navigate('/plants/pots-planters')} className="hover:text-[#FDFCF9]">
                  Artisan Ceramic Pots
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/pots-planters')} className="hover:text-[#FDFCF9]">
                  Self-Watering Pots
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/plant-care')} className="hover:text-[#FDFCF9]">
                  Neem Pest Defense
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/plants/plant-care')} className="hover:text-[#FDFCF9]">
                  Enriched Potting Mix
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/track-order')} className="hover:text-[#FDFCF9]">
                  Track Live Delivery
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-[10px] font-bold text-[#FDFCF9] uppercase tracking-[0.25em] mb-4">
              Join The Green Club
            </h4>
            <p className="text-xs text-[#95A593] mb-3 leading-relaxed font-light">
              Get ₹100 off your first botanical order and weekly plant care tips.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full px-3.5 py-2.5 bg-[#233124] border border-[#3A4E3B] text-xs text-[#FDFCF9] placeholder-[#7A8E7C] focus:outline-none focus:border-[#52B788]"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#2D4A27] hover:bg-[#385B30] text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Subscribe & Get 10% Off
              </button>
            </form>

            <div className="flex items-center space-x-3 mt-5">
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 bg-[#233124] border border-[#3A4E3B] flex items-center justify-center text-[#95A593] hover:text-[#A3B899] hover:border-[#52B788] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 bg-[#233124] border border-[#3A4E3B] flex items-center justify-center text-[#95A593] hover:text-[#A3B899] hover:border-[#52B788] transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 bg-[#233124] border border-[#3A4E3B] flex items-center justify-center text-[#95A593] hover:text-[#A3B899] hover:border-[#52B788] transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar & Payment Badges */}
        <div className="mt-12 pt-8 border-t border-[#2A3B2C] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8A9B89]">
          <p>© {new Date().getFullYear()} buddy4plant. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#8A9B89]">
            <span className="font-bold text-[#D5DCD4]">Secure Payments:</span>
            <span className="bg-[#233124] border border-[#3A4E3B] px-2 py-0.5 text-[#D5DCD4]">UPI</span>
            <span className="bg-[#233124] border border-[#3A4E3B] px-2 py-0.5 text-[#D5DCD4]">Cards</span>
            <span className="bg-[#233124] border border-[#3A4E3B] px-2 py-0.5 text-[#D5DCD4]">NetBanking</span>
            <span className="bg-[#233124] border border-[#3A4E3B] px-2 py-0.5 text-[#D5DCD4]">COD Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
