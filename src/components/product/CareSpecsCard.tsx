import React from 'react';
import { Product } from '../../types';

interface CareSpecsCardProps {
  product: Product;
}

type Row = { label: string; icon: string; value?: string; note?: string; caution?: boolean };

/**
 * Specification table in the "comparison table" style: dark green header, cream label column
 * and a raised green Buddy4Plant column with yellow ticks.
 */
const SpecTable: React.FC<{ title: string; columnLabel: string; sections: { heading?: string; rows: Row[] }[] }> = ({
  title,
  columnLabel,
  sections,
}) => {
  const visible = sections
    .map((s) => ({ ...s, rows: s.rows.filter((r) => r.value && String(r.value).trim()) }))
    .filter((s) => s.rows.length);

  return (
    <div>
      <h3 className="mb-8 sm:mb-10 text-center font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-[#13301B]">{title}</h3>

      <div className="rounded-[22px] shadow-[0_18px_40px_-26px_rgba(19,48,27,0.55)]">
        {/* Header */}
        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-end">
          <div className="flex h-16 sm:h-20 items-center rounded-tl-[22px] bg-[#0F3521] px-4 sm:px-8 font-serif text-base sm:text-2xl font-medium text-[#FBF7E7]">
            Specification
          </div>
          <div className="flex h-[76px] sm:h-[100px] flex-col items-center justify-center rounded-t-[22px] bg-[#0E8A4B] px-3 text-center">
            <span className="font-serif text-xl sm:text-3xl font-semibold leading-none text-white">
              buddy<span className="text-[#FFD54A]">4</span>plant
            </span>
            <span className="mt-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{columnLabel}</span>
          </div>
        </div>

        {/* Rows */}
        {visible.map((section, si) => (
          <React.Fragment key={si}>
            {section.heading && (
              <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <div className="bg-[#F1E9DA] px-4 sm:px-8 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#5B6E58]">
                  {section.heading}
                </div>
                <div className="bg-[#0B7A42]" />
              </div>
            )}
            {section.rows.map((r, ri) => {
              const last = si === visible.length - 1 && ri === section.rows.length - 1;
              const long = (r.value || '').length > 60;
              return (
                <div
                  key={r.label}
                  className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
                >
                  <div
                    className={`flex items-center gap-3 border-t border-[#EADFCD] bg-[#FFF8F0] px-4 sm:px-8 py-5 sm:py-6 ${last ? 'rounded-bl-[22px]' : ''}`}
                  >
                    <i className={`${r.icon} hidden sm:inline-block w-5 text-center text-[#2D6A4F]`} aria-hidden="true" />
                    <span className="font-serif text-base sm:text-xl text-[#13301B]">{r.label}</span>
                  </div>
                  <div
                    className={`flex flex-col justify-center gap-1.5 border-t border-white/15 bg-[#0E8A4B] px-4 sm:px-8 py-5 sm:py-6 ${
                      long ? 'items-start text-left' : 'items-center text-center'
                    } ${last ? 'rounded-b-[22px]' : ''}`}
                  >
                    <i
                      className={`fa-solid ${r.caution ? 'fa-triangle-exclamation' : 'fa-check'} text-lg text-[#FFD54A]`}
                      aria-hidden="true"
                    />
                    <span className={`${long ? 'text-sm sm:text-[15px] font-medium leading-relaxed' : 'text-sm sm:text-base font-semibold'} text-white`}>
                      {r.value}
                    </span>
                    {r.note && (
                      <span className="rounded-lg bg-[#FFD54A] px-3 py-1 text-[11px] sm:text-xs font-medium text-[#1A1A1A]">{r.note}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const CareSpecsCard: React.FC<CareSpecsCardProps> = ({ product }) => {
  const isPot = ['pots-planters', 'plastic-pots', 'ceramic-pots', 'hanging-planters', 'planter-stands', 'self-watering', 'terracotta-pots', 'metal-planters'].includes(product.category);
  const isCareItem = ['plant-care', 'fertilizers', 'potting-soil', 'pest-control', 'garden-tools', 'watering-tools', 'garden-decor', 'growth-boosters'].includes(product.category);
  const ci = product.careInstructions;

  if (isCareItem) {
    const packs = product.variants && product.variants.length > 0 ? product.variants.map((v) => v.size).join(', ') : product.weightVolume || product.plantSize || '1 Pack';
    return (
      <SpecTable
        title="Product Details & How to Use"
        columnLabel="Plant care"
        sections={[
          {
            rows: [
              { label: 'Type', icon: 'fa-solid fa-tag', value: product.subCategory || 'Plant Care' },
              { label: 'Pack / Size', icon: 'fa-solid fa-box', value: packs },
              { label: 'Use', icon: 'fa-solid fa-seedling', value: 'Indoor & outdoor plants' },
              { label: 'Pet safe', icon: 'fa-solid fa-paw', value: product.petFriendly ? 'Yes, when used as directed' : 'Keep away from pets', caution: !product.petFriendly },
              { label: 'Colours', icon: 'fa-solid fa-palette', value: product.colorOptions?.join(', ') },
            ],
          },
          {
            heading: 'How to use',
            rows: [
              { label: 'How to use', icon: 'fa-solid fa-hand-holding-droplet', value: ci?.water },
              { label: 'Storage', icon: 'fa-solid fa-warehouse', value: ci?.light },
              { label: 'Tip', icon: 'fa-solid fa-lightbulb', value: ci?.tips },
            ],
          },
        ]}
      />
    );
  }

  if (isPot) {
    const sizes = product.variants && product.variants.length > 0 ? product.variants.map((v) => v.size).join(', ') : product.plantSize || 'One Size';
    return (
      <SpecTable
        title="Product Details"
        columnLabel="Pots & planters"
        sections={[
          {
            rows: [
              { label: 'Material', icon: 'fa-solid fa-cube', value: product.material || 'Plastic' },
              { label: 'Sizes', icon: 'fa-solid fa-ruler-combined', value: sizes },
              { label: 'Colours', icon: 'fa-solid fa-palette', value: product.colorOptions && product.colorOptions.length > 0 ? product.colorOptions.join(', ') : 'As shown' },
              { label: 'Use', icon: 'fa-solid fa-house', value: product.indoorOutdoor === 'Both' ? 'Indoor & Outdoor' : product.indoorOutdoor },
              { label: 'Type', icon: 'fa-solid fa-tag', value: product.subCategory || 'Pots & Planters' },
              { label: 'In the box', icon: 'fa-solid fa-box-open', value: 'Planter only', note: 'Plant not included' },
            ],
          },
          {
            heading: 'Care & use',
            rows: [
              { label: 'Care & use', icon: 'fa-solid fa-hand-sparkles', value: ci?.tips },
              { label: 'Watering', icon: 'fa-solid fa-droplet', value: ci?.water },
            ],
          },
        ]}
      />
    );
  }

  return (
    <SpecTable
      title="Botanical Care & Specifications"
      columnLabel="Your plant"
      sections={[
        {
          rows: [
            { label: 'Light', icon: 'fa-solid fa-sun', value: product.lightRequirement },
            { label: 'Water', icon: 'fa-solid fa-droplet', value: product.wateringFrequency },
            { label: 'Ideal Space', icon: 'fa-solid fa-compass', value: product.location },
            { label: 'Maintenance', icon: 'fa-solid fa-temperature-half', value: product.maintenanceLevel ? `${product.maintenanceLevel} Care` : '' },
            { label: 'Pet Friendly', icon: 'fa-solid fa-paw', value: product.petFriendly ? 'Yes - safe for pets' : 'Keep away from pets', caution: !product.petFriendly },
            { label: 'Maturity Size', icon: 'fa-solid fa-leaf', value: product.plantSize },
          ],
        },
        {
          heading: 'Care guide',
          rows: [
            { label: 'Light & Placement', icon: 'fa-solid fa-sun', value: ci?.light },
            { label: 'Watering Routine', icon: 'fa-solid fa-droplet', value: ci?.water },
            { label: 'Soil & Fertilizer', icon: 'fa-solid fa-seedling', value: ci?.fertilizer },
            { label: 'Pro Tip', icon: 'fa-solid fa-wand-magic-sparkles', value: ci?.tips },
          ],
        },
      ]}
    />
  );
};
