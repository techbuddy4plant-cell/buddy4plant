import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  CloudRain,
  Droplets,
  Flower2,
  Home,
  Landmark,
  Leaf,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sprout,
  Sun,
  Trees,
  User,
  Wrench,
  X,
} from '../common/Icons';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { getProjects } from '../../services/projectService';
import { saveServiceEnquiry } from '../../services/enquiryService';
import { LANDSCAPE_PROJECTS } from '../../data/landscapeProjects';
import { BotanicalProject } from '../../types';
import { setSeo, breadcrumbLd, ORG_ID } from '../../utils/seo';
import { ProjectMediaSection, ProjectMediaBadge } from './ProjectMedia';
import { resolveGardenContent } from '../../data/gardenServicesContent';

const GARDEN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark, CalendarCheck, Home, Building2, Trees, MapPin, Sprout, Leaf, Flower2, ShieldCheck, Sun, CloudRain, Snowflake, Droplets, Wrench, Sparkles,
};
const gIcon = (name?: string) => GARDEN_ICONS[name || ''] || Leaf;

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const SERVICES = [
  {
    id: 'institutional',
    icon: Landmark,
    title: 'Institutional & Campus Landscaping',
    text: 'Complete landscaping for government offices, training institutes, colleges, industrial units and defence campuses - from layout to lawns, hedges, green belts and plantation.',
    points: ['Site survey & landscape layout', 'Lawn, hedge & green-belt development', 'Large-scale plantation drives'],
  },
  {
    id: 'amc',
    icon: CalendarCheck,
    title: 'Annual Maintenance Contracts (AMC)',
    text: 'Year-round garden care by trained gardeners - mowing, pruning, weeding, manuring, seasonal flowers and plant replacement, on a fixed yearly contract.',
    points: ['Scheduled gardener visits or deployment', 'Seasonal flower & plant replacement', 'Monthly work reporting'],
  },
  {
    id: 'home',
    icon: Home,
    title: 'Home, Balcony & Terrace Gardens',
    text: 'Beautiful green corners for homes and apartments - balcony makeovers, terrace gardens, kitchen gardens and small lawns designed for Lucknow weather.',
    points: ['Plant selection for your sunlight', 'Pots, planters & soil setup', 'Drip / easy watering options'],
  },
  {
    id: 'office',
    icon: Building2,
    title: 'Office & Indoor Plant Styling',
    text: 'Healthy indoor plants for offices, reception areas and showrooms, with regular care visits so they always look fresh.',
    points: ['Low-light, air-purifying plants', 'Matching planters for your interiors', 'Routine care & replacement'],
  },
];

const STEPS = [
  { title: 'Site Visit', text: 'We visit, measure the area and check sunlight, soil, water and drainage.' },
  { title: 'Design & Quote', text: 'You get a clear layout, plant list and a transparent quotation.' },
  { title: 'Execution', text: 'Our team prepares soil, lays lawns and does the plantation on schedule.' },
  { title: 'Care & AMC', text: 'Regular maintenance keeps your garden green and healthy all year.' },
];

const SEASONS = [
  {
    id: 'summer',
    label: 'Summer',
    months: 'Apr - Jun',
    icon: Sun,
    tips: [
      { t: 'Water at the right time', d: 'Water early morning or after sunset. Midday water evaporates fast and can scorch leaves.' },
      { t: 'Mulch the soil', d: 'A 2-3 inch layer of dry leaves or cocopeat keeps roots cool and saves water.' },
      { t: 'Use shade net', d: 'Give delicate plants 50% green shade net during peak afternoon heat.' },
      { t: 'Keep lawn grass taller', d: 'Mow at 2.5-3 inches in summer - taller grass shades its own roots and stays green.' },
    ],
  },
  {
    id: 'monsoon',
    label: 'Monsoon',
    months: 'Jul - Sep',
    icon: CloudRain,
    tips: [
      { t: 'Best time to plant', d: 'Monsoon is ideal for planting trees, shrubs and new lawn grass - roots settle quickly.' },
      { t: 'Check drainage', d: 'Clear pot holes and garden drains. Standing water rots roots faster than anything else.' },
      { t: 'Water less', d: 'Skip watering on rainy days and check the top inch of soil before watering again.' },
      { t: 'Stop fungus early', d: 'Spray diluted neem oil every 10-15 days to prevent fungal spots and pests.' },
    ],
  },
  {
    id: 'winter',
    label: 'Winter',
    months: 'Nov - Feb',
    icon: Snowflake,
    tips: [
      { t: 'Plant seasonal flowers', d: 'Marigold, petunia, calendula, pansy and dahlia give colour right through winter.' },
      { t: 'Protect from cold nights', d: 'Cover tender plants on the coldest nights of Dec-Jan and keep indoor plants away from cold windows.' },
      { t: 'Water in the daytime', d: 'Water less often and around midday so the soil does not stay cold and wet overnight.' },
      { t: 'Feed with compost', d: 'Mix vermicompost into beds - plants grow slowly now and organic feed works gently.' },
    ],
  },
  {
    id: 'year',
    label: 'All Year',
    months: 'Every month',
    icon: Sprout,
    tips: [
      { t: 'Feed every 30-45 days', d: 'Add a handful of vermicompost or organic plant food around each plant.' },
      { t: 'Prune regularly', d: 'Trim dry and yellow leaves and shape hedges - it keeps plants bushy and healthy.' },
      { t: 'Loosen the soil', d: 'Gently hoe the top soil once a month so air and water reach the roots.' },
      { t: 'Check under leaves', d: 'Look under leaves weekly for pests - early spotting means easy, organic control.' },
    ],
  },
];

const FAQS = [
  {
    q: 'Do you take government and institutional projects?',
    a: 'Yes. We handle landscaping and Annual Maintenance Contracts for government departments, training institutes, colleges, industrial units and PSU sites - including UP 112, Van Nigam, Nagar Nigam Lucknow and multiple GITI campuses.',
  },
  {
    q: 'What is included in an AMC?',
    a: 'An AMC covers regular garden work for a full year - lawn mowing, pruning, weeding, manuring, pest control, seasonal flower plantation and replacement of dead plants. The exact scope is decided after a site visit.',
  },
  {
    q: 'Which areas do you serve?',
    a: 'We work across Uttar Pradesh and Delhi - Lucknow, Kanpur and other UP districts, and Delhi NCR. For projects in other cities, send an enquiry and our team will get in touch.',
  },
  {
    q: 'Do you also do small home gardens?',
    a: 'Absolutely - balcony gardens, terrace gardens, kitchen gardens and small lawns. No job is too small.',
  },
  {
    q: 'Can I just ask for gardening advice?',
    a: 'Yes! Choose "Gardening help & tips" in the form below and describe your problem. A photo on WhatsApp helps us answer faster.',
  },
];

const ENQUIRY_TYPES = [
  'New landscaping project',
  'Annual maintenance (AMC)',
  'Garden / lawn maintenance',
  'Balcony & terrace garden',
  'Indoor & office plants',
  'Gardening help & tips',
];
const PROPERTY_TYPES = [
  'Home / Villa',
  'Apartment / Balcony',
  'Office / Corporate',
  'Government / Institution',
  'School / College',
  'Industrial / Factory',
  'Petrol pump / Commercial',
];
const CITIES = ['Lucknow', 'Kanpur', 'Hardoi', 'Barabanki', 'Unnao', 'Sitapur', 'Raebareli', 'Other (Uttar Pradesh)', 'Outside Uttar Pradesh'];
const AREAS = [
  'Balcony / terrace (under 500 sq.ft)',
  'Small garden (500 - 2,000 sq.ft)',
  'Medium campus (2,000 - 20,000 sq.ft)',
  'Large campus (1 acre +)',
  'Not sure yet',
];

/* ------------------------------------------------------------------ */
/* Small animated helpers                                              */
/* ------------------------------------------------------------------ */

const ease = [0.22, 1, 0.36, 1] as const;

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; y?: number }> = ({
  children,
  delay = 0,
  className,
  y = 28,
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.7, delay, ease }}
  >
    {children}
  </motion.div>
);

const CountUp: React.FC<{ to: number; suffix?: string }> = ({ to, suffix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, { duration: 1.8, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
};

const LeafShape: React.FC<{ className?: string; color?: string }> = ({ className, color = '#8CC084' }) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <path d="M34 4C18 4 6 14 6 30c0 2 .3 4 .8 6C10 22 18 14 30 10 20 16 13 24 10 35 26 36 36 24 34 4z" fill={color} />
  </svg>
);

const FloatingLeaves: React.FC = () => {
  const reduce = useReducedMotion();
  const leaves = [
    { l: '6%', t: '18%', s: 34, d: 0, c: '#8CC084' },
    { l: '88%', t: '12%', s: 26, d: 1.2, c: '#D9A441' },
    { l: '78%', t: '72%', s: 40, d: 0.6, c: '#5E9C57' },
    { l: '14%', t: '78%', s: 22, d: 1.8, c: '#B7D7A8' },
    { l: '48%', t: '8%', s: 18, d: 2.4, c: '#8CC084' },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {leaves.map((lf, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: lf.l, top: lf.t, width: lf.s, height: lf.s }}
          animate={reduce ? undefined : { y: [0, -18, 0], rotate: [0, 14, -6, 0] }}
          transition={{ duration: 7 + i, repeat: Infinity, ease: 'easeInOut', delay: lf.d }}
        >
          <LeafShape className="w-full h-full opacity-70" color={lf.c} />
        </motion.div>
      ))}
    </div>
  );
};

const Marquee: React.FC<{ items: string[] }> = ({ items }) => {
  const reduce = useReducedMotion();
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-3 w-max"
        animate={reduce ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      >
        {row.map((name, i) => (
          <span
            key={i}
            className="whitespace-nowrap px-5 py-2.5 rounded-full bg-white border border-[#E2DDD0] text-xs font-semibold text-[#1F3B22] flex items-center gap-2 shadow-xs"
          >
            <Leaf className="w-3.5 h-3.5 text-[#2D6A4F]" />
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Project card + modal                                                */
/* ------------------------------------------------------------------ */

const categoryIcon = (cat: string) => {
  if (cat.startsWith('Education')) return Sprout;
  if (cat.startsWith('Defence')) return ShieldCheck;
  if (cat.startsWith('Commercial')) return Building2;
  if (cat.startsWith('Residential')) return Home;
  return Landmark;
};

const ProjectCard: React.FC<{ project: BotanicalProject; index: number; onOpen: () => void }> = ({ project, onOpen }) => {
  const sites = project.sites || [];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-[#173A22] flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E8B4E] focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#22402A]">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#173A22]">
          {project.category}
        </span>
        <ProjectMediaBadge project={project} className="absolute bottom-3 left-3" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-6 sm:py-7">
        <h3 className="font-editorial text-lg sm:text-[1.35rem] font-semibold text-white leading-snug">{project.title}</h3>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          {project.location}
          {sites.length > 1 ? ` · ${sites.length} sites` : ''}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#BFE3B0] underline-offset-4 group-hover:underline">
          View project <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

const ProjectModal: React.FC<{ project: BotanicalProject; onClose: () => void; onEnquire: () => void }> = ({
  project,
  onClose,
  onEnquire,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  const sites = project.sites || [];
  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn">
      <div className="absolute inset-0 bg-[#0E1C11]/70 backdrop-blur-xs" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-[#FAF5EE] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8DFD3]"
      >
        <div className="relative aspect-[16/8] overflow-hidden">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/85 to-transparent" />
          <div className="absolute bottom-5 left-6 right-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CFE3C4] font-sans">{project.category}</span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-tight mt-1">{project.title}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white text-[#142B1A] flex items-center justify-center shadow-md hover:rotate-90 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {project.client && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD3]">
                <span className="block text-[10px] uppercase tracking-wider text-[#7A746B] font-bold mb-1 font-sans">Client</span>
                <span className="font-semibold text-[#141C14]">{project.client}</span>
              </div>
            )}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFD3]">
              <span className="block text-[10px] uppercase tracking-wider text-[#7A746B] font-bold mb-1 font-sans">Location</span>
              <span className="font-semibold text-[#141C14]">{project.location}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#5C554B] leading-relaxed">{project.description}</p>
          {sites.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141C14] block mb-2 font-sans">
                {sites.length} Sites Covered
              </span>
              <div className="flex flex-wrap gap-2">
                {sites.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full bg-[#EBF5EC] border border-[#C5E1C9] text-xs font-semibold text-[#1A3824] inline-flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3 text-[#1A3824]" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          <ProjectMediaSection project={project} />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141C14] block mb-2 font-sans">Scope & Botanical Work Done</span>
            <div className="grid sm:grid-cols-2 gap-2">
              {project.plantHighlights.map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs text-[#332E27] bg-white p-2.5 rounded-xl border border-[#E8DFD3]">
                  <CheckCircle2 className="w-4 h-4 text-[#1A3824] shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onEnquire}
            className="w-full pill-btn-dark py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            Enquire About a Similar Space <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const prettyPhone = (n: string) => {
  const d = String(n).replace(/\D/g, '');
  const m = d.match(/^91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : `+${d}`;
};


/** "Trusted by": the real client names in a quiet grid */
const TrustedList: React.FC<{ label: string; names: string[] }> = ({ label, names }) => {
  const items = names.filter((n, i) => n && names.indexOf(n) === i).slice(0, 12);
  if (items.length === 0) return null;
  return (
    <section>
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#486B44]">{label}</p>
        <h2 className="font-editorial text-[1.75rem] sm:text-4xl font-bold text-[#141C14] leading-tight mt-3">Gardens we look after</h2>
        <p className="text-sm text-[#6B645A] mt-3 leading-relaxed">
          Government offices, training institutes, defence units and campuses across Uttar Pradesh.
        </p>
      </div>
      <ul className="mt-8 sm:mt-10 grid grid-cols-2 lg:grid-cols-4 border-t border-l border-[#E3DBCD] bg-white/60">
        {items.map((n) => (
          <li
            key={n}
            className="border-r border-b border-[#E3DBCD] px-4 py-6 sm:px-6 sm:py-8 flex items-center justify-center text-center font-editorial text-[15px] sm:text-lg font-semibold text-[#24382A] leading-snug"
          >
            {n}
          </li>
        ))}
      </ul>
    </section>
  );
};

/** Text field with a leading icon (placeholder doubles as the label) */
const IconField: React.FC<{ icon: React.ComponentType<{ className?: string }>; error?: string; children: React.ReactNode }> = ({
  icon: Icon,
  error,
  children,
}) => (
  <div>
    <div
      className={`flex items-center gap-3 h-12 px-4 rounded-xl bg-white border transition-colors ${
        error ? 'border-[#D64545]' : 'border-[#DCD3C4] focus-within:border-[#1F6B3A] focus-within:ring-2 focus-within:ring-[#1F6B3A]/15'
      }`}
    >
      <Icon className="w-[18px] h-[18px] text-[#6E7769] shrink-0" />
      {children}
    </div>
    {error && <span className="text-xs text-[#C93C3C] mt-1.5 block">{error}</span>}
  </div>
);
const fieldInput = 'flex-1 min-w-0 h-full bg-transparent text-[15px] text-[#182018] placeholder:text-[#8C887F] focus:outline-none';

/** One-tap choice buttons instead of a dropdown */
const ChoiceChips: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void }> = ({
  label,
  options,
  value,
  onChange,
}) => (
  <fieldset>
    <legend className="text-sm font-semibold text-[#1F4A2C] mb-2.5">{label.replace(/\s*\*$/, '')}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            type="button"
            key={o}
            aria-pressed={active}
            onClick={() => onChange(o)}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              active ? 'bg-[#1F6B3A] border-[#1F6B3A] text-white' : 'bg-white border-[#DCD3C4] text-[#2B2A26] hover:border-[#1F6B3A]'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  </fieldset>
);

/** "Full Name *" -> "Full Name*" for use as a placeholder */
const asPlaceholder = (label: string) => label.replace(/\s+\*$/, '*');

const emptyForm = {
  fullName: '',
  phone: '',
  email: '',
  organisation: '',
  enquiryType: ENQUIRY_TYPES[0],
  propertyType: PROPERTY_TYPES[0],
  city: CITIES[0],
  area: AREAS[4],
  message: '',
};

export const GardenServicesPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { settings, homepageCMS } = useStoreSettings();
  const cms = homepageCMS as any;
  // All page text, lists and photos (editable in Admin > Gardening Services > Page Content)
  const C = useMemo(() => resolveGardenContent(cms.gardenServicesContent, cms), [cms]);
  const SERVICES = C.services.map((sv) => ({ ...sv, icon: gIcon(sv.icon) }));
  const STEPS = C.process.steps;
  const SEASONS = C.tips.seasons.length ? C.tips.seasons.map((se) => ({ ...se, icon: gIcon(se.icon) })) : [{ id: 'none', label: '', months: '', icon: Leaf, tips: [] as { t: string; d: string }[] }];
  const FAQS = C.faq.items;
  const ENQUIRY_TYPES = C.form.enquiryTypes;
  const PROPERTY_TYPES = C.form.propertyTypes;
  const CITIES = C.form.cities;
  const AREAS = C.form.areas;
  const HELP = C.form.helpType;
  const reduce = useReducedMotion();
  useEffect(() => {
    setSeo({
      title: C.seo.title,
      description: C.seo.description,
      path: '/garden-services',
      image: '/projects/giti-campuses.jpg',
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'Service', serviceType: 'Landscaping and gardening services', provider: { '@id': ORG_ID }, areaServed: ['Lucknow', 'Kanpur', 'Uttar Pradesh', 'Delhi'] },
        breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Gardening Services', path: '/garden-services' }]),
      ],
    });
  }, [C.seo.title, C.seo.description]);
  const [projects, setProjects] = useState<BotanicalProject[]>(LANDSCAPE_PROJECTS);
  const [filter, setFilter] = useState('All');
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [openProject, setOpenProject] = useState<BotanicalProject | null>(null);
  const [season, setSeason] = useState(SEASONS[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');
  const [waConfirmed, setWaConfirmed] = useState(false);

  useEffect(() => {
    const load = () =>
      getProjects().then((data) => {
        const list = (data || []).filter((p) => p.active !== false);
        if (list.length) setProjects(list);
      });
    load();
    window.addEventListener('b4p_store_data_changed', load);
    return () => window.removeEventListener('b4p_store_data_changed', load);
  }, []);

  const whatsappNum = (settings.whatsappSupportNumber || '918004881668').replace(/[^0-9]/g, '');
  // Card order set in Admin > Gardening Services > Arrange project cards
  const orderedProjects = useMemo(() => {
    const order = C.projectOrder || [];
    if (!order.length) return projects;
    const pos = new Map(order.map((id, i) => [id, i] as [string, number]));
    return projects
      .map((p, i) => ({ p, i }))
      .sort((a, b) => (pos.get(a.p.id) ?? 1e6 + a.i) - (pos.get(b.p.id) ?? 1e6 + b.i))
      .map((x) => x.p);
  }, [projects, C.projectOrder]);
  const workProjects = useMemo(() => orderedProjects.filter((p) => p.segment !== 'private'), [orderedProjects]);
  const privateProjects = useMemo(() => orderedProjects.filter((p) => p.segment === 'private'), [orderedProjects]);
  const showPrivate = C.privateSection.enabled && privateProjects.length > 0;
  const categories = useMemo(() => ['All', ...Array.from(new Set(workProjects.map((p) => p.category)))], [workProjects]);
  const shown = filter === 'All' ? workProjects : workProjects.filter((p) => p.category === filter);
  const siteCount = projects.reduce((n, p) => n + Math.max(1, (p.sites || []).length), 0);
  const multiSite = projects.reduce((m, p) => Math.max(m, (p.sites || []).length), 0);
  const clientNames = workProjects.map((p) => p.client || p.title);
  const statItems = C.stats.map((raw) => ({
    n: raw.value === 'auto:projects' ? workProjects.length : raw.value === 'auto:sites' ? siteCount : raw.value === 'auto:multisite' ? multiSite : Number(raw.value) || 0,
    s: raw.suffix,
    label: raw.label,
    icon: gIcon(raw.icon),
  }));
  // short client names for the line under the form ("UP 112 (Emergency ...)" -> "UP 112")
  const shortClients = Array.from(new Set(clientNames.map((n) => n.replace(/\s*\(.*?\)\s*/g, ' ').split(',')[0].trim()).filter(Boolean))).slice(0, 4);
  const heroPool: BotanicalProject[] = C.hero.images.length
    ? C.hero.images.map((img, k) => ({ id: `hero-${k}-${img}`, image: img, title: '', category: '', location: '', description: '', speciesCount: 0, plantHighlights: [], tag: '' }))
    : projects;

  // Hero parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroCardsY = useTransform(heroProgress, [0, 1], [0, reduce ? 0 : 120]);
  const heroTextY = useTransform(heroProgress, [0, 1], [0, reduce ? 0 : 60]);

  // Process line
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsProgress } = useScroll({ target: stepsRef, offset: ['start 80%', 'end 60%'] });

  // Rotating hero covers
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (reduce || heroPool.length < 3) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroPool.length), 3500);
    return () => clearInterval(t);
  }, [reduce, heroPool.length]);
  const heroCards = [0, 1, 2].map((k) => heroPool[(heroIdx + k) % Math.max(heroPool.length, 1)]).filter(Boolean);

  const scrollToForm = () => document.getElementById('book-consultation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // "Inquire Now" in the header links here with ?enquire=1
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('enquire') === '1') {
      const t = setTimeout(scrollToForm, 400);
      return () => clearTimeout(t);
    }
  }, []);

  const enquireFor = (p: BotanicalProject) => {
    setOpenProject(null);
    setForm((f) => ({
      ...f,
      enquiryType: p.plantHighlights.some((s) => /AMC|Maintenance/i.test(s)) ? 'Annual maintenance (AMC)' : 'New landscaping project',
      ...(p.segment === 'private' ? { propertyType: 'Home / Villa' } : {}),
      message: f.message || `I would like a project similar to "${p.title}".`,
    }));
    setTimeout(scrollToForm, 250);
  };

  const isHelp = form.enquiryType === HELP;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 2) e.fullName = 'Please enter your name';
    const digits = form.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(digits)) e.phone = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (isHelp && form.message.trim().length < 5) e.message = 'Tell us what help you need';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('saving');
    await saveServiceEnquiry({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      organisation: form.organisation.trim() || undefined,
      enquiryType: form.enquiryType,
      propertyType: form.propertyType,
      city: form.city,
      area: isHelp ? undefined : form.area,
      message: form.message.trim() || undefined,
    });
    // Automatic WhatsApp confirmation to the customer (works once WhatsApp Business API is set up on the server)
    setWaConfirmed(false);
    fetch('/api/notify/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.fullName.trim(), phone: form.phone.trim(), service: form.enquiryType, city: form.city }),
    })
      .then((r) => r.json())
      .then((d) => setWaConfirmed(d?.customer === 'sent'))
      .catch(() => undefined);
    setStatus('done');
  };

  const waText = encodeURIComponent(
    `Hi Buddy4Plant team, I just sent an enquiry on your website.\n\nName: ${form.fullName}\nPhone: ${form.phone}\nNeed: ${form.enquiryType}\nProperty: ${form.propertyType}\nCity: ${form.city}${
      !isHelp ? `\nArea: ${form.area}` : ''
    }${form.organisation ? `\nOrganisation: ${form.organisation}` : ''}${form.message ? `\nDetails: ${form.message}` : ''}`
  );

  const headline = C.hero.headline.split(/\s+/).filter(Boolean);
  const highlight = new Set(C.hero.highlightWords.split(/\s+/).filter(Boolean).map((w) => w.replace(/[^\w&]/g, '').toLowerCase()));
  const activeSeason = SEASONS.find((s) => s.id === season) || SEASONS[0];

  const inputCls = (err?: string) =>
    `w-full px-3.5 py-3 bg-[#FAF5EE] border rounded-xl text-sm text-[#182018] placeholder:text-[#A59F94] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25 focus:border-[#2D6A4F] transition-all ${
      err ? 'border-[#D64545]' : 'border-[#DDD5C7]'
    }`;

  return (
    <div className="min-h-screen bg-[#FAF5EE] font-sans text-[#182018] overflow-x-hidden">
      {/* ---------------- HERO ---------------- */}
      <section className="relative bg-[#142817] text-white overflow-hidden py-12 sm:py-20">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/60 mb-8 font-sans">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
              Home
            </button>
            <span className="text-white/40">/</span>
            <span className="text-white font-medium">Landscaping &amp; Gardening Services</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7D7A8] font-sans">
                {C.hero.badge || 'Gardening · Landscaping · AMC'}
              </p>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight">
                {C.hero.headline}
              </h1>

              <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed font-normal">
                {C.hero.subtitle}
              </p>

              <div className="flex flex-wrap gap-3.5 pt-2 font-sans">
                <button
                  onClick={scrollToForm}
                  className="px-7 py-3.5 rounded-full bg-[#F3EEE3] hover:bg-white text-[#142817] text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  {C.hero.primaryButton || 'Book Site Visit & Quote'} <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(C.hero.whatsappMessage || 'Hi Buddy4Plant, I want to book a gardening consultation')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-full border border-white/30 hover:bg-white/10 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" /> {C.hero.whatsappButton || 'WhatsApp Consultation'}
                </a>
              </div>
            </div>

            {/* Clean Editorial Showcase Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white/5">
                <img
                  src={projects[0]?.image || '/projects/giti-campuses.jpg'}
                  alt="Landscaping Projects by Buddy4Plant"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {projects[0] && (
                  <div className="absolute bottom-5 left-5 right-5 font-sans">
                    <p className="text-white font-semibold text-sm leading-snug">{projects[0].title}</p>
                    <p className="text-white/70 text-xs mt-0.5">{projects[0].location}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28 py-14">
        {/* ---------------- STATS ---------------- */}
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
            {statItems.map((st, i) => (
              <div
                key={i}
                className={`px-5 py-6 sm:px-8 sm:py-8 border-[#EFE8DD] ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
              >
                <span className="font-editorial text-3xl sm:text-4xl font-bold text-[#141C14] block tracking-tight">
                  <CountUp to={st.n} suffix={st.s} />
                </span>
                <span className="text-xs sm:text-sm text-[#6B645A] mt-1 block font-sans">{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- TRUSTED BY ---------------- */}
        <TrustedList
          label={C.trustedByLabel || 'Trusted by institutions & campuses'}
          names={[...clientNames.slice(0, 8), ...C.trustedByExtra.filter(Boolean)]}
        />

        {/* ---------------- PROJECTS ---------------- */}
        <section id="projects" className="scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold text-[#486B44] uppercase tracking-[0.18em] block mb-3 font-sans">{C.projectsSection.eyebrow}</span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] leading-tight">
              {C.projectsSection.title}
            </h2>
            <p className="text-sm sm:text-base text-[#5C554B] mt-3 leading-relaxed">{C.projectsSection.subtitle}</p>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setFilter(c);
                  setShowAllProjects(false);
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                  filter === c
                    ? 'bg-[#1F6B3A] border-[#1F6B3A] text-white'
                    : 'bg-white border-[#D9D1C2] text-[#2B2A26] hover:border-[#1F6B3A]'
                }`}
              >
                {c}
                <span className={`ml-1.5 ${filter === c ? 'text-white/70' : 'text-[#9A9387]'}`}>
                  {c === 'All' ? workProjects.length : workProjects.filter((p) => p.category === c).length}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(showAllProjects ? shown : shown.slice(0, 6)).map((p) => (
              <ProjectCard key={p.id} project={p} index={workProjects.indexOf(p)} onOpen={() => setOpenProject(p)} />
            ))}
          </div>
          {shown.length > 6 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  if (showAllProjects) document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setShowAllProjects((v) => !v);
                }}
                className="px-7 py-3 rounded-full border border-[#1F6B3A] text-[#1F6B3A] text-sm font-semibold hover:bg-[#1F6B3A] hover:text-white transition-colors"
              >
                {showAllProjects ? 'Show fewer projects' : `View all ${shown.length} projects`}
              </button>
            </div>
          )}
          {openProject && (
            <ProjectModal project={openProject} onClose={() => setOpenProject(null)} onEnquire={() => enquireFor(openProject)} />
          )}
        </section>

        {/* ---------------- PRIVATE PROJECTS ---------------- */}
        {showPrivate && (
          <section id="private-projects" className="scroll-mt-24">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[11px] font-semibold text-[#486B44] uppercase tracking-[0.18em] block mb-3 font-sans">{C.privateSection.eyebrow}</span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] leading-tight">{C.privateSection.title}</h2>
              <p className="text-sm sm:text-base text-[#5C554B] mt-3 leading-relaxed">{C.privateSection.subtitle}</p>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, enquiryType: 'Balcony & terrace garden', propertyType: 'Home / Villa' }));
                  setTimeout(scrollToForm, 50);
                }}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F6B3A] underline underline-offset-4 decoration-[#1F6B3A]/30 hover:decoration-[#1F6B3A]"
              >
                {C.privateSection.button} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className={`mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${privateProjects.length < 3 ? 'lg:flex lg:justify-center [&>*]:lg:w-[calc((100%-2.5rem)/3)]' : ''}`}>
              {privateProjects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onOpen={() => setOpenProject(p)} />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- SERVICES ---------------- */}
        <section>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold text-[#486B44] uppercase tracking-[0.18em] block mb-3 font-sans">{C.servicesSection.eyebrow}</span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] tracking-tight">{C.servicesSection.title}</h2>
            {C.servicesSection.subtitle && <p className="text-sm sm:text-base text-[#5C554B] mt-3 leading-relaxed">{C.servicesSection.subtitle}</p>}
          </div>
          <div className="mt-10 sm:mt-12 grid sm:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-12">
            {SERVICES.map((s, i) => (
              <div key={s.id} className="border-t border-[#D9D1C2] pt-6 flex flex-col">
                {s.image && (
                  <div className="mb-6 aspect-[16/9] overflow-hidden rounded-2xl">
                    <img src={s.image} alt={s.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                )}
                <span className="text-sm font-semibold text-[#2E8B4E] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-editorial text-2xl sm:text-[1.75rem] font-bold text-[#141C14] mt-2 leading-tight">{s.title}</h3>
                <p className="text-[15px] text-[#5C554B] leading-relaxed mt-3">{s.text}</p>
                <ul className="mt-4 space-y-2">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-sm text-[#332E27]">
                      <Check className="w-4 h-4 text-[#2E8B4E] shrink-0 mt-0.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setForm((f) => ({ ...f, enquiryType: s.enquiryType || ENQUIRY_TYPES[0] }));
                    scrollToForm();
                  }}
                  className="mt-6 self-start inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F6B3A] underline underline-offset-4 decoration-[#1F6B3A]/30 hover:decoration-[#1F6B3A] transition-colors"
                >
                  {C.servicesSection.quoteButton} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- PROCESS ---------------- */}
        <section className="rounded-3xl bg-[#EFE9DD] px-6 py-10 sm:px-12 sm:py-14">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[11px] font-semibold text-[#486B44] uppercase tracking-[0.18em] block mb-3 font-sans">{C.process.eyebrow}</span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#141C14] tracking-tight">{C.process.title}</h2>
          </div>
          <ol ref={stepsRef} className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {STEPS.map((st, i) => (
              <li key={i} className={`lg:px-8 ${i > 0 ? 'lg:border-l lg:border-[#D6CDBC]' : ''} ${i === 0 ? 'lg:pl-0' : ''}`}>
                <span className="font-editorial text-sm font-bold text-[#2E8B4E] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-editorial font-bold text-xl text-[#141C14] mt-2">{st.title}</h3>
                <p className="text-sm text-[#5C554B] leading-relaxed mt-2">{st.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- TIPS ---------------- */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold text-[#486B44] uppercase tracking-[0.18em] block mb-3 font-sans">{C.tips.eyebrow}</span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] tracking-tight">{C.tips.title}</h2>
            <p className="text-xs sm:text-sm text-[#5C554B] mt-2.5 leading-relaxed font-normal">{C.tips.subtitle}</p>
          </div>

          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-2.5">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeason(s.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${
                    season === s.id
                      ? 'bg-[#1F6B3A] border-[#1F6B3A] text-white'
                      : 'bg-white border-[#D9D1C2] text-[#2B2A26] hover:border-[#1F6B3A]'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-center text-xs font-semibold text-[#7A746B] mb-5 font-sans">{activeSeason.months}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {activeSeason.tips.map((tp, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#E8DFD3] p-6"
                >
                  <span className="font-editorial text-sm font-bold text-[#2D6A4F] block mb-3">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="font-editorial font-bold text-base text-[#141C14]">{tp.t}</h4>
                  <p className="text-sm text-[#5C554B] leading-relaxed mt-2 font-sans">{tp.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="pt-14 sm:pt-20 max-w-3xl mx-auto">
            <h3 className="font-editorial text-3xl sm:text-4xl font-bold text-[#141C14] text-center">{C.faq.title}</h3>
            <div className="mt-8 border-t border-[#E3DBCD]">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} className="border-b border-[#E3DBCD]">
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center gap-4 py-5 text-left font-sans group"
                      aria-expanded={open}
                    >
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                          open ? 'bg-[#1F6B3A] border-[#1F6B3A] text-white' : 'border-[#CFC6B6] text-[#1F6B3A] group-hover:border-[#1F6B3A]'
                        }`}
                      >
                        {open ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </span>
                      <span className="text-[15px] font-semibold text-[#141C14]">{f.q}</span>
                    </button>
                    {open && <p className="pl-11 pr-2 pb-5 -mt-1 text-sm text-[#5C554B] leading-relaxed">{f.a}</p>}
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-center text-sm text-[#5C554B]">
              {C.faq.text}{' '}
              <button
                onClick={() => {
                  setForm((f) => ({ ...f, enquiryType: HELP }));
                  scrollToForm();
                }}
                className="font-semibold text-[#1F6B3A] underline underline-offset-4"
              >
                {C.faq.button}
              </button>
            </p>
          </div>
        </section>

        {/* ---------------- ENQUIRY FORM ---------------- */}
        <section id="book-consultation" className="scroll-mt-24">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-[28px] bg-[#F3EEE3] border border-[#E3DBCD] px-5 py-8 sm:px-10 sm:py-11">
              <div className="text-center">
                <span className="text-[11px] font-semibold text-[#486B44] uppercase tracking-[0.18em] block mb-3">{C.contact.eyebrow}</span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1F6B3A] tracking-tight leading-tight">{C.contact.title}</h2>
                <p className="text-sm sm:text-[15px] text-[#4F5A4C] mt-3 leading-relaxed max-w-xl mx-auto">{C.contact.text}</p>
              </div>

              <div className="mt-8">
                <AnimatePresence mode="wait">
                  {status === 'done' ? (
                    <div className="flex flex-col items-center justify-center text-center py-8 space-y-5 animate-fadeIn">
                      <div className="w-16 h-16 rounded-full bg-white text-[#1F6B3A] flex items-center justify-center border border-[#CFE3C6]">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141C14]">
                        {C.form.successTitle}, {form.fullName.split(' ')[0]}!
                      </h3>
                      <p className="text-sm text-[#5C554B] max-w-md leading-relaxed">
                        {C.form.successText ? (
                          C.form.successText
                        ) : (
                          <>
                            We have received your enquiry for <strong>{form.enquiryType.toLowerCase()}</strong>. Our team will contact you shortly on{' '}
                            <strong>{form.phone}</strong>.
                          </>
                        )}
                      </p>
                      {waConfirmed && (
                        <p className="text-xs font-semibold text-[#1F7A3E] bg-white border border-[#BFE5CB] rounded-full px-4 py-2 inline-flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" /> We have sent a confirmation to your WhatsApp.
                        </p>
                      )}
                      <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <a
                          href={`https://wa.me/${whatsappNum}?text=${waText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-6 py-3 rounded-xl bg-[#1F6B3A] hover:bg-[#185730] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" /> Also send on WhatsApp
                        </a>
                        <button
                          onClick={() => {
                            setForm(emptyForm);
                            setStatus('idle');
                          }}
                          className="px-6 py-3 rounded-xl bg-white border border-[#DCD3C4] text-sm font-semibold text-[#1F4A2C] hover:border-[#1F6B3A] transition-colors"
                        >
                          New enquiry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                      <ChoiceChips label={C.form.labels.need} options={ENQUIRY_TYPES} value={form.enquiryType} onChange={(v) => setForm({ ...form, enquiryType: v })} />

                      <div className="grid sm:grid-cols-2 gap-3">
                        <IconField icon={User} error={errors.fullName}>
                          <input
                            className={fieldInput}
                            aria-label={C.form.labels.name}
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            placeholder={asPlaceholder(C.form.labels.name)}
                            autoComplete="name"
                          />
                        </IconField>
                        <IconField icon={Phone} error={errors.phone}>
                          <input
                            type="tel"
                            inputMode="numeric"
                            className={fieldInput}
                            aria-label={C.form.labels.phone}
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder={asPlaceholder(C.form.labels.phone)}
                            autoComplete="tel"
                          />
                        </IconField>
                        <IconField icon={Mail} error={errors.email}>
                          <input
                            type="email"
                            className={fieldInput}
                            aria-label={C.form.labels.email}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder={C.form.labels.email}
                            autoComplete="email"
                          />
                        </IconField>
                        <IconField icon={Building2}>
                          <input
                            className={fieldInput}
                            aria-label={C.form.labels.organisation}
                            value={form.organisation}
                            onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                            placeholder={C.form.labels.organisation}
                            autoComplete="organization"
                          />
                        </IconField>
                      </div>

                      <ChoiceChips label={C.form.labels.propertyType} options={PROPERTY_TYPES} value={form.propertyType} onChange={(v) => setForm({ ...form, propertyType: v })} />

                      <div className="space-y-6">
                        <label className="block sm:max-w-[calc(50%-6px)]">
                          <span className="block text-sm font-semibold text-[#1F4A2C] mb-2.5">{C.form.labels.city}</span>
                          <IconField icon={MapPin}>
                            <select className={`${fieldInput} cursor-pointer`} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                              {CITIES.map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                            </select>
                          </IconField>
                        </label>
                        {!isHelp && (
                          <ChoiceChips label={C.form.labels.area} options={AREAS} value={form.area} onChange={(v) => setForm({ ...form, area: v })} />
                        )}
                      </div>

                      <label className="block">
                        <span className="block text-sm font-semibold text-[#1F4A2C] mb-2.5">{isHelp ? C.form.labels.question : C.form.labels.message}</span>
                        <textarea
                          rows={4}
                          className={`w-full px-4 py-3 bg-white border rounded-xl text-[15px] text-[#182018] placeholder:text-[#8C887F] focus:outline-none focus:border-[#1F6B3A] focus:ring-2 focus:ring-[#1F6B3A]/15 transition-colors ${
                            errors.message ? 'border-[#D64545]' : 'border-[#DCD3C4]'
                          }`}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder={isHelp ? C.form.labels.questionPlaceholder : C.form.labels.messagePlaceholder}
                        />
                        {errors.message && <span className="text-xs text-[#C93C3C] mt-1.5 block">{errors.message}</span>}
                      </label>

                      <div>
                        <button
                          type="submit"
                          disabled={status === 'saving'}
                          className="w-full h-14 rounded-xl bg-[#1F6B3A] hover:bg-[#185730] disabled:opacity-60 text-white text-base font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                          {status === 'saving' ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              {isHelp ? C.form.helpSubmitButton : C.form.submitButton} <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                        <p className="text-xs text-center text-[#7A746B] mt-3">{C.form.privacyNote}</p>
                      </div>
                    </form>
                  )}
                </AnimatePresence>
              </div>

              {/* who we work with - real clients and numbers */}
              {shortClients.length > 0 && (
                <div className="mt-8 pt-7 border-t border-[#DDD4C4] text-center">
                  <p className="text-sm font-semibold text-[#1F4A2C]">{C.trustedByLabel || 'Trusted by'}</p>
                  <p className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5 font-editorial text-[15px] sm:text-base font-semibold text-[#2B3A2C]">
                    {shortClients.map((n, i) => (
                      <React.Fragment key={n}>
                        {i > 0 && (
                          <span aria-hidden="true" className="text-[#B5AC9C]">
                            ·
                          </span>
                        )}
                        <span>{n}</span>
                      </React.Fragment>
                    ))}
                  </p>
                  <p className="mt-5 inline-flex flex-col sm:flex-row justify-center gap-1 sm:gap-0 rounded-xl bg-white px-5 py-3 text-[13px] font-semibold text-[#1F2A1F]">
                    {statItems.slice(0, 2).map((st, i) => (
                      <span key={i} className={i > 0 ? 'sm:ml-3 sm:pl-3 sm:border-l sm:border-[#DCD3C4]' : ''}>
                        {st.n}
                        {st.s} {st.label.toLowerCase()}
                      </span>
                    ))}
                    <span className="sm:ml-3 sm:pl-3 sm:border-l sm:border-[#DCD3C4]">Lucknow · Kanpur · Delhi</span>
                  </p>
                </div>
              )}
            </div>

            {/* direct contact */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              <span className="text-[#6B645A]">Prefer to talk?</span>
              <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-[#1F4A2C] hover:text-[#1F6B3A]">
                <MessageCircle className="w-4 h-4 text-[#1FA855]" /> WhatsApp {prettyPhone(whatsappNum)}
              </a>
              <a href={`tel:+${whatsappNum}`} className="inline-flex items-center gap-2 font-semibold text-[#1F4A2C] hover:text-[#1F6B3A]">
                <Phone className="w-4 h-4" /> {C.contact.callLabel || 'Call us'}
              </a>
              {settings.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center gap-2 font-semibold text-[#1F4A2C] hover:text-[#1F6B3A]">
                  <Mail className="w-4 h-4" /> {settings.contactEmail}
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
