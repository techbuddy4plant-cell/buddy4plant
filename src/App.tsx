import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/common/AuthModal';
import { QuickViewModal } from './components/common/QuickViewModal';

import { HomePage } from './components/storefront/HomePage';
import { ProductListingPage } from './components/catalogue/ProductListingPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderSuccess } from './components/order/OrderSuccess';
import { OrderTrackingPage } from './components/order/OrderTrackingPage';
import { UserProfilePage } from './components/account/UserProfilePage';
import { UserOrdersPage } from './components/account/UserOrdersPage';
import { AboutUsPage, PlantDoctorPage, ContactUsPage } from './components/pages/StaticPages';
import { WishlistPage } from './components/pages/WishlistPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { Product } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Admin authentication state checked from sessionStorage
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('b4p_admin_secured_session') === 'authenticated_true';
  });

  // Client-side router navigation helper
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
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

    if (path === '/' || path === '') {
      return <HomePage navigate={navigate} onQuickView={setQuickViewProduct} />;
    }

    if (path === '/plants' || path === '/plants/') {
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
      return <OrderTrackingPage />;
    }

    if (path === '/orders' || path.startsWith('/orders') || path.startsWith('/account/orders') || path === '/my-orders') {
      return <UserOrdersPage navigate={navigate} />;
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

    if (path === '/plant-doctor') {
      return <PlantDoctorPage />;
    }

    if (path === '/contact') {
      return <ContactUsPage />;
    }

    // Default fallback
    return <HomePage navigate={navigate} onQuickView={setQuickViewProduct} />;
  };

  const isB4PAdminRoute = (currentPath || '').startsWith('/b4padmin');

  return (
    <StoreSettingsProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen flex flex-col font-sans text-[#1A1A1A] bg-[#FDFCF9] selection:bg-[#2D4A27] selection:text-white">
              {!isB4PAdminRoute && <Navbar currentPath={currentPath} navigate={navigate} />}

              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPath}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {renderCurrentView()}
                  </motion.div>
                </AnimatePresence>
              </main>

              {!isB4PAdminRoute && <Footer navigate={navigate} />}

              {/* Drawers & Modals */}
              <CartDrawer navigate={navigate} />
              <AuthModal />
              <QuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                navigate={navigate}
              />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </StoreSettingsProvider>
  );
}

