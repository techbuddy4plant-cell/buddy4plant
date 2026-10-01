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
  Phone,
  Send,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sprout,
  Sun,
  Trees,
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
import OptionWheel from '../common/OptionWheel';

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

const ProjectCard: React.FC<{ project: BotanicalProject; index: number; onOpen: () => void }> = ({ project, index, onOpen }) => {
  const Icon = categoryIcon(project.category);
  const sites = project.sites || [];
  return (
    <div
      onClick={onOpen}
      className="group cursor-pointer text-left bg-white rounded-[24px] ring-1 ring-[#E8DFD3] overflow-hidden shadow-[0_4px_20px_-8px_rgba(20,40,25,0.08)] hover:shadow-[0_16px_36px_-12px_rgba(20,40,25,0.16)] transition-all duration-300 flex flex-col focus:outline-none"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EEF3EA]">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/60 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 text-[#1A3824] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm font-sans">
          <Icon className="w-3 h-3 text-[#1A3824]" />
          {project.category}
        </span>
        <ProjectMediaBadge project={project} className="absolute bottom-4 left-4" />
      </div>
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#141C14] leading-snug group-hover:text-[#1A3824] transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-[#6B645A] flex items-center gap-1.5 mt-1.5 font-sans">
            <MapPin className="w-3.5 h-3.5 text-[#1A3824] shrink-0" />
            {project.location}
          </p>
        </div>

        {sites.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-1">
            {sites.slice(0, 4).map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#EBF5EC] text-[#1A3824] text-[10px] font-semibold border border-[#C5E1C9]">
                {s}
              </span>
            ))}
            {sites.length > 4 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5EEE4] text-[#6B645A] text-[10px] font-semibold">+{sites.length - 4} more</span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-[#EFE8DD] flex items-center justify-between mt-auto">
          <span className="text-[11px] text-[#7A746B] line-clamp-1 font-sans">{project.plantHighlights.slice(0, 2).join(' · ')}</span>
          <span className="text-xs font-bold text-[#1A3824] inline-flex items-center gap-1 group-hover:gap-2 transition-all font-sans">
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
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


/** "Trusted by" list shown as a slowly turning wheel (React Bits OptionWheel). */
const TrustedWheel: React.FC<{ label: string; names: string[] }> = ({ label, names }) => {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const items = names.filter((n, i) => n && names.indexOf(n) === i);
  if (items.length === 0) return null;
  return (
    <section className="-mt-6 sm:-mt-10">
      <div className="relative grid lg:grid-cols-12 items-center gap-6 lg:gap-10 rounded-3xl bg-white border border-[#E8DFD3] overflow-hidden px-5 pt-7 pb-2 sm:px-10 sm:py-4">
        <div className="lg:col-span-4 font-sans">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#486B44]">{label}</p>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141C14] leading-tight mt-2">
            Gardens we look after
          </h2>
          <p className="text-sm text-[#6B645A] mt-2 leading-relaxed max-w-xs">
            Government offices, training institutes, defence units and campuses across Uttar Pradesh.
          </p>
        </div>
        <div className="lg:col-span-8 relative h-[260px] sm:h-[320px]">
          {/* centre marker */}
          <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-9 w-[3px] rounded-full bg-[#2D6A4F]" />
          <OptionWheel
            items={items}
            defaultSelected={0}
            textColor="#B5AEA2"
            activeColor="#142817"
            side="left"
            fontSize={wide ? 1.55 : 0.92}
            spacing={wide ? 1.75 : 2}
            curve={1}
            tilt={wide ? 7 : 9}
            blur={1.2}
            fade={0.22}
            minOpacity={0.08}
            smoothing={320}
            inset={wide ? 28 : 14}
            loop
            draggable={false}
            captureWheel={false}
            autoPlay={2400}
            className="font-sans"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>
    </section>
  );
};

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
                  className="px-7 py-3.5 rounded-full bg-[#B7D7A8] hover:bg-[#A3C893] text-[#142817] text-sm font-semibold inline-flex items-center gap-2 shadow-lg transition-all"
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
            {C.stats.map((raw) => ({
              n: raw.value === 'auto:projects' ? workProjects.length : raw.value === 'auto:sites' ? siteCount : raw.value === 'auto:multisite' ? multiSite : Number(raw.value) || 0,
              s: raw.suffix,
              label: raw.label,
              icon: gIcon(raw.icon),
            })).map((st, i) => (
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

        {/* ---------------- TRUSTED BY (option wheel) ---------------- */}
        <TrustedWheel
          label={C.trustedByLabel || 'Trusted by institutions & campuses'}
          names={[...clientNames.slice(0, 8), ...C.trustedByExtra.filter(Boolean)]}
        />

        {/* ---------------- PROJECTS ---------------- */}
        <section id="projects" className="scroll-mt-24 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.16em] block mb-2 font-sans">{C.projectsSection.eyebrow}</span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] leading-tight">
                {C.projectsSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C554B] mt-2.5 leading-relaxed font-normal">{C.projectsSection.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs ${
                    filter === c
                      ? 'bg-[#1A3824] text-white shadow-sm ring-1 ring-[#1A3824]'
                      : 'bg-white/90 border border-[#DDD5C7] text-[#332E27] hover:border-[#1A3824] hover:bg-white'
                  }`}
                >
                  <span>
                    {c}
                    <span className="ml-1.5 opacity-60">
                      ({c === 'All' ? workProjects.length : workProjects.filter((p) => p.category === c).length})
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {shown.map((p) => (
              <ProjectCard key={p.id} project={p} index={workProjects.indexOf(p)} onOpen={() => setOpenProject(p)} />
            ))}
          </div>
          {openProject && (
            <ProjectModal project={openProject} onClose={() => setOpenProject(null)} onEnquire={() => enquireFor(openProject)} />
          )}
        </section>

        {/* ---------------- PRIVATE PROJECTS ---------------- */}
        {showPrivate && (
          <section id="private-projects" className="scroll-mt-24 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-[11px] font-bold text-[#C4661F] uppercase tracking-[0.16em] mb-2 inline-flex items-center gap-1.5 font-sans">
                  <Home className="w-3.5 h-3.5" /> {C.privateSection.eyebrow}
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] leading-tight">
                  {C.privateSection.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#5C554B] mt-2.5 leading-relaxed font-normal">
                  {C.privateSection.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, enquiryType: 'Balcony & terrace garden', propertyType: 'Home / Villa' }));
                  setTimeout(scrollToForm, 50);
                }}
                className="self-start lg:self-auto pill-btn-dark px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
              >
                {C.privateSection.button} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {privateProjects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onOpen={() => setOpenProject(p)} />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- SERVICES ---------------- */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.16em] block mb-2 font-sans">{C.servicesSection.eyebrow}</span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] tracking-tight">{C.servicesSection.title}</h2>
            {C.servicesSection.subtitle && <p className="text-xs sm:text-sm text-[#5C554B] mt-3 leading-relaxed font-normal">{C.servicesSection.subtitle}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {SERVICES.map((s) => (
              <div
                key={s.id}
                className="group bg-white rounded-3xl ring-1 ring-[#E8DFD3] shadow-[0_4px_20px_-8px_rgba(20,40,25,0.06)] p-7 sm:p-9 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {s.image && (
                    <div className="-mx-7 sm:-mx-9 -mt-7 sm:-mt-9 mb-4 aspect-[16/8] overflow-hidden rounded-t-3xl">
                      <img src={s.image} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  {!s.image && (
                    <div className="w-12 h-12 rounded-2xl bg-[#EBF5EC] flex items-center justify-center">
                      <s.icon className="w-6 h-6 text-[#1A3824]" />
                    </div>
                  )}
                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#141C14]">{s.title}</h3>
                  <p className="text-sm text-[#5C554B] leading-relaxed">{s.text}</p>
                  <ul className="space-y-2 pt-2">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-[#332E27] font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] shrink-0 mt-[7px]" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-6 mt-4 border-t border-[#EFE8DD]">
                  <button
                    onClick={() => {
                      setForm((f) => ({ ...f, enquiryType: s.enquiryType || ENQUIRY_TYPES[0] }));
                      scrollToForm();
                    }}
                    className="pill-btn-light px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 border border-[#DDD5C7] group-hover:border-[#1A3824] transition-colors"
                  >
                    {C.servicesSection.quoteButton} <ArrowRight className="w-3.5 h-3.5 text-[#1A3824]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- PROCESS ---------------- */}
        <section className="bg-[#142817] text-white rounded-4xl p-8 sm:p-14 relative overflow-hidden shadow-xl">
          <div className="relative text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-[#B7D7A8] uppercase tracking-[0.16em] block mb-2 font-sans">{C.process.eyebrow}</span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight">{C.process.title}</h2>
          </div>
          <div ref={stepsRef} className="relative">
            <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-white/15" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {STEPS.map((st, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#B7D7A8] text-[#142817] font-editorial font-bold text-lg flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                  <h4 className="font-editorial font-bold text-lg mt-4 text-white">{st.title}</h4>
                  <p className="text-xs text-white/75 leading-relaxed mt-2 max-w-[220px] mx-auto font-sans">{st.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- TIPS ---------------- */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.16em] inline-flex items-center gap-1.5 mb-2 font-sans">
              <Lightbulb className="w-3.5 h-3.5" /> {C.tips.eyebrow}
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] tracking-tight">{C.tips.title}</h2>
            <p className="text-xs sm:text-sm text-[#5C554B] mt-2.5 leading-relaxed font-normal">{C.tips.subtitle}</p>
          </div>

          <div className="flex justify-center">
            <div className="inline-flex p-1.5 bg-white border border-[#E8DFD3] rounded-full gap-1.5 overflow-x-auto max-w-full shadow-xs">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeason(s.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    season === s.id
                      ? 'bg-[#1A3824] text-white shadow-sm'
                      : 'text-[#332E27] hover:bg-[#FAF5EE]'
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
                  className="bg-white rounded-3xl border border-[#E8DFD3] p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <span className="font-editorial text-sm font-bold text-[#2D6A4F] block mb-3">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="font-editorial font-bold text-base text-[#141C14]">{tp.t}</h4>
                  <p className="text-sm text-[#5C554B] leading-relaxed mt-2 font-sans">{tp.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="grid lg:grid-cols-5 gap-8 pt-8">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141C14]">{C.faq.title}</h3>
              <p className="text-xs sm:text-sm text-[#5C554B] leading-relaxed font-sans">{C.faq.text}</p>
              <button
                onClick={() => {
                  setForm((f) => ({ ...f, enquiryType: HELP }));
                  scrollToForm();
                }}
                className="pill-btn-light px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 border border-[#DDD5C7]"
              >
                <Lightbulb className="w-4 h-4 text-[#1A3824]" /> {C.faq.button}
              </button>
            </div>
            <div className="lg:col-span-3 space-y-3">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} className={`rounded-2xl border bg-white transition-colors ${open ? 'border-[#1A3824]/60 shadow-sm' : 'border-[#E8DFD3]'}`}>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left font-sans"
                      aria-expanded={open}
                    >
                      <span className="text-sm font-bold text-[#141C14]">{f.q}</span>
                      <span className="shrink-0 w-7 h-7 rounded-full bg-[#FAF5EE] flex items-center justify-center border border-[#E8DFD3]">
                        <ChevronDown className={`w-4 h-4 text-[#1A3824] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {open && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-[#5C554B] leading-relaxed font-sans border-t border-[#FAF5EE] pt-3">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- ENQUIRY FORM ---------------- */}
        <section id="book-consultation" className="scroll-mt-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <span className="text-[11px] font-bold text-[#486B44] uppercase tracking-[0.16em] block mb-2 font-sans">{C.contact.eyebrow}</span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141C14] tracking-tight">{C.contact.title}</h2>
              <p className="text-sm text-[#5C554B] mt-3 leading-relaxed max-w-xl mx-auto">{C.contact.text}</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-[0_18px_50px_-28px_rgba(20,40,25,0.28)] p-6 sm:p-10">
              <AnimatePresence mode="wait">
                {status === 'done' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-5 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-[#EBF5EC] text-[#1A3824] flex items-center justify-center border border-[#C5E1C9]">
                      <CheckCircle2 className="w-8 h-8 text-[#1A3824]" />
                    </div>
                    <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141C14]">{C.form.successTitle}, {form.fullName.split(' ')[0]}!</h3>
                    <p className="text-xs sm:text-sm text-[#5C554B] max-w-md leading-relaxed">
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
                      <p className="text-xs font-semibold text-[#1F7A3E] bg-[#EAF7EE] border border-[#BFE5CB] rounded-full px-4 py-2 inline-flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> We have sent a confirmation to your WhatsApp.
                      </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-3 pt-2 font-sans">
                      <a
                        href={`https://wa.me/${whatsappNum}?text=${waText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="pill-btn-dark px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 shadow-md"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" /> Also send on WhatsApp
                      </a>
                      <button
                        onClick={() => {
                          setForm(emptyForm);
                          setStatus('idle');
                        }}
                        className="pill-btn-light px-6 py-3 text-sm font-semibold text-[#1A3824] border border-[#DDD5C7]"
                      >
                        New enquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5 font-sans">
                    <div>
                      <span className="block text-[13px] font-semibold text-[#2B2A26] mb-2 font-sans">{C.form.labels.need}</span>
                      <div className="flex flex-wrap gap-2">
                        {ENQUIRY_TYPES.map((t) => {
                          const active = form.enquiryType === t;
                          return (
                            <button
                              type="button"
                              key={t}
                              onClick={() => setForm({ ...form, enquiryType: t })}
                              className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                                active
                                  ? 'bg-[#1A3824] text-white border-[#1A3824] shadow-xs'
                                  : 'text-[#332E27] border-[#DDD5C7] bg-white hover:border-[#1A3824]'
                              }`}
                            >
                              <span>{t}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block text-[13px] font-semibold text-[#2B2A26] mb-1.5 font-sans">{C.form.labels.name}</span>
                        <input
                          className={inputCls(errors.fullName)}
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          placeholder={C.form.labels.namePlaceholder}
                          autoComplete="name"
                        />
                        {errors.fullName && <span className="text-[11px] text-[#D64545] mt-1 block">{errors.fullName}</span>}
                      </label>
                      <label className="block">
                        <span className="block text-[13px] font-semibold text-[#2B2A26] mb-1.5 font-sans">{C.form.labels.phone}</span>
                        <input
                          type="tel"
                          className={inputCls(errors.phone)}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder={C.form.labels.phonePlaceholder}
                          autoComplete="tel"
                        />
                        {errors.phone && <span className="text-[11px] text-[#D64545] mt-1 block">{errors.phone}</span>}
                      </label>
                      <label className="block">
                        <span className="block text-[13px] font-semibold text-[#2B2A26] mb-1.5 font-sans">{C.form.labels.email}</span>
                        <input
                          type="email"
                          className={inputCls(errors.email)}
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder={C.form.labels.emailPlaceholder}
                          autoComplete="email"
                        />
                        {errors.email && <span className="text-[11px] text-[#D64545] mt-1 block">{errors.email}</span>}
                      </label>
                      <label className="block">
                        <span className="block text-[13px] font-semibold text-[#2B2A26] mb-1.5 font-sans">{C.form.labels.organisation}</span>
                        <input
                          className={inputCls()}
                          value={form.organisation}
                          onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                          placeholder={C.form.labels.organisationPlaceholder}
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[13px] font-semibold text-[#2B2A26] mb-1.5 font-sans">{C.form.labels.propertyType}</span>
                        <select className={inputCls()} value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
                          {PROPERTY_TYPES.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-[13px] font-semibold text-[#2B2A26] mb-1.5 font-sans">{C.form.labels.city}</span>
                        <select className={inputCls()} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                          {CITIES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {!isHelp && (
                      <label className="block">
                        <span className="block text-[13px] font-semibold text-[#2B2A26] mb-1.5 font-sans">{C.form.labels.area}</span>
                        <select className={inputCls()} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                          {AREAS.map((a) => (
                            <option key={a}>{a}</option>
                          ))}
                        </select>
                      </label>
                    )}

                    <label className="block">
                      <span className="block text-[13px] font-semibold text-[#2B2A26] mb-1.5 font-sans">
                        {isHelp ? C.form.labels.question : C.form.labels.message}
                      </span>
                      <textarea
                        rows={4}
                        className={inputCls(errors.message)}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder={
                          isHelp
                            ? C.form.labels.questionPlaceholder
                            : C.form.labels.messagePlaceholder
                        }
                      />
                      {errors.message && <span className="text-[11px] text-[#D64545] mt-1 block">{errors.message}</span>}
                    </label>

                    <button
                      type="submit"
                      disabled={status === 'saving'}
                      className="w-full pill-btn-dark py-4 text-sm font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {status === 'saving' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> {isHelp ? C.form.helpSubmitButton : C.form.submitButton}
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-[#7A746B]">{C.form.privacyNote}</p>
                  </form>
                )}
              </AnimatePresence>
            </div>

            {/* direct contact, below the form */}
            <div className="mt-8">
              <p className="text-center text-sm text-[#6B645A] mb-4 font-sans">Prefer to talk to us directly?</p>
              <div className={`grid gap-3 font-sans ${settings.contactEmail ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                <a
                  href={`https://wa.me/${whatsappNum}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E8DFD3] hover:border-[#1A3824]/40 transition-colors"
                >
                  <span className="w-10 h-10 rounded-full bg-[#E9F8EE] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#1FA855]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-[#7A746B]">WhatsApp</span>
                    <span className="block text-sm font-semibold text-[#141C14] truncate">{prettyPhone(whatsappNum)}</span>
                  </span>
                </a>
                <a
                  href={`tel:+${whatsappNum}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E8DFD3] hover:border-[#1A3824]/40 transition-colors"
                >
                  <span className="w-10 h-10 rounded-full bg-[#EBF5EC] flex items-center justify-center shrink-0">
                    <Phone className="w-[18px] h-[18px] text-[#1A3824]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-[#7A746B]">{C.contact.callLabel || 'Call us'}</span>
                    <span className="block text-sm font-semibold text-[#141C14] truncate">{prettyPhone(whatsappNum)}</span>
                  </span>
                </a>
                {settings.contactEmail && (
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E8DFD3] hover:border-[#1A3824]/40 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-full bg-[#EBF5EC] flex items-center justify-center shrink-0">
                      <Mail className="w-[18px] h-[18px] text-[#1A3824]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-[#7A746B]">Email</span>
                      <span className="block text-sm font-semibold text-[#141C14] truncate">{settings.contactEmail}</span>
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
