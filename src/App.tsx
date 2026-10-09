import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { storefrontBackground, StoreSettingsProvider, useStoreSettings } from './context/StoreSettingsContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { WhatsAppFloat } from './components/common/WhatsAppFloat';
import { CartDrawer } from './components/cart/CartDrawer';
import { useBackClose } from './hooks/useBackClose';
import { AuthModal } from './components/common/AuthModal';
import { QuickViewModal } from './components/common/QuickViewModal';

import { HomePage } from './components/storefront/HomePage';
import { Product } from './types';

// Pages load on demand so the first visit only downloads what the home page needs
const StoreLocatorPage = lazy(() => import('./components/pages/StoreLocatorPage').then((m) => ({ default: m.StoreLocatorPage })));
const ProductListingPage = lazy(() => import('./components/catalogue/ProductListingPage').then((m) => ({ default: m.ProductListingPage })));
const ProductDetailPage = lazy(() => import('./components/product/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CheckoutPage = lazy(() => import('./components/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderSuccess = lazy(() => import('./components/order/OrderSuccess').then((m) => ({ default: m.OrderSuccess })));
const OrderTrackingPage = lazy(() => import('./components/order/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage })));
const UserProfilePage = lazy(() => import('./components/account/UserProfilePage').then((m) => ({ default: m.UserProfilePage })));
const UserOrdersPage = lazy(() => import('./components/account/UserOrdersPage').then((m) => ({ default: m.UserOrdersPage })));
const WishlistPage = lazy(() => import('./components/pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const ProjectsPage = lazy(() => import('./components/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const BlogPage = lazy(() => import('./components/pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const GardenServicesPage = lazy(() => import('./components/pages/GardenServicesPage').then((m) => ({ default: m.GardenServicesPage })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const AdminLoginPage = lazy(() => import('./components/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const Scene = lazy(() => import('./Scene').then((m) => ({ default: m.Scene })));
const AboutUsPage = lazy(() => import('./components/pages/StaticPages').then((m) => ({ default: m.AboutUsPage })));
const ContactUsPage = lazy(() => import('./components/pages/StaticPages').then((m) => ({ default: m.ContactUsPage })));
const ReviewsPage = lazy(() => import('./components/pages/StaticPages').then((m) => ({ default: m.ReviewsPage })));
const CareGuidePage = lazy(() => import('./components/pages/StaticPages').then((m) => ({ default: m.CareGuidePage })));
const ShippingPolicyPage = lazy(() => import('./components/pages/StaticPages').then((m) => ({ default: m.ShippingPolicyPage })));
const TermsAndConditionsPage = lazy(() => import('./components/pages/StaticPages').then((m) => ({ default: m.TermsAndConditionsPage })));
const PrivacyPolicyPage = lazy(() => import('./components/pages/StaticPages').then((m) => ({ default: m.PrivacyPolicyPage })));
const RefundPolicyPage = lazy(() => import('./components/pages/StaticPages').then((m) => ({ default: m.RefundPolicyPage })));

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  useBackClose(!!quickViewProduct, () => setQuickViewProduct(null));

  // Admin authentication state checked from sessionStorage
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('b4p_admin_secured_session') === 'authenticated_true';
  });

  // Client-side router navigation helper
  const navigate = (path: string) => {
    // an open drawer/modal added its own history entry - reuse it instead of stacking another
    if (window.history.state?.b4pOverlay) window.history.replaceState({}, '', path);
    else window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine current active view based on path
  const renderCurrentView = () => {
    const path = currentPath;

    // Secure Admin Portal: Accessible ONLY at /b4padmin
    if (path === '/b4padmin' || path.startsWith('/b4padmin')) {
      const isAuthed = sessionStorage.getItem('b4p_admin_secured_session') === 'authenticated_true' || isAdminAuthenticated;
      if (isAuthed) {
        return <AdminDashboard navigate={navigate} />;
      }
      return (
        <AdminLoginPage
          onLoginSuccess={() => {
            sessionStorage.setItem('b4p_admin_secured_session', 'authenticated_true');
            setIsAdminAuthenticated(true);
          }}
          navigate={navigate}
        />
      );
    }

    // Redirect legacy or public /admin attempts away to maintain absolute security
    if (path.startsWith('/admin')) {
      return <HomePage navigate={navigate} onQuickView={setQuickViewProduct} />;
    }

    if (path === '/scene' || path === '/sylva-hero' || path === '/sylva') {
      return <Scene />;
    }

    if (path === '/' || path === '') {
      return <HomePage navigate={navigate} onQuickView={setQuickViewProduct} />;
    }

    if (path === '/plants' || path === '/plants/' || path.startsWith('/plants?') || path.startsWith('/plants#')) {
      return (
        <ProductListingPage
          initialCategorySlug="all"
          navigate={navigate}
          onQuickView={setQuickViewProduct}
        />
      );
    }

    if (path.startsWith('/plants/')) {
      const categorySlug = path.replace('/plants/', '').split('/')[0].split('?')[0];
      return (
        <ProductListingPage
          initialCategorySlug={categorySlug}
          navigate={navigate}
          onQuickView={setQuickViewProduct}
        />
      );
    }

    if (path === '/collections' || path === '/collections/' || path.startsWith('/collections?') || path.startsWith('/collections#')) {
      return (
        <ProductListingPage
          initialCategorySlug="all"
          navigate={navigate}
          onQuickView={setQuickViewProduct}
        />
      );
    }

    if (path.startsWith('/collections/')) {
      const categorySlug = path.replace('/collections/', '').split('/')[0].split('?')[0];
      return (
        <ProductListingPage
          initialCategorySlug={categorySlug}
          navigate={navigate}
          onQuickView={setQuickViewProduct}
        />
      );
    }

    if (path.startsWith('/product/')) {
      const productSlug = path.replace('/product/', '').split('/')[0].split('?')[0];
      return (
        <ProductDetailPage
          slug={productSlug}
          navigate={navigate}
          onQuickView={setQuickViewProduct}
        />
      );
    }

    if (path === '/checkout' || path.startsWith('/checkout')) {
      return <CheckoutPage navigate={navigate} />;
    }

    if (path.startsWith('/order-success/')) {
      const orderNumber = path.replace('/order-success/', '').split('/')[0];
      return <OrderSuccess orderNumber={orderNumber} navigate={navigate} />;
    }

    if (path.startsWith('/track-order')) {
      return <UserProfilePage initialTab="track-order" navigate={navigate} onQuickView={setQuickViewProduct} />;
    }

    if (path === '/orders' || path.startsWith('/orders') || path.startsWith('/account/orders') || path === '/my-orders') {
      return <UserProfilePage initialTab="track-order" navigate={navigate} onQuickView={setQuickViewProduct} />;
    }

    if (path === '/blog' || path.startsWith('/blog')) {
      return <BlogPage navigate={navigate} />;
    }

    if (path === '/garden-services' || path.startsWith('/garden-services')) {
      return <GardenServicesPage navigate={navigate} />;
    }

    if (path === '/gifting' || path.startsWith('/gifting')) {
      return (
        <ProductListingPage
          initialCategorySlug={(() => {
            const sub = path.replace('/gifting', '').replace(/^\//, '').split('/')[0].split('?')[0];
            return sub ? `${sub}-gifting` : 'gifting';
          })()}
          navigate={navigate}
          onQuickView={setQuickViewProduct}
        />
      );
    }

    if (path === '/profile' || path.startsWith('/profile') || path === '/account' || path.startsWith('/account') || path === '/my-profile') {
      return <UserProfilePage navigate={navigate} onQuickView={setQuickViewProduct} />;
    }

    if (path === '/wishlist' || path.startsWith('/wishlist')) {
      return <WishlistPage navigate={navigate} onQuickView={setQuickViewProduct} />;
    }

    if (path === '/projects' || path.startsWith('/projects')) {
      return <ProjectsPage navigate={navigate} />;
    }

    if (path === '/about') {
      return <AboutUsPage />;
    }

    // The Plant Doctor page was removed - old links go to the Plant Care Guide
    if (path === '/plant-doctor') {
      return <CareGuidePage navigate={navigate} />;
    }

    if (path === '/store-locator' || path === '/locate-store') {
      return <StoreLocatorPage navigate={navigate} />;
    }

    if (path === '/contact') {
      return <ContactUsPage />;
    }

    if (path === '/reviews' || path.startsWith('/reviews')) {
      return <ReviewsPage navigate={navigate} />;
    }

    if (path === '/care-guide' || path.startsWith('/care-guide')) {
      return <CareGuidePage navigate={navigate} />;
    }

    if (path === '/shipping-policy' || path.startsWith('/shipping-policy') || path === '/shipping') {
      return <ShippingPolicyPage navigate={navigate} />;
    }

    if (path === '/terms' || path === '/terms-and-conditions' || path.startsWith('/terms') || path === '/terms-of-service') {
      return <TermsAndConditionsPage navigate={navigate} />;
    }

    if (path === '/privacy' || path === '/privacy-policy' || path.startsWith('/privacy')) {
      return <PrivacyPolicyPage navigate={navigate} />;
    }

    if (path === '/refund-policy' || path === '/cancellation-policy' || path === '/returns' || path === '/refunds' || path.startsWith('/refund')) {
      return <RefundPolicyPage navigate={navigate} />;
    }

    // Default fallback
    return <HomePage navigate={navigate} onQuickView={setQuickViewProduct} />;
  };

  return (
    <StoreSettingsProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppShell
              currentPath={currentPath}
              navigate={navigate}
              renderCurrentView={renderCurrentView}
              quickViewProduct={quickViewProduct}
              setQuickViewProduct={setQuickViewProduct}
            />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </StoreSettingsProvider>
  );
}

const AppShell: React.FC<{
  currentPath: string;
  navigate: (path: string) => void;
  renderCurrentView: () => React.ReactNode;
  quickViewProduct: Product | null;
  setQuickViewProduct: (p: Product | null) => void;
}> = ({ currentPath, navigate, renderCurrentView, quickViewProduct, setQuickViewProduct }) => {
  const { homepageCMS, isDarkMode, effectiveTextColor } = useStoreSettings();
  const isB4PAdminRoute = (currentPath || '').startsWith('/b4padmin');

  const siteBg = storefrontBackground(homepageCMS.siteBackground);
  const isImage = !isDarkMode && (siteBg.startsWith('http') || siteBg.startsWith('data:') || siteBg.startsWith('/'));

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-[#2D4A27] selection:text-white ${
        isDarkMode ? 'dark bg-[#101711] text-[#E5EAE3]' : ''
      }`}
      style={{
        backgroundColor: isImage ? undefined : siteBg,
        backgroundImage: isImage ? `url(${siteBg})` : undefined,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        color: "#1A1A1A",
      }}
    >
      {!isB4PAdminRoute && <Navbar currentPath={currentPath} navigate={navigate} />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Suspense
              fallback={
                <div className="min-h-[60vh] flex items-center justify-center" aria-busy="true">
                  <span className="w-8 h-8 rounded-full border-2 border-[#13301B]/20 border-t-[#13301B] animate-spin" />
                </div>
              }
            >
              {renderCurrentView()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {!isB4PAdminRoute && <Footer navigate={navigate} />}
      {!isB4PAdminRoute && <WhatsAppFloat />}

      {/* Drawers & Modals */}
      <CartDrawer navigate={navigate} />
      <AuthModal />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        navigate={navigate}
      />
    </div>
  );
};

