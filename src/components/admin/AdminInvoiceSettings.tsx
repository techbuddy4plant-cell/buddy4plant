import React, { useEffect, useMemo, useState } from 'react';
import { Category, Order } from '../../types';
import {
  DEFAULT_INVOICE_SETTINGS,
  InvoiceSettings,
  financialYear,
  formatInvoiceNumber,
  getInvoiceSettings,
  saveInvoiceSettings,
} from '../../services/invoiceSettingsService';
import { buildInvoiceHtml } from '../../utils/invoice';

const GST_RATES = [0, 5, 12, 18, 28];
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const sampleOrder = (inv: InvoiceSettings, categories: Category[]): Order => {
  const now = Date.now();
  const cat = categories[0]?.id;
  return {
    id: 'sample',
    orderNumber: 'B4P-582913',
    invoiceNumber: formatInvoiceNumber(inv.prefix, financialYear(now), Math.max(1, inv.startNumber || 1)),
    invoiceDate: now,
    customerId: 'guest',
    customerName: 'Ananya Sharma',
    customerEmail: 'ananya@example.com',
    customerPhone: '+91 98765 43210',
    items: [
      { productId: 'p1', name: 'Snake Plant (Sansevieria)', slug: 'snake-plant', image: '', price: 349, quantity: 2, sku: 'B4P-SNK-M', category: cat },
      { productId: 'p2', name: 'Ceramic Pot - Ivory', slug: 'ceramic-pot', image: '', price: 499, quantity: 1, sku: 'B4P-POT-IV', category: categories[1]?.id },
    ],
    subtotal: 1197,
    discount: 100,
    couponCode: 'GREEN100',
    shippingCharge: 49,
    tax: 0,
    total: 1146,
    shippingAddress: {
      fullName: 'Ananya Sharma',
      phone: '9876543210',
      email: 'ananya@example.com',
      street: '12, Garden Enclave, Gomti Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
    } as Order['shippingAddress'],
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'Confirmed',
    notes: 'Please call before delivery',
    estimatedDeliveryDate: '3-5 days',
    createdAt: now,
    updatedAt: now,
  };
};

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#5A5A5A] mb-1">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-[#8A8A8A] mt-1">{hint}</span>}
  </label>
);
const inputCls = 'w-full px-3 py-2 border border-[#E5E2D9] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2D4A27]/30';

/** Admin > Invoice: everything printed on invoices, with a live preview. */
export const AdminInvoiceSettings: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const [form, setForm] = useState<InvoiceSettings>(DEFAULT_INVOICE_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getInvoiceSettings().then((s) => {
      setForm(s);
      setLoaded(true);
    });
  }, []);

  const set = <K extends keyof InvoiceSettings>(k: K, v: InvoiceSettings[K]) => setForm((f) => ({ ...f, [k]: v }));
  const gstinOk = !form.gstin || GSTIN_RE.test(form.gstin.trim().toUpperCase());
  const preview = useMemo(() => {
    try {
      return buildInvoiceHtml(sampleOrder(form, categories), {}, form).replace('</head>', '<style>@media screen{body{zoom:.62;padding:4mm 0}}</style></head>');
    } catch {
      return '<p>Preview not available</p>';
    }
  }, [form, categories]);

  const save = async () => {
    if (!gstinOk) {
      setMsg({ ok: false, text: 'The GSTIN looks wrong - it should be 15 characters like 09ABCDE1234F1Z5.' });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await saveInvoiceSettings({ ...form, gstin: form.gstin.trim().toUpperCase(), pan: form.pan.trim().toUpperCase() });
      setMsg({ ok: true, text: 'Saved. All invoices printed from now on use these settings.' });
    } catch {
      setMsg({ ok: false, text: 'Could not save. Please check you are signed in as an admin and try again.' });
    } finally {
      setSaving(false);
    }
  };

  const fy = financialYear(Date.now());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A]">Invoice settings</h2>
          <p className="text-xs text-[#5A5A5A]">What customers see on their invoice. The preview updates as you type.</p>
        </div>
        <button
          onClick={save}
          disabled={saving || !loaded}
          className="px-5 py-2.5 bg-[#2D4A27] hover:bg-[#1F3B22] text-white text-xs font-bold uppercase tracking-wider rounded-lg disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save invoice settings'}
        </button>
      </div>
      {msg && (
        <div className={`p-3 rounded-lg text-xs border ${msg.ok ? 'bg-[#2D4A27]/10 border-[#2D4A27]/30 text-[#2D4A27]' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>{msg.text}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
        {/* ---------------- form ---------------- */}
        <div className="space-y-5">
          <section className="bg-white p-5 border border-[#E5E2D9] rounded-xl space-y-4">
            <h3 className="font-serif font-bold text-base">Business details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Business name"><input className={inputCls} value={form.businessName} onChange={(e) => set('businessName', e.target.value)} /></Field>
              <Field label="Tagline"><input className={inputCls} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
              <Field label="Address"><textarea rows={2} className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
              <Field label="Logo (image link)" hint="Leave as /logo.png for your current logo, or paste an https:// image link.">
                <input className={inputCls} value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} />
              </Field>
              <Field label="Phone"><input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
              <Field label="Email"><input className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
              <Field label="Website"><input className={inputCls} value={form.website} onChange={(e) => set('website', e.target.value)} /></Field>
            </div>
          </section>

          <section className="bg-white p-5 border border-[#E5E2D9] rounded-xl space-y-4">
            <h3 className="font-serif font-bold text-base">Tax details (GST)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="GSTIN" hint={gstinOk ? 'With a GSTIN the title becomes "TAX INVOICE".' : '⚠ This GSTIN does not look right.'}>
                <input className={`${inputCls} uppercase ${gstinOk ? '' : 'border-rose-400'}`} maxLength={15} value={form.gstin} onChange={(e) => set('gstin', e.target.value.toUpperCase())} />
              </Field>
              <Field label="PAN"><input className={`${inputCls} uppercase`} maxLength={10} value={form.pan} onChange={(e) => set('pan', e.target.value.toUpperCase())} /></Field>
              <Field label="State"><input className={inputCls} value={form.stateName} onChange={(e) => set('stateName', e.target.value)} /></Field>
              <Field label="State code"><input className={inputCls} maxLength={2} value={form.stateCode} onChange={(e) => set('stateCode', e.target.value.replace(/\D/g, ''))} /></Field>
            </div>
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" className="mt-0.5" checked={form.showGstBreakdown} onChange={(e) => set('showGstBreakdown', e.target.checked)} />
              <span>
                <b>Show GST breakdown</b> (HSN, taxable value, CGST + SGST for {form.stateName || 'your state'}, IGST for other states).
                <span className="block text-[#8A8A8A]">Your website prices are treated as GST-inclusive, so totals don't change. Switch on after confirming the rates with your CA.</span>
              </span>
            </label>
            {form.showGstBreakdown && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Default HSN"><input className={inputCls} value={form.defaultHsn} onChange={(e) => set('defaultHsn', e.target.value.replace(/[^\d]/g, '').slice(0, 8))} /></Field>
                  <Field label="Default GST %">
                    <select className={inputCls} value={form.defaultGstRate} onChange={(e) => set('defaultGstRate', Number(e.target.value))}>
                      {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </Field>
                  <Field label="GST % on shipping">
                    <select className={inputCls} value={form.shippingGstRate} onChange={(e) => set('shippingGstRate', Number(e.target.value))}>
                      {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </Field>
                </div>
                <div className="border border-[#EEE9DE] rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr_110px_100px] gap-2 bg-[#F6F3EC] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#5A5A5A]">
                    <span>Category</span><span>HSN</span><span>GST %</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#F0EBDF]">
                    {categories.map((c) => {
                      const t = form.categoryTax[c.id] || { hsn: '', rate: -1 };
                      const upd = (patch: Partial<{ hsn: string; rate: number }>) => {
                        const next = { ...t, ...patch };
                        const all = { ...form.categoryTax };
                        if (!next.hsn && next.rate < 0) delete all[c.id];
                        else all[c.id] = { hsn: next.hsn, rate: next.rate < 0 ? form.defaultGstRate : next.rate };
                        set('categoryTax', all);
                      };
                      return (
                        <div key={c.id} className="grid grid-cols-[1fr_110px_100px] gap-2 items-center px-3 py-1.5 text-xs">
                          <span className="truncate">{c.name}</span>
                          <input className={`${inputCls} py-1`} placeholder={form.defaultHsn || 'HSN'} value={t.hsn} onChange={(e) => upd({ hsn: e.target.value.replace(/[^\d]/g, '').slice(0, 8) })} />
                          <select className={`${inputCls} py-1`} value={form.categoryTax[c.id] ? t.rate : -1} onChange={(e) => upd({ rate: Number(e.target.value) })}>
                            <option value={-1}>Default</option>
                            {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white p-5 border border-[#E5E2D9] rounded-xl space-y-4">
            <h3 className="font-serif font-bold text-base">Invoice numbers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Prefix" hint={`Next invoices look like ${formatInvoiceNumber(form.prefix, fy, 12)}`}>
                <input className={`${inputCls} uppercase`} maxLength={6} value={form.prefix} onChange={(e) => set('prefix', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
              </Field>
              <Field label="Start a new financial year at" hint="Used only when a new year (April) starts. Numbers then run in order with no gaps.">
                <input type="number" min={1} className={inputCls} value={form.startNumber} onChange={(e) => set('startNumber', Math.max(1, Math.floor(Number(e.target.value) || 1)))} />
              </Field>
            </div>
          </section>

          <section className="bg-white p-5 border border-[#E5E2D9] rounded-xl space-y-4">
            <h3 className="font-serif font-bold text-base">Text, signature & look</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title">
                <select className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)}>
                  <option value="auto">Automatic (Tax Invoice with GSTIN)</option>
                  <option value="TAX INVOICE">TAX INVOICE</option>
                  <option value="INVOICE">INVOICE</option>
                  <option value="BILL OF SUPPLY">BILL OF SUPPLY</option>
                </select>
              </Field>
              <Field label="Main colour">
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.accentColor} onChange={(e) => set('accentColor', e.target.value)} className="h-9 w-12 border border-[#E5E2D9] rounded" />
                  <input className={inputCls} value={form.accentColor} onChange={(e) => set('accentColor', e.target.value)} />
                </div>
              </Field>
              <Field label="Thank-you line"><input className={inputCls} value={form.thanksText} onChange={(e) => set('thanksText', e.target.value)} /></Field>
              <Field label="Footer note"><input className={inputCls} value={form.footerNote} onChange={(e) => set('footerNote', e.target.value)} /></Field>
              <Field label="Terms / return policy (optional)"><textarea rows={3} className={inputCls} value={form.terms} onChange={(e) => set('terms', e.target.value)} /></Field>
              <div className="space-y-4">
                <Field label="Signature / stamp image (optional)" hint="Paste an https:// image link of your signature or stamp.">
                  <input className={inputCls} value={form.signatureUrl} onChange={(e) => set('signatureUrl', e.target.value)} />
                </Field>
                <Field label="Signatory label"><input className={inputCls} value={form.signatoryLabel} onChange={(e) => set('signatoryLabel', e.target.value)} /></Field>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(
                [
                  ['showSku', 'SKU'],
                  ['showPaymentId', 'Payment ID'],
                  ['showNotes', 'Order notes'],
                  ['showEta', 'Estimated delivery'],
                  ['showWatermark', 'Logo watermark'],
                ] as [keyof InvoiceSettings, string][]
              ).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!form[k]} onChange={(e) => set(k, e.target.checked as never)} />
                  Show {label}
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* ---------------- preview ---------------- */}
        <div className="xl:sticky xl:top-4">
          <div className="bg-white border border-[#E5E2D9] rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-[#EEE9DE] text-[11px] font-semibold uppercase tracking-wider text-[#5A5A5A]">Live preview (sample order)</div>
            <div className="h-[78vh] bg-[#e9e6dd]">
              <iframe title="Invoice preview" srcDoc={preview} sandbox="" className="w-full h-full border-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
