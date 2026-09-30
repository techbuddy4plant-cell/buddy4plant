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
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ duration: 0.55, delay: Math.min(index, 8) * 0.05, ease }}
      whileHover={{ y: -8 }}
      onClick={onOpen}
      className="group text-left bg-white rounded-[22px] ring-1 ring-[#ECE6DA] overflow-hidden shadow-[0_10px_30px_-18px_rgba(19,48,27,0.35)] hover:shadow-[0_22px_40px_-20px_rgba(19,48,27,0.45)] transition-shadow duration-300 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
    >
      <motion.div layoutId={`proj-img-${project.id}`} className="relative aspect-[16/10] overflow-hidden bg-[#EEF3EA]">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/70 via-transparent to-transparent" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 text-[#1F3B22] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          <Icon className="w-3 h-3" />
          {project.category}
        </span>
        <span className="absolute bottom-3 right-4 font-editorial text-4xl font-extrabold text-white/90 drop-shadow">
          {String(index + 1).padStart(2, '0')}
        </span>
        <ProjectMediaBadge project={project} className="absolute bottom-4 left-4" />
      </motion.div>
      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-3">
        <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#142B1A] leading-snug">{project.title}</h3>
        <p className="text-xs text-[#5C5C5C] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
          {project.location}
        </p>
        {sites.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sites.slice(0, 5).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-[#EBF5EC] text-[#1F4522] text-[10px] font-semibold">
                {s}
              </span>
            ))}
            {sites.length > 5 && (
              <span className="px-2 py-0.5 rounded-md bg-[#F3F1EB] text-[#5C5C5C] text-[10px] font-semibold">+{sites.length - 5} more</span>
            )}
          </div>
        )}
        <div className="mt-auto pt-3 border-t border-[#F2EFE8] flex items-center justify-between">
          <span className="text-[11px] text-[#7A7A7A] line-clamp-1">{project.plantHighlights.slice(0, 2).join(' · ')}</span>
          <span className="text-[11px] font-bold text-[#1F3B22] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.button>
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
    <motion.div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-[#0E1C11]/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-[#FDFCF9] rounded-t-3xl sm:rounded-3xl shadow-2xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.45, ease }}
      >
        <motion.div layoutId={`proj-img-${project.id}`} className="relative aspect-[16/8] overflow-hidden">
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#142B1A]/80 to-transparent" />
          <div className="absolute bottom-5 left-6 right-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CFE3C4]">{project.category}</span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-tight mt-1">{project.title}</h3>
          </div>
        </motion.div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 text-[#142B1A] flex items-center justify-center shadow-md hover:rotate-90 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {project.client && (
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E2D9]">
                <span className="block text-[10px] uppercase tracking-wider text-[#7A7A7A] font-bold mb-1">Client</span>
                <span className="font-semibold text-[#142B1A]">{project.client}</span>
              </div>
            )}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E2D9]">
              <span className="block text-[10px] uppercase tracking-wider text-[#7A7A7A] font-bold mb-1">Location</span>
              <span className="font-semibold text-[#142B1A]">{project.location}</span>
            </div>
          </div>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">{project.description}</p>
          {sites.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#142B1A] block mb-2">
                {sites.length} Sites Covered
              </span>
              <div className="flex flex-wrap gap-2">
                {sites.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="px-3 py-1.5 rounded-full bg-[#EBF5EC] border border-[#C5E1C9] text-xs font-semibold text-[#1F4522] inline-flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3" />
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          <ProjectMediaSection project={project} />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#142B1A] block mb-2">Work Done</span>
            <div className="grid sm:grid-cols-2 gap-2">
              {project.plantHighlights.map((s) => (
                <div key={s} className="flex items-center gap-2 text-xs text-[#333]">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onEnquire}
            className="w-full py-3.5 bg-[#1F3B22] hover:bg-[#162D19] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            Enquire About a Similar Project <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

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
    `w-full px-3.5 py-3 bg-[#FAF9F5] border rounded-xl text-sm text-[#141414] placeholder:text-[#A5A29A] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/25 focus:border-[#2D6A4F] transition-all ${
      err ? 'border-[#D64545]' : 'border-[#DDD9CF]'
    }`;

  return (
    <div className="min-h-screen bg-[#FDFCF9] font-sans text-[#141414] overflow-x-hidden">
      {/* ---------------- HERO ---------------- */}
      <section ref={heroRef} className="b4p-fixed-theme relative bg-[#142B1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <FloatingLeaves />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 sm:pb-28">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-10">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
              Home
            </button>
            <span>/</span>
            <span className="text-white font-semibold">Gardening Services</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div style={{ y: heroTextY }} className="lg:col-span-7 space-y-6">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-[0.22em] text-[#CFE3C4]"
              >
                <Sparkles className="w-3.5 h-3.5" /> {C.hero.badge}
              </motion.span>

              <h1 className="font-editorial text-[2.1rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight">
                {headline.map((w, i) => (
                  <React.Fragment key={i}>
                  <motion.span
                    className={`inline-block mr-[0.25em] ${highlight.has(w.replace(/[^\w&]/g, '').toLowerCase()) ? 'text-[#B7D7A8]' : ''}`}
                    initial={{ opacity: 0, y: 40, rotate: 3 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease }}
                  >
                    {w}
                  </motion.span>{' '}
                  </React.Fragment>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-sm sm:text-base text-white/75 max-w-xl leading-relaxed"
              >
                {C.hero.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={scrollToForm}
                  className="px-7 py-3.5 rounded-full bg-[#B7D7A8] text-[#142B1A] text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
                >
                  {C.hero.primaryButton} <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(C.hero.whatsappMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-full border border-white/30 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" /> {C.hero.whatsappButton}
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  href="#projects"
                  className="px-5 py-3.5 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  {C.hero.projectsButton} <ChevronDown className="w-4 h-4" />
                </motion.a>
              </motion.div>
            </motion.div>

            {/* stacked rotating covers */}
            <motion.div style={{ y: heroCardsY }} className="lg:col-span-5 relative h-[320px] sm:h-[400px] hidden sm:block">
              <AnimatePresence initial={false}>
                {heroCards
                  .map((p, k) => (
                    <motion.div
                      key={p.id}
                      className="absolute inset-x-6 top-6 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-white"
                      style={{ zIndex: 3 - k }}
                      initial={{ opacity: 0, scale: 0.85, y: 60, rotate: 8 }}
                      animate={{ opacity: k === 2 ? 0.6 : 1, scale: 1 - k * 0.07, y: k * -26, rotate: k === 0 ? -3 : k === 1 ? 4 : -8 }}
                      exit={{ opacity: 0, x: -140, rotate: -18, transition: { duration: 0.5 } }}
                      transition={{ duration: 0.8, ease }}
                    >
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                      {k === 0 && p.title && (
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                          <span className="text-[10px] uppercase tracking-wider text-[#CFE3C4] font-bold">{p.category}</span>
                          <p className="text-sm font-bold text-white leading-tight">{p.title}</p>
                        </div>
                      )}
                    </motion.div>
                  ))
                  .reverse()}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
        {/* wave */}
        <svg className="absolute -bottom-px left-0 w-full h-12 sm:h-16 text-[#FDFCF9]" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 C 240 90 480 0 720 30 C 960 60 1200 10 1440 40 V80 H0Z" fill="currentColor" />
        </svg>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28 pb-20">
        {/* ---------------- STATS ---------------- */}
        <Reveal className="-mt-10 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {C.stats.map((raw) => ({
              n: raw.value === 'auto:projects' ? workProjects.length : raw.value === 'auto:sites' ? siteCount : raw.value === 'auto:multisite' ? multiSite : Number(raw.value) || 0,
              s: raw.suffix,
              label: raw.label,
              icon: gIcon(raw.icon),
            })).map((st, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl border border-[#E5E2D9] p-5 sm:p-6 shadow-sm"
              >
                <st.icon className="w-5 h-5 text-[#2D6A4F] mb-3" />
                <span className="font-editorial text-3xl sm:text-4xl font-extrabold text-[#142B1A] block">
                  <CountUp to={st.n} suffix={st.s} />
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-[#5C5C5C]">{st.label}</span>
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* ---------------- CLIENT MARQUEE ---------------- */}
        <div className="-mt-6 sm:-mt-12">
          <Reveal>
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-[#7A7A7A] mb-2">{C.trustedByLabel}</p>
          </Reveal>
          <Marquee items={[...clientNames, ...C.trustedByExtra.filter(Boolean)]} />
        </div>

        {/* ---------------- PROJECTS ---------------- */}
        <section id="projects" className="scroll-mt-24 space-y-8">
          <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] block mb-2">{C.projectsSection.eyebrow}</span>
              <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold text-[#142B1A] leading-tight">
                {C.projectsSection.title}
              </h2>
              <p className="text-sm text-[#5C5C5C] mt-3">{C.projectsSection.subtitle}</p>
            </div>
            <LayoutGroup id="proj-filter">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className={`relative px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                      filter === c ? 'text-white' : 'text-[#1F3B22] bg-white border border-[#E2DDD0] hover:border-[#2D6A4F]'
                    }`}
                  >
                    {filter === c && (
                      <motion.span
                        layoutId="proj-filter-pill"
                        className="absolute inset-0 rounded-full bg-[#1F3B22]"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative">
                      {c}
                      <span className="ml-1.5 opacity-60">
                        {c === 'All' ? workProjects.length : workProjects.filter((p) => p.category === c).length}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </Reveal>

          <LayoutGroup id="proj-grid">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {shown.map((p) => (
                  <ProjectCard key={p.id} project={p} index={workProjects.indexOf(p)} onOpen={() => setOpenProject(p)} />
                ))}
              </AnimatePresence>
            </motion.div>
            <AnimatePresence>
              {openProject && (
                <ProjectModal project={openProject} onClose={() => setOpenProject(null)} onEnquire={() => enquireFor(openProject)} />
              )}
            </AnimatePresence>
          </LayoutGroup>
        </section>

        {/* ---------------- PRIVATE PROJECTS ---------------- */}
        {showPrivate && (
          <section id="private-projects" className="scroll-mt-24 space-y-8">
            <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold text-[#C4661F] uppercase tracking-[0.24em] mb-2 inline-flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> {C.privateSection.eyebrow}
                </span>
                <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold text-[#142B1A] leading-tight">
                  {C.privateSection.title}
                </h2>
                <p className="text-sm text-[#5C5C5C] mt-3">
                  {C.privateSection.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, enquiryType: 'Balcony & terrace garden', propertyType: 'Home / Villa' }));
                  setTimeout(scrollToForm, 50);
                }}
                className="self-start lg:self-auto px-5 py-3 rounded-full bg-[#1F3B22] hover:bg-[#162D19] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors"
              >
                {C.privateSection.button} <ArrowRight className="w-4 h-4" />
              </button>
            </Reveal>
            <LayoutGroup id="private-grid">
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {privateProjects.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} onOpen={() => setOpenProject(p)} />
                ))}
              </motion.div>
            </LayoutGroup>
          </section>
        )}

        {/* ---------------- SERVICES ---------------- */}
        <section className="space-y-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] block mb-2">{C.servicesSection.eyebrow}</span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold text-[#142B1A]">{C.servicesSection.title}</h2>
            {C.servicesSection.subtitle && <p className="text-sm text-[#5C5C5C] mt-3">{C.servicesSection.subtitle}</p>}
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {SERVICES.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group relative h-full bg-white rounded-[22px] ring-1 ring-[#ECE6DA] shadow-[0_10px_30px_-18px_rgba(19,48,27,0.35)] p-6 sm:p-8 overflow-hidden hover:shadow-[0_22px_40px_-20px_rgba(19,48,27,0.45)] transition-shadow"
                >
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#EBF5EC] scale-0 group-hover:scale-100 transition-transform duration-500" />
                  <div className="relative space-y-4">
                    {s.image && (
                      <div className="-mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-2 aspect-[16/8] overflow-hidden">
                        <img src={s.image} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    )}
                    <motion.div
                      whileHover={{ rotate: -8, scale: 1.08 }}
                      className="w-12 h-12 rounded-2xl bg-[#1F3B22] text-white flex items-center justify-center"
                    >
                      <s.icon className="w-6 h-6" />
                    </motion.div>
                    <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#142B1A]">{s.title}</h3>
                    <p className="text-sm text-[#5C5C5C] leading-relaxed">{s.text}</p>
                    <ul className="space-y-2 pt-1">
                      {s.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2 text-xs text-[#4A4A4A]">
                          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setForm((f) => ({ ...f, enquiryType: s.enquiryType || ENQUIRY_TYPES[0] }));
                        scrollToForm();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F3B22] group-hover:gap-3 transition-all pt-1"
                    >
                      {C.servicesSection.quoteButton} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- PROCESS ---------------- */}
        <section className="b4p-fixed-theme bg-[#142B1A] text-white rounded-[2rem] p-8 sm:p-14 relative overflow-hidden">
          <FloatingLeaves />
          <Reveal className="relative text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-bold text-[#B7D7A8] uppercase tracking-[0.24em] block mb-2">{C.process.eyebrow}</span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold">{C.process.title}</h2>
          </Reveal>
          <div ref={stepsRef} className="relative">
            <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-white/15" />
            <motion.div
              className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-[#B7D7A8] origin-left"
              style={{ scaleX: stepsProgress }}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {STEPS.map((st, i) => (
                <Reveal key={i} delay={i * 0.12} className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 mx-auto rounded-full bg-[#B7D7A8] text-[#142B1A] font-editorial font-extrabold flex items-center justify-center shadow-[0_0_0_8px_rgba(183,215,168,0.15)]"
                  >
                    {i + 1}
                  </motion.div>
                  <h4 className="font-bold text-base mt-4">{st.title}</h4>
                  <p className="text-xs text-white/70 leading-relaxed mt-1.5 max-w-[220px] mx-auto">{st.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- TIPS ---------------- */}
        <section className="space-y-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] inline-flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5" /> {C.tips.eyebrow}
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-extrabold text-[#142B1A]">{C.tips.title}</h2>
            <p className="text-sm text-[#5C5C5C] mt-3">{C.tips.subtitle}</p>
          </Reveal>

          <Reveal className="flex justify-center">
            <div className="inline-flex p-1.5 bg-white border border-[#E5E2D9] rounded-full gap-1 overflow-x-auto max-w-full">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeason(s.id)}
                  className={`relative px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    season === s.id ? 'text-white' : 'text-[#1F3B22] hover:bg-[#F3F1EB]'
                  }`}
                >
                  {season === s.id && (
                    <motion.span layoutId="season-pill" className="absolute inset-0 rounded-full bg-[#1F3B22]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative inline-flex items-center gap-1.5">
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSeason.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-center text-xs font-semibold text-[#7A7A7A] mb-5">{activeSeason.months}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {activeSeason.tips.map((tp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, rotate: -1 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.45, ease }}
                    whileHover={{ y: -5, rotate: i % 2 ? 1 : -1 }}
                    className="bg-white rounded-3xl border border-[#E5E2D9] p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#EBF5EC] text-[#1F3B22] flex items-center justify-center mb-3">
                      {i === 0 ? <Droplets className="w-4 h-4" /> : i === 1 ? <Leaf className="w-4 h-4" /> : i === 2 ? <Flower2 className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                    </div>
                    <h4 className="text-sm font-bold text-[#142B1A]">{tp.t}</h4>
                    <p className="text-xs text-[#5C5C5C] leading-relaxed mt-1.5">{tp.d}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* FAQ */}
          <div className="grid lg:grid-cols-5 gap-8 pt-8">
            <Reveal className="lg:col-span-2 space-y-3">
              <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#142B1A]">{C.faq.title}</h3>
              <p className="text-sm text-[#5C5C5C]">{C.faq.text}</p>
              <button
                onClick={() => {
                  setForm((f) => ({ ...f, enquiryType: HELP }));
                  scrollToForm();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#EBF5EC] border border-[#C5E1C9] text-xs font-bold text-[#1F3B22] hover:bg-[#DCEFE0] transition-colors"
              >
                <Lightbulb className="w-4 h-4" /> {C.faq.button}
              </button>
            </Reveal>
            <div className="lg:col-span-3 space-y-3">
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <Reveal key={i} delay={i * 0.05}>
                    <div className={`rounded-2xl border bg-white transition-colors ${open ? 'border-[#2D6A4F]/50' : 'border-[#E5E2D9]'}`}>
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="w-full flex items-center justify-between gap-4 p-5 text-left"
                        aria-expanded={open}
                      >
                        <span className="text-sm font-bold text-[#142B1A]">{f.q}</span>
                        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 w-7 h-7 rounded-full bg-[#F3F1EB] flex items-center justify-center">
                          <ChevronDown className="w-4 h-4 text-[#1F3B22]" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 text-sm text-[#5C5C5C] leading-relaxed">{f.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- ENQUIRY FORM ---------------- */}
        <section id="book-consultation" className="scroll-mt-24">
          <Reveal>
            <div className="grid lg:grid-cols-5 rounded-[2rem] overflow-hidden border border-[#E5E2D9] shadow-xl bg-white">
              {/* side panel */}
              <div className="b4p-fixed-theme lg:col-span-2 bg-[#142B1A] text-white p-8 sm:p-10 relative overflow-hidden">
                <FloatingLeaves />
                <div className="relative space-y-6">
                  <span className="text-[10px] font-bold text-[#B7D7A8] uppercase tracking-[0.24em] block">{C.contact.eyebrow}</span>
                  <h2 className="font-editorial text-3xl sm:text-4xl font-extrabold leading-tight">{C.contact.title}</h2>
                  <p className="text-sm text-white/75 leading-relaxed">{C.contact.text}</p>
                  <div className="space-y-3 pt-2">
                    <a
                      href={`https://wa.me/${whatsappNum}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                      <span className="text-sm font-semibold">WhatsApp: +{whatsappNum}</span>
                    </a>
                    <a href={`tel:+${whatsappNum}`} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors">
                      <Phone className="w-5 h-5 text-[#B7D7A8]" />
                      <span className="text-sm font-semibold">{C.contact.callLabel}</span>
                    </a>
                    {settings.contactEmail && (
                      <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors">
                        <Mail className="w-5 h-5 text-[#B7D7A8]" />
                        <span className="text-sm font-semibold break-all">{settings.contactEmail}</span>
                      </a>
                    )}
                  </div>
                  <ul className="space-y-2 pt-2 text-xs text-white/80">
                    {C.contact.bullets.filter(Boolean).map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#B7D7A8]" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* form */}
              <div className="lg:col-span-3 p-6 sm:p-10">
                <AnimatePresence mode="wait">
                  {status === 'done' ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center py-10 space-y-5"
                    >
                      <svg viewBox="0 0 52 52" className="w-20 h-20">
                        <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#2D6A4F" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                        <motion.path
                          d="M15 27 l7 7 l15 -16"
                          fill="none"
                          stroke="#2D6A4F"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.5, duration: 0.45 }}
                        />
                      </svg>
                      <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#142B1A]">{C.form.successTitle}, {form.fullName.split(' ')[0]}!</h3>
                      <p className="text-sm text-[#5C5C5C] max-w-md">
                        {C.form.successText ? (
                          C.form.successText
                        ) : (
                          <>
                            We have received your enquiry for <strong>{form.enquiryType.toLowerCase()}</strong>. Our team will call you on{' '}
                            <strong>{form.phone}</strong>.
                          </>
                        )}
                      </p>
                      {waConfirmed && (
                        <p className="text-xs font-semibold text-[#1F7A3E] bg-[#EAF7EE] border border-[#BFE5CB] rounded-full px-4 py-2 inline-flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" /> We have sent a confirmation to your WhatsApp.
                        </p>
                      )}
                      <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <a
                          href={`https://wa.me/${whatsappNum}?text=${waText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-6 py-3 rounded-full bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 hover:brightness-95"
                        >
                          <MessageCircle className="w-4 h-4" /> Also send on WhatsApp
                        </a>
                        <button
                          onClick={() => {
                            setForm(emptyForm);
                            setStatus('idle');
                          }}
                          className="px-6 py-3 rounded-full border border-[#DDD9CF] text-xs font-bold uppercase tracking-wider text-[#1F3B22] hover:bg-[#FAF9F5]"
                        >
                          New enquiry
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                      <div>
                        <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-2">{C.form.labels.need}</span>
                        <LayoutGroup id="enq-type">
                          <div className="flex flex-wrap gap-2">
                            {ENQUIRY_TYPES.map((t) => {
                              const active = form.enquiryType === t;
                              return (
                                <button
                                  type="button"
                                  key={t}
                                  onClick={() => setForm({ ...form, enquiryType: t })}
                                  className={`relative px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
                                    active ? 'text-white border-transparent' : 'text-[#1F3B22] border-[#DDD9CF] hover:border-[#2D6A4F] bg-[#FAF9F5]'
                                  }`}
                                >
                                  {active && <motion.span layoutId="enq-pill" className="absolute inset-0 rounded-full bg-[#1F3B22]" transition={{ type: 'spring', stiffness: 450, damping: 34 }} />}
                                  <span className="relative">{t}</span>
                                </button>
                              );
                            })}
                          </div>
                        </LayoutGroup>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1.5">{C.form.labels.name}</span>
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
                          <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1.5">{C.form.labels.phone}</span>
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
                          <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1.5">{C.form.labels.email}</span>
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
                          <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1.5">{C.form.labels.organisation}</span>
                          <input
                            className={inputCls()}
                            value={form.organisation}
                            onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                            placeholder={C.form.labels.organisationPlaceholder}
                          />
                        </label>
                        <label className="block">
                          <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1.5">{C.form.labels.propertyType}</span>
                          <select className={inputCls()} value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
                            {PROPERTY_TYPES.map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1.5">{C.form.labels.city}</span>
                          <select className={inputCls()} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                            {CITIES.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <AnimatePresence initial={false}>
                        {!isHelp && (
                          <motion.label
                            className="block overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1.5">{C.form.labels.area}</span>
                            <select className={inputCls()} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                              {AREAS.map((a) => (
                                <option key={a}>{a}</option>
                              ))}
                            </select>
                          </motion.label>
                        )}
                      </AnimatePresence>

                      <label className="block">
                        <span className="block text-xs font-bold text-[#141414] uppercase tracking-wider mb-1.5">
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

                      <motion.button
                        type="submit"
                        disabled={status === 'saving'}
                        whileHover={{ scale: status === 'saving' ? 1 : 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-[#1F3B22] hover:bg-[#162D19] disabled:opacity-70 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
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
                      </motion.button>
                      <p className="text-[11px] text-center text-[#8A8A8A]">{C.form.privacyNote}</p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
};
