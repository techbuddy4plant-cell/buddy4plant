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

interface StoreSettingsContextType {
  settings: StoreSettings;
  paymentSettings: PaymentSettings;
  homepageCMS: HomepageCMS;
  loading: boolean;
  updateStoreSettings: (newSettings: StoreSettings) => Promise<void>;
  updatePaymentSettings: (newSettings: PaymentSettings) => Promise<void>;
  updateHomepageCMS: (newCMS: HomepageCMS) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(INITIAL_PAYMENT_SETTINGS);
  const [homepageCMS, setHomepageCMS] = useState<HomepageCMS>(INITIAL_HOMEPAGE_CMS);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Update document body style when siteBackground changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const siteBg = homepageCMS.siteBackground || '#FDFCF9';
      const isImg = siteBg.startsWith('http') || siteBg.startsWith('data:') || siteBg.startsWith('/');
      if (isImg) {
        document.body.style.backgroundImage = `url(${siteBg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundColor = '';
      } else {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = siteBg;
      }
    }
  }, [homepageCMS.siteBackground]);

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
