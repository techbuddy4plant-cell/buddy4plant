import React, { useState } from 'react';
import { Save, CheckCircle2, DollarSign, Shield, Truck } from 'lucide-react';
import { StoreSettings, PaymentSettings } from '../../types';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const AdminSettings: React.FC = () => {
  const { settings, paymentSettings, updateStoreSettings, updatePaymentSettings } = useStoreSettings();

  const [storeForm, setStoreForm] = useState<StoreSettings>({ ...settings });
  const [payForm, setPayForm] = useState<PaymentSettings>({ ...paymentSettings });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setStoreForm({ ...settings });
  }, [settings]);

  React.useEffect(() => {
    setPayForm({ ...paymentSettings });
  }, [paymentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (updateStoreSettings) await updateStoreSettings(storeForm);
      if (updatePaymentSettings) await updatePaymentSettings(payForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Store Policies & Gateway Configuration</h2>
        <p className="text-xs text-[#5A5A5A] font-light">Configure Indian GST rates, delivery shipping brackets, and Razorpay payments.</p>
      </div>

      {saved && (
        <div className="p-3 bg-[#2D4A27]/10 border border-[#2D4A27]/30 text-[#2D4A27] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D4A27]" />
          <span>Store settings and payment limits updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 border border-[#E5E2D9] space-y-6 text-xs">
        {/* Shipping & GST Parameters */}
        <div>
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#2D4A27]" />
            Shipping & GST Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={storeForm.freeDeliveryThreshold}
                onChange={(e) => setStoreForm({ ...storeForm, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                value={storeForm.standardShippingFee}
                onChange={(e) => setStoreForm({ ...storeForm, standardShippingFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={storeForm.taxRatePercentage}
                onChange={(e) => setStoreForm({ ...storeForm, taxRatePercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="pt-6 border-t border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] mb-3">Store Contact Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Customer Care Email</label>
              <input
                type="email"
                value={storeForm.contactEmail}
                onChange={(e) => setStoreForm({ ...storeForm, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">WhatsApp Plant Doctor Number</label>
              <input
                type="text"
                value={storeForm.contactPhone}
                onChange={(e) => setStoreForm({ ...storeForm, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways & COD Limits */}
        <div className="pt-6 border-t border-[#E5E2D9]">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A] mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#2D4A27]" />
            Payment Gateway & Cash on Delivery Rules
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={payForm.onlinePaymentsEnabled}
                  onChange={(e) => setPayForm({ ...payForm, onlinePaymentsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#2D4A27]"
                />
                <div>
                  <span className="font-bold text-[#1A1A1A] block">Enable Razorpay UPI & Cards</span>
                  <span className="text-[11px] text-[#5A5A5A] font-light">Supports UPI QR, Google Pay, PhonePe, Cards, NetBanking</span>
                </div>
              </label>

              <label className="p-4 bg-[#F5F2EB] border border-[#E5E2D9] flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={payForm.codEnabled}
                  onChange={(e) => setPayForm({ ...payForm, codEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#2D4A27]"
                />
                <div>
                  <span className="font-bold text-[#1A1A1A] block">Enable Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-[#5A5A5A] font-light">Allow customers to pay upon plant arrival</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Min COD Order (₹)</label>
                <input
                  type="number"
                  value={payForm.minCodAmount}
                  onChange={(e) => setPayForm({ ...payForm, minCodAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Max COD Order (₹)</label>
                <input
                  type="number"
                  value={payForm.maxCodAmount}
                  onChange={(e) => setPayForm({ ...payForm, maxCodAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E2D9] text-[#1A1A1A] focus:outline-none focus:border-[#2D4A27]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E2D9] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#2D4A27] hover:bg-[#1F341C] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
