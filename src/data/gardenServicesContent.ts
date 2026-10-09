/**
 * Everything shown on the Gardening Services page (/garden-services) that is not a project.
 * Edited in Admin > Gardening Services > Page Content and saved with the home page settings
 * (homepageCMS.gardenServicesContent). Anything not saved yet falls back to these defaults.
 */

export const GARDEN_ICON_NAMES = [
  'Landmark',
  'CalendarCheck',
  'Home',
  'Building2',
  'Trees',
  'MapPin',
  'Sprout',
  'Leaf',
  'Flower2',
  'ShieldCheck',
  'Sun',
  'CloudRain',
  'Snowflake',
  'Droplets',
  'Wrench',
  'Sparkles',
] as const;
export type GardenIconName = (typeof GARDEN_ICON_NAMES)[number];

export interface GardenStat {
  /** a number, or "auto:projects" / "auto:sites" / "auto:multisite" to count from the projects */
  value: string;
  suffix: string;
  label: string;
  icon: GardenIconName;
}
export interface GardenService {
  id: string;
  icon: GardenIconName;
  title: string;
  text: string;
  points: string[];
  /** optional photo shown at the top of the service card */
  image?: string;
  /** enquiry type pre-selected when "Get a quote" is pressed */
  enquiryType: string;
}
export interface GardenSeason {
  id: string;
  label: string;
  months: string;
  icon: GardenIconName;
  tips: { t: string; d: string }[];
}

export interface GardenServicesContent {
  /** Project card order on the Gardening Services page (project ids, first = shown first) */
  projectOrder?: string[];
  seo: { title: string; description: string };
  hero: {
    badge: string;
    headline: string;
    /** words in the headline shown in light green, separated by spaces */
    highlightWords: string;
    subtitle: string;
    primaryButton: string;
    whatsappButton: string;
    whatsappMessage: string;
    projectsButton: string;
    /** photos for the rotating cards on the right; empty = use project cover photos */
    images: string[];
  };
  stats: GardenStat[];
  trustedByLabel: string;
  /** extra names added to the scrolling "Trusted by" strip (project clients are added automatically) */
  trustedByExtra: string[];
  projectsSection: { eyebrow: string; title: string; subtitle: string };
  privateSection: { enabled: boolean; eyebrow: string; title: string; subtitle: string; button: string };
  servicesSection: { eyebrow: string; title: string; subtitle: string; quoteButton: string };
  services: GardenService[];
  process: { eyebrow: string; title: string; steps: { title: string; text: string }[] };
  tips: { eyebrow: string; title: string; subtitle: string; seasons: GardenSeason[] };
  faq: { title: string; text: string; button: string; items: { q: string; a: string }[] };
  contact: {
    eyebrow: string;
    title: string;
    text: string;
    callLabel: string;
    bullets: string[];
  };
  form: {
    enquiryTypes: string[];
    helpType: string;
    propertyTypes: string[];
    cities: string[];
    areas: string[];
    submitButton: string;
    helpSubmitButton: string;
    labels: {
      need: string;
      name: string;
      namePlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      organisation: string;
      organisationPlaceholder: string;
      propertyType: string;
      city: string;
      area: string;
      message: string;
      messagePlaceholder: string;
      question: string;
      questionPlaceholder: string;
    };
    privacyNote: string;
    successTitle: string;
    /** leave empty to show: We have received your enquiry for ... Our team will call you on ... */
    successText: string;
  };
}

export const DEFAULT_GARDEN_CONTENT: GardenServicesContent = {
  seo: {
    title: 'Gardening & Landscaping Services in Lucknow',
    description:
      'Landscaping, garden design and Annual Maintenance Contracts (AMC) for homes, offices and government campuses across Uttar Pradesh and Delhi.',
  },
  hero: {
    badge: 'Gardening · Landscaping · AMC',
    headline: 'Greener Campuses, Offices & Homes across Uttar Pradesh & Delhi',
    highlightWords: 'Uttar Pradesh Delhi',
    subtitle:
      'From UP 112 and Nagar Nigam Lucknow to 8 GITI campuses and the BrahMos unit in the Defence Corridor - we design, build and maintain green spaces that stay beautiful all year.',
    primaryButton: 'Plan My Dream Garden',
    whatsappButton: 'WhatsApp Us',
    whatsappMessage: 'Hi Buddy4Plant team, I am interested in your landscaping / gardening services.',
    projectsButton: 'See Our Projects',
    images: [],
  },
  stats: [
    { value: 'auto:projects', suffix: '+', label: 'Major projects delivered', icon: 'Trees' },
    { value: 'auto:sites', suffix: '+', label: 'Sites landscaped & maintained', icon: 'MapPin' },
    { value: 'auto:multisite', suffix: '', label: 'GITI campuses in one contract', icon: 'Landmark' },
    { value: '12', suffix: ' months', label: 'Year-round AMC care', icon: 'CalendarCheck' },
  ],
  trustedByLabel: 'Trusted by',
  trustedByExtra: [],
  projectsSection: {
    eyebrow: 'Our Work',
    title: "Projects We're Proud Of",
    subtitle:
      'Government offices, training institutes, defence and industrial units, and commercial sites across Uttar Pradesh and Delhi. Tap any project to see details.',
  },
  privateSection: {
    enabled: true,
    eyebrow: 'Homes & Private Spaces',
    title: 'Private Projects',
    subtitle: 'Home gardens, terraces, balconies and villas we have designed, planted and maintained for families across Lucknow.',
    button: 'Plan my home garden',
  },
  servicesSection: { eyebrow: 'What We Do', title: 'Our Services', subtitle: '', quoteButton: 'Get a quote' },
  services: [
    {
      id: 'institutional',
      icon: 'Landmark',
      title: 'Institutional & Campus Landscaping',
      text: 'Complete landscaping for government offices, training institutes, colleges, industrial units and defence campuses - from layout to lawns, hedges, green belts and plantation.',
      points: ['Site survey & landscape layout', 'Lawn, hedge & green-belt development', 'Large-scale plantation drives'],
      enquiryType: 'New landscaping project',
    },
    {
      id: 'amc',
      icon: 'CalendarCheck',
      title: 'Annual Maintenance Contracts (AMC)',
      text: 'Year-round garden care by trained gardeners - mowing, pruning, weeding, manuring, seasonal flowers and plant replacement, on a fixed yearly contract.',
      points: ['Scheduled gardener visits or deployment', 'Seasonal flower & plant replacement', 'Monthly work reporting'],
      enquiryType: 'Annual maintenance (AMC)',
    },
    {
      id: 'home',
      icon: 'Home',
      title: 'Home, Balcony & Terrace Gardens',
      text: 'Beautiful green corners for homes and apartments - balcony makeovers, terrace gardens, kitchen gardens and small lawns designed for Lucknow weather.',
      points: ['Plant selection for your sunlight', 'Pots, planters & soil setup', 'Drip / easy watering options'],
      enquiryType: 'Balcony & terrace garden',
    },
    {
      id: 'office',
      icon: 'Building2',
      title: 'Office & Indoor Plant Styling',
      text: 'Healthy indoor plants for offices, reception areas and showrooms, with regular care visits so they always look fresh.',
      points: ['Low-light, air-purifying plants', 'Matching planters for your interiors', 'Routine care & replacement'],
      enquiryType: 'Indoor & office plants',
    },
  ],
  process: {
    eyebrow: 'How It Works',
    title: 'From Bare Land to Lush Green',
    steps: [
      { title: 'Site Visit', text: 'We visit, measure the area and check sunlight, soil, water and drainage.' },
      { title: 'Design & Quote', text: 'You get a clear layout, plant list and a transparent quotation.' },
      { title: 'Execution', text: 'Our team prepares soil, lays lawns and does the plantation on schedule.' },
      { title: 'Care & AMC', text: 'Regular maintenance keeps your garden green and healthy all year.' },
    ],
  },
  tips: {
    eyebrow: 'Help & Tips',
    title: 'Gardening Tips by Season',
    subtitle: 'Simple advice from our gardeners for Lucknow and North Indian weather.',
    seasons: [
      {
        id: 'summer',
        label: 'Summer',
        months: 'Apr - Jun',
        icon: 'Sun',
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
        icon: 'CloudRain',
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
        icon: 'Snowflake',
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
        icon: 'Sprout',
        tips: [
          { t: 'Feed every 30-45 days', d: 'Add a handful of vermicompost or organic plant food around each plant.' },
          { t: 'Prune regularly', d: 'Trim dry and yellow leaves and shape hedges - it keeps plants bushy and healthy.' },
          { t: 'Loosen the soil', d: 'Gently hoe the top soil once a month so air and water reach the roots.' },
          { t: 'Check under leaves', d: 'Look under leaves weekly for pests - early spotting means easy, organic control.' },
        ],
      },
    ],
  },
  faq: {
    title: "Questions? We've got answers.",
    text: 'Still stuck with a plant problem? Send us your question in the form below or a photo on WhatsApp.',
    button: 'Ask a Gardening Question',
    items: [
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
    ],
  },
  contact: {
    eyebrow: 'Get in Touch',
    title: 'Need gardening services or advice?',
    text: 'Tell us about your space - a campus, office, home garden or just one sick plant. Our team will call you back with the right solution.',
    callLabel: 'Call us',
    bullets: [],
  },
  form: {
    enquiryTypes: [
      'New landscaping project',
      'Annual maintenance (AMC)',
      'Garden / lawn maintenance',
      'Balcony & terrace garden',
      'Indoor & office plants',
      'Gardening help & tips',
    ],
    helpType: 'Gardening help & tips',
    propertyTypes: [
      'Home / Villa',
      'Apartment / Balcony',
      'Office / Corporate',
      'Government / Institution',
      'School / College',
      'Industrial / Factory',
      'Petrol pump / Commercial',
    ],
    cities: ['Lucknow', 'Kanpur', 'Delhi / NCR', 'Hardoi', 'Barabanki', 'Unnao', 'Sitapur', 'Raebareli', 'Other (Uttar Pradesh)', 'Other city'],
    areas: [
      'Balcony / terrace (under 500 sq.ft)',
      'Small garden (500 - 2,000 sq.ft)',
      'Medium campus (2,000 - 20,000 sq.ft)',
      'Large campus (1 acre +)',
      'Not sure yet',
    ],
    submitButton: 'Get My Garden Plan & Quote',
    helpSubmitButton: 'Send My Question',
    labels: {
      need: 'What do you need? *',
      name: 'Full Name *',
      namePlaceholder: 'e.g. Rahul Verma',
      phone: 'Mobile Number *',
      phonePlaceholder: '10-digit mobile number',
      email: 'Email (optional)',
      emailPlaceholder: 'you@example.com',
      organisation: 'Organisation (optional)',
      organisationPlaceholder: 'Office / institute / society name',
      propertyType: 'Property Type',
      city: 'City',
      area: 'Approximate Area',
      message: 'Tell us more (optional)',
      messagePlaceholder: 'Site details, what you want done, preferred plants, timelines...',
      question: 'Your Question *',
      questionPlaceholder: 'e.g. My money plant leaves are turning yellow, what should I do?',
    },
    privacyNote: 'We only use your details to contact you about this enquiry.',
    successTitle: 'Thank you',
    successText: '',
  },
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Saved content merged over the defaults, so new fields always have a value. */
export function resolveGardenContent(saved: unknown, legacy?: Record<string, any>): GardenServicesContent {
  const merge = (base: any, over: any): any => {
    if (!isObj(base)) return over === undefined || over === null ? base : over;
    const out: any = { ...base };
    if (isObj(over)) for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k];
    return out;
  };
  const c: GardenServicesContent = merge(DEFAULT_GARDEN_CONTENT, saved);
  // Older "Private Projects" settings saved before this editor existed
  if (legacy && !isObj((saved as any)?.privateSection)) {
    if (legacy.privateProjectsTitle) c.privateSection.title = legacy.privateProjectsTitle;
    if (legacy.privateProjectsSubtitle) c.privateSection.subtitle = legacy.privateProjectsSubtitle;
    if (legacy.privateProjectsEnabled === false) c.privateSection.enabled = false;
  }
  return c;
}
