import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Phone,
  MessageCircle,
  Calendar,
  Building2,
  Home,
  Layers,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Send,
  Star,
  Clock,
  MapPin
} from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface ServiceTier {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  priceStarting: string;
  features: string[];
  image: string;
}

const SERVICES: ServiceTier[] = [
  {
    id: 'balcony-makeover',
    title: 'Balcony & Terrace Garden Transformations',
    subtitle: 'Turn compact urban balconies into lush private retreats',
    description: 'Custom end-to-end design, weatherproof railing planters, vertical trellis systems, organic soil layering, and automated drip irrigation for apartments and penthouses.',
    icon: 'fa-solid fa-cloud-sun',
    badge: 'Most Popular',
    priceStarting: 'Starting at ₹4,999',
    features: [
      'Site inspection & sunlight angle assessment',
      'Custom 3D layout & species recommendation',
      'Weatherproof planters & vertical wall mounts',
      'Enriched organic soil & 30-day growth guarantee',
      'Optional automated micro-drip irrigation timer'
    ],
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'corporate-office',
    title: 'Corporate & Commercial Biophilic Greenery',
    subtitle: 'Healthy indoor air & aesthetic foliage for high-growth workspaces',
    description: 'Transform boardrooms, breakout spaces, and reception atriums into tranquil biophilic havens that elevate employee focus and impress visiting clients.',
    icon: 'fa-solid fa-building',
    badge: 'Enterprise',
    priceStarting: 'Bespoke Turnkey Quotes',
    features: [
      'Comprehensive indoor air quality (AQI) optimization',
      'Self-watering architectural sub-irrigation planters',
      'Noise-dampening moss panels & living divider screens',
      'Zero-hassle weekly plant doctor maintenance visits',
      'Full seasonal plant rotation & health replacement'
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'vertical-gardens',
    title: 'Vertical Green Walls & Preserved Moss Art',
    subtitle: 'Living botanical walls with automated irrigation',
    description: 'Maximize green density without consuming floor space. Ideal for feature entryways, residential accent walls, restaurants, and luxury boutique hotels.',
    icon: 'fa-solid fa-layer-group',
    badge: 'Architectural',
    priceStarting: 'Starting at ₹450 / sq.ft',
    features: [
      'Patented modular moisture-lock vertical cassettes',
      'Zero-drip automatic closed-loop drip manifold',
      'Curated foliage patterns (ferns, philodendrons, syngoniums)',
      'Preserved zero-maintenance Scandinavian moss options',
      'Integrated LED grow-spectrum lighting design'
    ],
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'plant-maintenance',
    title: 'Plant Doctor & Routine Maintenance Visits',
    subtitle: 'Professional horticultural care for your existing flora',
    description: 'Keep your residential or commercial plants flourishing year-round with scheduled visits from our certified nursery botanists.',
    icon: 'fa-solid fa-heart-pulse',
    badge: 'Annual Care',
    priceStarting: 'Starting at ₹999 / visit',
    features: [
      'Professional pruning, leaf cleaning, & structural training',
      'Deep root aeration & slow-release organic bio-fertilizer',
      'Eco-friendly cold-pressed neem pest prevention treatment',
      'Repotting into larger planters with fresh organic humus',
      'Soil moisture sensor calibration & watering schedule'
    ],
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1000&auto=format&fit=crop&q=80'
  }
];

export const GardenServicesPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { settings } = useStoreSettings();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'Bengaluru',
    serviceType: 'Balcony & Terrace Garden Transformations',
    approxArea: 'Under 100 sq.ft',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const whatsappNum = (settings.whatsappSupportNumber || '919876543210').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-10 sm:py-14 font-sans text-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A]">
          <button onClick={() => navigate('/')} className="hover:text-[#141414] transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-[#1F3B22] font-semibold">Garden Services &amp; Landscaping</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF5EC] border border-[#C5E1C9]">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            Turnkey Green Design &amp; Landscaping
          </span>

          <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#142B1A] leading-[1.1]">
            Turn Your Living &amp; Work Spaces into Botanical Paradises
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-[#5C5C5C] leading-relaxed max-w-2xl mx-auto font-normal">
            From compact apartment balconies to luxury corporate atriums, our certified horticulturists handle design, plantation, drip irrigation, and ongoing nursery maintenance.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#book-consultation"
              className="pill-btn-dark px-7 py-3 text-xs font-bold uppercase tracking-wider shadow-md"
            >
              Book Free Site Consultation &rarr;
            </a>

            <a
              href={`https://wa.me/${whatsappNum}?text=Hi%20buddy4plant%20team%2C%20I%20am%20interested%20in%20your%20Garden%20Services%20and%20Landscaping%20consultation.`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-[#EBF7EE] text-[#1F4522] border border-[#BDE8C6] hover:bg-[#DCF2E0] rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Trust Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-[#E5E2D9] shadow-xs text-center">
          <div className="p-2">
            <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#1F3B22] block">500+</span>
            <span className="text-[11px] font-semibold text-[#5C5C5C] mt-0.5 block">Balconies Transformed</span>
          </div>
          <div className="p-2 border-l border-[#EAE7DF]">
            <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#1F3B22] block">40+</span>
            <span className="text-[11px] font-semibold text-[#5C5C5C] mt-0.5 block">Corporate Offices</span>
          </div>
          <div className="p-2 border-l border-[#EAE7DF]">
            <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#1F3B22] block">100%</span>
            <span className="text-[11px] font-semibold text-[#5C5C5C] mt-0.5 block">Acclimatized Flora</span>
          </div>
          <div className="p-2 border-l border-[#EAE7DF]">
            <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#1F3B22] block">4.9 ★</span>
            <span className="text-[11px] font-semibold text-[#5C5C5C] mt-0.5 block">Customer Rating</span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#142B1A]">
              Our Specialized Green Services
            </h2>
            <p className="text-xs text-[#7A7A7A] mt-2">
              Every project is handled by in-house landscape architects and nursery experts—never subcontracted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-3xl border border-[#E5E2D9] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#1F3B22]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 w-full bg-[#F3F1EB] overflow-hidden">
                    <img
                      src={srv.image}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="bg-[#1F3B22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        {srv.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs text-[#1F3B22] px-3.5 py-1 rounded-full text-xs font-extrabold shadow-md border border-[#E2ECE0]">
                      {srv.priceStarting}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-4">
                    <div>
                      <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#141414]">
                        {srv.title}
                      </h3>
                      <p className="text-xs text-[#2D6A4F] font-semibold mt-1">
                        {srv.subtitle}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-[#5C5C5C] leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#F2EFE8]">
                      {srv.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-[#4A4A4A]">
                          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-0">
                  <a
                    href="#book-consultation"
                    onClick={() => setFormData((prev) => ({ ...prev, serviceType: srv.title }))}
                    className="w-full py-3 bg-[#FAF9F5] hover:bg-[#1F3B22] text-[#1F3B22] hover:text-white border border-[#DDD9CF] hover:border-[#1F3B22] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Request Quotation for this Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Stepper */}
        <div className="bg-[#FAF9F5] rounded-3xl border border-[#E5E2D9] p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] block mb-1">
              Seamless Execution
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#142B1A]">
              How Your Garden Project Unfolds
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#1F3B22] text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h4 className="font-bold text-sm text-[#141414]">Site Audit</h4>
              <p className="text-xs text-[#6A6A6A] leading-relaxed">
                We assess your space, light hours, wind exposure, and water drainage points.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#1F3B22] text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h4 className="font-bold text-sm text-[#141414]">Botanical Design</h4>
              <p className="text-xs text-[#6A6A6A] leading-relaxed">
                Receive a 2D/3D plant layout, planter materials palette, and transparent price quotation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#1F3B22] text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h4 className="font-bold text-sm text-[#141414]">Green Installation</h4>
              <p className="text-xs text-[#6A6A6A] leading-relaxed">
                Our nursery team brings pre-conditioned specimens, enriched soil, and sets up irrigation in 1 day.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-2">
              <span className="w-8 h-8 rounded-full bg-[#1F3B22] text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h4 className="font-bold text-sm text-[#141414]">Guaranteed Growth</h4>
              <p className="text-xs text-[#6A6A6A] leading-relaxed">
                30-day free plant replacement guarantee plus scheduled plant doctor visits.
              </p>
            </div>
          </div>
        </div>

        {/* Consultation Booking Form Section */}
        <div id="book-consultation" className="bg-white rounded-3xl border border-[#E5E2D9] p-6 sm:p-12 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] block">
                Free Expert Consultation
              </span>
              <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#142B1A]">
                Schedule Your Site Consultation
              </h2>
              <p className="text-xs text-[#6A6A6A]">
                Share your requirements below and our landscape botanist will contact you within 4 hours.
              </p>
            </div>

            {submitted ? (
              <div className="bg-[#EBF5EC] border border-[#C5E1C9] p-8 rounded-2xl text-center space-y-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-[#1F3B22] text-white flex items-center justify-center mx-auto text-xl">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#142B1A]">
                  Consultation Request Received!
                </h3>
                <p className="text-xs text-[#3D6A48] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.fullName}</strong>. Our senior garden specialist will call you at <strong>{formData.phone}</strong> to confirm your site audit.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-[#1F3B22] underline hover:opacity-80"
                  >
                    Submit another consultation inquiry &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CF] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#1F3B22]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CF] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#1F3B22]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                      City / Location *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CF] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#1F3B22]"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Delhi-NCR">Delhi / Gurgaon / Noida</option>
                      <option value="Mumbai">Mumbai / Pune</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Other">Other City</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                      Service Interested In
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CF] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#1F3B22]"
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                    Approximate Balcony / Garden Size
                  </label>
                  <select
                    value={formData.approxArea}
                    onChange={(e) => setFormData({ ...formData, approxArea: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CF] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#1F3B22]"
                  >
                    <option value="Under 100 sq.ft">Compact Balcony (Under 100 sq.ft)</option>
                    <option value="100 - 300 sq.ft">Medium Balcony / Deck (100 - 300 sq.ft)</option>
                    <option value="300 - 800 sq.ft">Terrace / Penthouse Garden (300 - 800 sq.ft)</option>
                    <option value="Over 800 sq.ft">Villa Lawn / Corporate Space (Over 800 sq.ft)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1">
                    Special Notes or Preferred Plants (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about sunlight exposure, pets at home, or specific plant preferences..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#DDD9CF] rounded-xl text-xs text-[#141414] focus:outline-none focus:border-[#1F3B22]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1F3B22] hover:bg-[#162D19] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Free Site Inspection &amp; Quote</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
