import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { useStoreSettings } from './StoreSettingsContext';
import { validateCoupon } from '../services/couponService';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  appliedCoupon: Coupon | null;
  couponMessage: string | null;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedPotColor?: string,
    selectedSize?: string,
    selectedWeight?: string,
    unitPrice?: number
  ) => void;
  removeFromCart: (productId: string, selectedSize?: string, selectedWeight?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string, selectedWeight?: string) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'vb_cart_items';
const COUPON_STORAGE_KEY = 'vb_applied_coupon';

const getItemKey = (item: { product: { id: string }; selectedPotColor?: string; selectedSize?: string; selectedWeight?: string }) => {
  return `${item.product.id}_${item.selectedPotColor || ''}_${item.selectedSize || ''}_${item.selectedWeight || ''}`;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStoreSettings();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      // ignore
    }
  }, [appliedCoupon]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    selectedPotColor?: string,
    selectedSize?: string,
    selectedWeight?: string,
    unitPrice?: number
  ) => {
    const effectivePrice = unitPrice ?? product.price;
    setItems((prev) => {
      const targetKey = `${product.id}_${selectedPotColor || ''}_${selectedSize || ''}_${selectedWeight || ''}`;
      const existingIndex = prev.findIndex((item) => getItemKey(item) === targetKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          selectedPotColor: selectedPotColor || updated[existingIndex].selectedPotColor,
          selectedSize: selectedSize || updated[existingIndex].selectedSize,
          selectedWeight: selectedWeight || updated[existingIndex].selectedWeight,
          unitPrice: effectivePrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: Math.min(product.stock, quantity),
            selectedPotColor,
            selectedSize,
            selectedWeight,
            unitPrice: effectivePrice,
          },
        ];
      }
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize?: string, selectedWeight?: string) => {
    setItems((prev) =>
      prev.filter((item) => {
        if (item.product.id !== productId) return true;
        if (selectedSize !== undefined && item.selectedSize !== selectedSize) return true;
        if (selectedWeight !== undefined && item.selectedWeight !== selectedWeight) return true;
        return false;
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string, selectedWeight?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedWeight);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        const matchesId = item.product.id === productId;
        const matchesSize = selectedSize === undefined || item.selectedSize === selectedSize;
        const matchesWeight = selectedWeight === undefined || item.selectedWeight === selectedWeight;
        if (matchesId && matchesSize && matchesWeight) {
          const validQty = Math.min(item.product.stock, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponMessage(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  };

  // Calculations
  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + (curr.unitPrice ?? curr.product.price) * curr.quantity, 0);

  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  const freeDeliveryThreshold = settings.freeDeliveryThreshold || 999;
  const standardDelivery = settings.deliveryCharge !== undefined ? settings.deliveryCharge : 99;
  const shippingCharge = subtotal >= freeDeliveryThreshold || items.length === 0 ? 0 : standardDelivery;

  const taxableAmount = Math.max(0, subtotal - discount);
  const taxRate = settings.taxRatePercentage || 0;
  const tax = Math.round((taxableAmount * taxRate) / 100);
  const total = Math.max(0, taxableAmount + shippingCharge + tax);

  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a coupon code' };
    }
    const result = await validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponMessage(result.message);
      return { success: true, message: result.message };
    } else {
      setCouponMessage(result.message);
      return { success: false, message: result.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        shippingCharge,
        tax,
        total,
        appliedCoupon,
        couponMessage,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
