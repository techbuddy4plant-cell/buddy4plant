import { StoreSettings, PaymentSettings, HomepageCMS, Coupon, Review } from '../types';

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'buddy4plant',
  tagline: 'Your Botanical Buddy & Green Sanctuary',
  logoText: 'buddy4plant',
  contactEmail: 'care@buddy4plant.com',
  contactPhone: '+91 98765 43210',
  whatsappSupportNumber: '+91 98765 43210',
  storeAddress: '42 Greenway Pavilion, Indiranagar, Bengaluru, Karnataka 560038, India',
  currency: 'INR',
  currencySymbol: '₹',
  orderPrefix: 'B4P-',
  deliveryCharge: 99,
  freeDeliveryThreshold: 999,
  taxRatePercentage: 5,
  announcementBarText: 'Welcome to buddy4plant: Free Ceramic Pot with Orders above ₹1,499 | Free Express Delivery over ₹999',
  announcementBarActive: true,
  socialLinks: {
    instagram: 'https://instagram.com/buddy4plant',
    facebook: 'https://facebook.com/buddy4plant',
    pinterest: 'https://pinterest.com/buddy4plant',
    youtube: 'https://youtube.com/buddy4plant'
  }
};

export const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  onlinePaymentsEnabled: true,
  codEnabled: true,
  upiEnabled: true,
  minCodAmount: 299,
  maxCodAmount: 5000,
  razorpayKeyId: 'rzp_test_VanaDemo2026',
  sandboxMode: true
};

export const INITIAL_HOMEPAGE_CMS: HomepageCMS = {
  heroTitle: 'Adding Life to Your Spaces.',
  heroSubtitle: 'Lush, nursery-grown houseplants potted in intelligent self-watering planters and enriched with 100% cold-pressed organic bio-nutrients. Delivered safely with a 7-day fresh guarantee.',
  heroBadge: "India's Premier Live Plants & Planters Destination",
  heroImage: '/editorial/kyari-living-plants-hero.jpg',
  heroPrimaryButtonText: 'Shop Live Houseplants',
  heroPrimaryButtonLink: '/plants',
  heroSecondaryButtonText: 'Organic Plant Care & Pots',
  heroSecondaryButtonLink: '/plants/plant-care',
  bannerPromoText: 'Transform your balcony into a tranquil personal sanctuary. Discover our weather-resilient greens.',
  bannerPromoImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  featuredCollectionTitle: 'Curated for Conscious Spaces',
  featuredCategoryIds: ['indoor-plants', 'air-purifying', 'low-maintenance', 'combos'],
  siteBackground: '#FDFCF9',
  siteTextColor: 'auto',
  siteThemeMode: 'cream',
  amazonBadgesEnabled: true,
  announcementText: 'Welcome to buddy4plant: Free Ceramic Pot with Orders above ₹1,499 | Free Express Delivery over ₹999',
  announcementLink: '/plants',
  botanicaTitle: 'Slow-grown.\nNurtured weekly.',
  botanicaSubtitle: 'Organic plant food and microbiome fertilizers crafted from what takes nature years to form. Feeds roots deep, settles clean.',
  botanicaImage: '/editorial/botanica-stone-slab.jpg',
  botanicaButtonText: 'Shop Organic Plant Food',
  botanicaButtonLink: '/plants/plant-care',
  whatsInsideTitle: "What's inside",
  whatsInsideSubtitle: 'Each organic nutrient was chosen because it works for living plants. Not because it looks good on a label.',
  trustBadge1: 'Safe Pan-India Transit — Guaranteed zero leaf breakage with ventilated chambers',
  trustBadge2: 'Self-Watering Planters — Sub-irrigation reservoirs keep roots hydrated for 10–14 days',
  trustBadge3: '100% Organic Nutrition — Cold-pressed kelp & mycorrhizae for lush chlorophyll',
  trustBadge4: 'Free Plant Doctor Help — Direct 1-on-1 WhatsApp guidance from botanists anytime',
  livingSpacesTitle: 'Shop by Living Space',
  livingSpacesSubtitle: 'Every room possesses its own natural light and humidity rhythm. Select flora calibrated to thrive.',
  projectsTitle: 'Curated Botanical Projects',
  projectsSubtitle: 'From compact urban balconies to full corporate atriums, explore living spaces thoughtfully greenscaped with our nurtured flora.',
  whyChooseUsTitle: 'Cultivated with Patience & Precision',
  whyChooseUsSubtitle: 'Every green specimen is acclimatized in our bio-controlled sanctuary before finding a home in your living space.',
  reviewsTitle: 'Loved in 50,000+ Homes',
  reviewsSubtitle: 'Authentic reflections from plant parents experiencing living serene spaces.',
  consultationTitle: 'Got Questions About Your Houseplants?',
  consultationSubtitle: 'Chat 1-on-1 with certified horticulturists for watering diagnosis, repotting guidance, and light positioning tips.',
  consultationButtonText: 'Chat on WhatsApp Now',
  footerTagline: 'Cultivating mindful living spaces through hand-nurtured botanical flora, microbiome-rich organic soil, and artisanal planters designed to endure.',
  newsletterTitle: 'The Botanical Journal',
  newsletterSubtitle: 'Subscribe for seasonal watering rhythms, rare specimen drops, and indoor styling guides.',
};

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 250,
    expiryDate: '2027-12-31',
    usageLimit: 1000,
    usedCount: 142,
    active: true,
    description: '10% off on your first order above ₹499 (Max ₹250)'
  },
  {
    id: 'green15',
    code: 'GREEN15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 1299,
    maxDiscount: 500,
    expiryDate: '2027-12-31',
    usageLimit: 500,
    usedCount: 78,
    active: true,
    description: '15% off on botanical orders above ₹1,299'
  },
  {
    id: 'monsoon500',
    code: 'MONSOON500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderValue: 2499,
    expiryDate: '2027-12-31',
    usageLimit: 200,
    usedCount: 33,
    active: true,
    description: 'Flat ₹500 off on large garden & bundle orders above ₹2,499'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'peace-lily-deluxe',
    productName: 'Spathiphyllum Peace Lily',
    userId: 'usr-ananya',
    userName: 'Ananya Sharma',
    userEmail: 'ananya.s@example.com',
    rating: 5,
    title: 'Arrived in pristine condition!',
    comment: 'The packaging is exceptional. The soil was damp, not a single leaf was bent, and two blooms opened within 4 days of arriving in Bengaluru!',
    verifiedPurchase: true,
    approved: true,
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'rev-2',
    productId: 'snake-plant-laurentii',
    productName: 'Sansevieria Golden Snake Plant',
    userId: 'usr-rohit',
    userName: 'Rohit Verma',
    userEmail: 'rohit.v@example.com',
    rating: 5,
    title: 'Perfect bedroom addition',
    comment: 'Lush golden borders and very healthy roots. Truly zero-fuss maintenance; I water it only twice a month.',
    verifiedPurchase: true,
    approved: true,
    createdAt: Date.now() - 86400000 * 9
  },
  {
    id: 'rev-3',
    productId: 'trio-purifier-combo',
    productName: 'The NASA Air Detox Trio Bundle',
    userId: 'usr-priya',
    userName: 'Priya Iyer',
    userEmail: 'priya.i@example.com',
    rating: 5,
    title: 'Superb quality ceramic planters',
    comment: 'Bought this for our housewarming. The matching pots look so elegant on our console table. Friends keep asking where we bought them.',
    verifiedPurchase: true,
    approved: true,
    createdAt: Date.now() - 86400000 * 14
  }
];
