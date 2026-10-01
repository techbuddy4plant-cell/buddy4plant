import React from 'react';

/** Promise strip under the home banner: slow scrolling row on phones, four columns on larger screens. */
const ITEMS = [
  { icon: 'fa-solid fa-seedling', label: 'Nursery-Grown in Lucknow' },
  { icon: 'fa-solid fa-leaf', label: 'Organic Plant Food & Soil' },
  { icon: 'fa-solid fa-box-open', label: 'Carefully Packed Plants' },
  { icon: 'fa-brands fa-whatsapp', label: 'Free Plant Care Help' },
];

const Pill: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <span className="flex shrink-0 items-center gap-2 pr-6">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFF8E1] text-[#13301B]">
      <i className={`${icon} text-[13px]`} aria-hidden="true" />
    </span>
    <span className="whitespace-nowrap text-[12.5px] font-medium text-[#1A1A1A]">{label}</span>
    <span className="ml-4 h-4 w-px bg-[#13301B]/20" aria-hidden="true" />
  </span>
);

export const TrustStrip: React.FC = () => (
  <section className="b4p-fixed-theme px-3 sm:px-5 lg:px-8 pb-0 sm:pb-4" aria-label="Why shop with Buddy4Plant">
    {/* Phones: slim strip that scrolls slowly so every point can be read */}
    <div className="sm:hidden overflow-hidden rounded-xl bg-[#FFD54A] py-2">
      <div className="flex w-max animate-[b4pTicker_26s_linear_infinite] motion-reduce:animate-none">
        {[...ITEMS, ...ITEMS].map((it, i) => (
          <Pill key={i} icon={it.icon} label={it.label} />
        ))}
      </div>
      <ul className="sr-only">
        {ITEMS.map((it) => (
          <li key={it.label}>{it.label}</li>
        ))}
      </ul>
    </div>

    {/* Tablet and desktop: four columns */}
    <div className="hidden sm:block mx-auto max-w-7xl rounded-[22px] bg-[#FFD54A] px-6 py-6">
      <ul className="grid grid-cols-4 gap-y-5">
        {ITEMS.map((it, i) => (
          <li key={it.label} className={`flex flex-col items-center gap-2.5 px-2 text-center ${i > 0 ? 'border-l border-[#13301B]/15' : ''}`}>
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8E1] text-[#13301B] shadow-[0_6px_14px_-8px_rgba(0,0,0,0.35)]">
              <i className={`${it.icon} text-2xl`} aria-hidden="true" />
            </span>
            <span className="text-base font-medium leading-snug text-[#1A1A1A]">{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TrustStrip;
