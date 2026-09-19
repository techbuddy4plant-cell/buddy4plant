import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, PaymentSettings, HomepageCMS } from '../types';
import {
  getStoreSettings,
  getPaymentSettings,
  getHomepageCMS,
  saveStoreSettings,
  savePaymentSettings,
  saveHomepageCMS,
} from '../services/settingsService';
import {
  INITIAL_STORE_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_HOMEPAGE_CMS,
} from '../data/initialSettings';

export function calculateLuminance(hexOrColor?: string): number {
  if (!hexOrColor) return 255;
  if (hexOrColor.startsWith('http') || hexOrColor.startsWith('data:') || hexOrColor.startsWith('/')) {
    return 180;
  }
  let hex = hexOrColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) return 240;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return 240;

  // Standard perceived brightness formula:
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function getAutoTextColor(backgroundColor?: string): string {
  const brightness = calculateLuminance(backgroundColor);
  return brightness < 130 ? '#F3F4F6' : '#1A1A1A';
}

interface StoreSettingsContextType {
  settings: StoreSettings;
  paymentSettings: PaymentSettings;
  homepageCMS: HomepageCMS;
  loading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
  adminDarkMode: boolean;
  toggleAdminDarkMode: () => void;
  effectiveTextColor: string;
  updateStoreSettings: (newSettings: StoreSettings) => Promise<void>;
  updatePaymentSettings: (newSettings: PaymentSettings) => Promise<void>;
  updateHomepageCMS: (newCMS: HomepageCMS) => Promise<void>;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(INITIAL_PAYMENT_SETTINGS);
  const [homepageCMS, setHomepageCMS] = useState<HomepageCMS>(INITIAL_HOMEPAGE_CMS);
  const [loading, setLoading] = useState<boolean>(true);

  // Storefront dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('b4p_theme_mode');
      if (saved) return saved === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
    }
    return false;
  });

  // Admin panel dark mode
  const [adminDarkMode, setAdminDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('b4p_admin_theme_mode');
      if (saved) return saved === 'dark';
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('b4p_theme_mode', next ? 'dark' : 'light');
      } catch (e) {}
      return next;
    });
  };

  const setDarkMode = (val: boolean) => {
    setIsDarkMode(val);
    try {
      localStorage.setItem('b4p_theme_mode', val ? 'dark' : 'light');
    } catch (e) {}
  };

  const toggleAdminDarkMode = () => {
    setAdminDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('b4p_admin_theme_mode', next ? 'dark' : 'light');
      } catch (e) {}
      return next;
    });
  };

  // Compute effective text color based on settings & mode
  const siteBg = isDarkMode ? '#121A13' : (homepageCMS.siteBackground || '#FDFCF9');
  const brightness = calculateLuminance(siteBg);
  const isBgDark = isDarkMode || brightness < 130;
  const autoTextColor = isBgDark ? '#F3F4F6' : '#1A1A1A';
  const customText = homepageCMS.siteTextColor;
  const effectiveTextColor = (!isDarkMode && customText && customText !== 'auto') ? customText : autoTextColor;

  const loadAllSettings = async () => {
    try {
      const [s, p, h] = await Promise.all([
        getStoreSettings(),
        getPaymentSettings(),
        getHomepageCMS(),
      ]);
      setSettings(s);
      setPaymentSettings(p);
      setHomepageCMS(h);
    } catch (err) {
      console.warn('Error loading store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();

    const handleDataChanged = () => {
      loadAllSettings();
    };

    const handleCMSChanged = (e: any) => {
      if (e.detail) {
        setHomepageCMS(e.detail);
      } else {
        loadAllSettings();
      }
    };

    window.addEventListener('b4p_store_data_changed', handleDataChanged);
    window.addEventListener('b4p_cms_changed', handleCMSChanged);
    return () => {
      window.removeEventListener('b4p_store_data_changed', handleDataChanged);
      window.removeEventListener('b4p_cms_changed', handleCMSChanged);
    };
  }, []);

  // Update document body style & classes when theme or background/text color changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Toggle html .dark class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Set CSS custom properties
    document.documentElement.style.setProperty('--custom-site-text', effectiveTextColor);
    document.documentElement.style.setProperty('--custom-site-bg', siteBg);

    // If background is dark or text is light, add site-text-light class
    if (isBgDark || (!isDarkMode && customText && calculateLuminance(customText) > 150)) {
      document.body.classList.add('site-text-light');
    } else {
      document.body.classList.remove('site-text-light');
    }

    // If a custom manual text color is set
    if (!isDarkMode && customText && customText !== 'auto') {
      document.body.classList.add('has-custom-text-color');
    } else {
      document.body.classList.remove('has-custom-text-color');
    }

    // Apply background to document.body
    const isImg = !isDarkMode && (siteBg.startsWith('http') || siteBg.startsWith('data:') || siteBg.startsWith('/'));
    if (isImg) {
      document.body.style.backgroundImage = `url(${siteBg})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundColor = '';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = siteBg;
    }
    document.body.style.color = effectiveTextColor;
  }, [homepageCMS.siteBackground, homepageCMS.siteTextColor, isDarkMode, effectiveTextColor, siteBg, isBgDark, customText]);

  const updateStoreSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    await saveStoreSettings(newSettings);
  };

  const updatePaymentSettings = async (newSettings: PaymentSettings) => {
    setPaymentSettings(newSettings);
    await savePaymentSettings(newSettings);
  };

  const updateHomepageCMS = async (newCMS: HomepageCMS) => {
    setHomepageCMS(newCMS);
    await saveHomepageCMS(newCMS);
  };

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        paymentSettings,
        homepageCMS,
        loading,
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        adminDarkMode,
        toggleAdminDarkMode,
        effectiveTextColor,
        updateStoreSettings,
        updatePaymentSettings,
        updateHomepageCMS,
        refreshSettings: loadAllSettings,
        // @ts-ignore alias for compatibility
        updateSettings: updateStoreSettings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};
