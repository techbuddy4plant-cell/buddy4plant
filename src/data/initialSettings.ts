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
  heroTitle: 'Bring Home a Little More Green.',
  heroSubtitle: 'Hand-nurtured botanical plants, artisanal planters, and organic care kits crafted for serene Indian homes.',
  heroBadge: 'Premium Indian Botanical Living',
  heroImage: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1600&q=85',
  heroPrimaryButtonText: 'Shop All Plants',
  heroPrimaryButtonLink: '/plants',
  heroSecondaryButtonText: 'Explore Curated Combos',
  heroSecondaryButtonLink: '/plants/combos',
  bannerPromoText: 'Transform your balcony into a tranquil personal sanctuary. Discover our weather-resilient greens.',
  bannerPromoImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  featuredCollectionTitle: 'Curated for Conscious Spaces',
  featuredCategoryIds: ['indoor-plants', 'air-purifying', 'low-maintenance', 'combos'],
  siteBackground: '#FDFCF9',
  siteThemeMode: 'cream',
  amazonBadgesEnabled: true,
  announcementText: 'Welcome to buddy4plant: Free Ceramic Pot with Orders above ₹1,499 | Free Express Delivery over ₹999',
  announcementLink: '/plants',
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
