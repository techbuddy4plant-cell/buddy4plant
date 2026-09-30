import React from 'react';

/** Short promise strip under the home banner (rounded yellow band, white icon circles). */
const ITEMS = [
  { icon: 'fa-solid fa-seedling', label: 'Nursery-Grown in Lucknow' },
  { icon: 'fa-solid fa-leaf', label: 'Organic Plant Food & Soil' },
  { icon: 'fa-solid fa-box-open', label: 'Carefully Packed Plants' },
  { icon: 'fa-brands fa-whatsapp', label: 'Free Plant Care Help' },
];

export const TrustStrip: React.FC = () => (
  <section className="b4p-fixed-theme px-3 sm:px-5 lg:px-8 pb-2 sm:pb-4" aria-label="Why shop with Buddy4Plant">
    <div className="mx-auto max-w-7xl rounded-2xl sm:rounded-[22px] bg-[#FFD54A] px-3 py-5 sm:px-6 sm:py-6">
      <ul className="grid grid-cols-2 gap-y-5 lg:grid-cols-4">
        {ITEMS.map((it, i) => (
          <li
            key={it.label}
            className={`flex flex-col items-center gap-2.5 px-2 text-center ${i > 0 ? 'lg:border-l lg:border-[#13301B]/15' : ''} ${i % 2 === 1 ? 'border-l border-[#13301B]/15 lg:border-l' : ''}`}
          >
            <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#FFF8E1] text-[#13301B] shadow-[0_6px_14px_-8px_rgba(0,0,0,0.35)]">
              <i className={`${it.icon} text-xl sm:text-2xl`} aria-hidden="true" />
            </span>
            <span className="text-[13px] sm:text-base font-medium leading-snug text-[#1A1A1A]">{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TrustStrip;
