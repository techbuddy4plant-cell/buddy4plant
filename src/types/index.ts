export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  category: string;
  subCategory?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  plantType: string;
  plantSize?: string;
  availableSizes?: string[];
  weightVolume?: string;
  weightOptions?: string[];
  lightRequirement: 'Low Light' | 'Bright Indirect Light' | 'Direct Sunlight' | 'Medium Light';
  wateringFrequency: 'Once a week' | 'Twice a week' | 'When topsoil is dry' | 'Every 10-14 days';
  maintenanceLevel: 'Easy' | 'Moderate' | 'High';
  location: 'Office Desk' | 'Living Room' | 'Bedroom' | 'Balcony' | 'Windowsill' | 'Bathroom';
  indoorOutdoor: 'Indoor' | 'Outdoor' | 'Both';
  petFriendly: boolean;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  active: boolean;
  tags: string[];
  careInstructions?: {
    light: string;
    water: string;
    temperature: string;
    fertilizer: string;
    tips: string;
  };
  createdAt?: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
  order: number;
  subCategories: string[];
  active: boolean;
}

export interface BotanicalProject {
  id: string;
  title: string;
  location: string;
  category: string;
  image: string;
  description: string;
  speciesCount: number;
  plantHighlights: string[];
  tag: string;
  featured?: boolean;
  area?: string;
  duration?: string;
  client?: string;
  active?: boolean;
  createdAt?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPotColor?: string;
  selectedSize?: string;
  selectedWeight?: string;
  unitPrice?: number;
}

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
  selectedSize?: string;
  selectedWeight?: string;
  selectedPotColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  cancelledBy?: 'user' | 'admin' | 'system';
  cancelReason?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  trackingNumber?: string;
  deliveryCourier?: string;
  courierPartner?: string;
  currentLocation?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  statusHistory?: {
    status: OrderStatus;
    timestamp: number;
    note?: string;
    location?: string;
  }[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string; // YYYY-MM-DD
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  description?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoText: string;
  contactEmail: string;
  contactPhone: string;
  whatsappSupportNumber: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  orderPrefix: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  taxRatePercentage: number;
  announcementBarText: string;
  announcementBarActive: boolean;
  socialLinks: {
    instagram: string;
    facebook: string;
    pinterest: string;
    youtube: string;
  };
}

export interface PaymentSettings {
  onlinePaymentsEnabled: boolean;
  codEnabled: boolean;
  upiEnabled: boolean;
  minCodAmount: number;
  maxCodAmount: number;
  razorpayKeyId: string;
  sandboxMode: boolean;
}

export interface HomepageCMS {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroImage: string;
  heroPrimaryButtonText: string;
  heroPrimaryButtonLink: string;
  heroSecondaryButtonText: string;
  heroSecondaryButtonLink: string;
  bannerPromoText: string;
  bannerPromoImage: string;
  featuredCollectionTitle: string;
  featuredCategoryIds: string[];
  siteBackground?: string;
  siteTextColor?: string;
  siteThemeMode?: 'cream' | 'forest' | 'white' | 'terracotta' | 'dark' | 'custom';
  primaryColor?: string;
  fontStyle?: 'serif' | 'sans' | 'clean';
  amazonBadgesEnabled?: boolean;
  announcementText?: string;
  announcementLink?: string;
  botanicaTitle?: string;
  botanicaSubtitle?: string;
  botanicaImage?: string;
  botanicaButtonText?: string;
  botanicaButtonLink?: string;
  whatsInsideTitle?: string;
  whatsInsideSubtitle?: string;
  trustBadge1?: string;
  trustBadge2?: string;
  trustBadge3?: string;
  trustBadge4?: string;
  livingSpacesTitle?: string;
  livingSpacesSubtitle?: string;
  projectsTitle?: string;
  projectsSubtitle?: string;
  whyChooseUsTitle?: string;
  whyChooseUsSubtitle?: string;
  reviewsTitle?: string;
  reviewsSubtitle?: string;
  consultationTitle?: string;
  consultationSubtitle?: string;
  consultationButtonText?: string;
  footerTagline?: string;
  newsletterTitle?: string;
  newsletterSubtitle?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  createdAt: number;
}

export interface FilterState {
  category: string;
  plantType: string[];
  light: string[];
  location: string[];
  maintenance: string[];
  watering: string[];
  petFriendly: boolean | null;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  searchQuery: string;
  inStockOnly: boolean;
}
