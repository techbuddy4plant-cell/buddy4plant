import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface FooterProps {
  navigate: (path: string) => void;
}

type LinkItem = { label: string; path: string };

const COLUMNS: { title: string; links: LinkItem[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All Plants', path: '/plants' },
      { label: 'Indoor Plants', path: '/plants/indoor-plants' },
      { label: 'Pots & Planters', path: '/plants/pots-planters' },
      { label: 'Plant Care & Soil', path: '/plants/plant-care' },
      { label: 'Gifting', path: '/gifting' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Gardening Services', path: '/garden-services' },
      { label: 'Our Projects', path: '/projects' },
      { label: 'Plant Care Guide', path: '/care-guide' },
      { label: 'Blog', path: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Locate Our Store', path: '/store-locator' },
      { label: 'Track Your Order', path: '/track-order' },
      { label: 'Shipping & Returns', path: '/shipping-policy' },
    ],
  },
];

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useStoreSettings();
  const phone = settings.contactPhone || settings.whatsappSupportNumber || '';
  const phoneDigits = phone.replace(/\D/g, '');
  const wa = (settings.whatsappSupportNumber || phone).replace(/\D/g, '');
  const email = settings.contactEmail || '';
  const address = settings.storeAddress || 'Lucknow, Uttar Pradesh, India';

  // Social icons appear only once real profile links are saved in Admin > Settings
  const PLACEHOLDER = /^https?:\/\/(www\.)?(instagram|facebook|pinterest|youtube)\.com\/buddy4plant\/?$/i;
  const socials = [
    { key: 'instagram', icon: 'fa-instagram', label: 'Instagram' },
    { key: 'facebook', icon: 'fa-facebook-f', label: 'Facebook' },
    { key: 'youtube', icon: 'fa-youtube', label: 'YouTube' },
    { key: 'pinterest', icon: 'fa-pinterest-p', label: 'Pinterest' },
  ]
    .map((x) => ({ ...x, url: ((settings.socialLinks as unknown as Record<string, string>) || {})[x.key] || '' }))
    .filter((x) => x.url && !PLACEHOLDER.test(x.url.trim()));

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0 });
  };

  return (
    <footer className="b4p-fixed-theme relative overflow-hidden bg-[#13301B] text-[#D5E2D0]">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-12 sm:px-8 sm:pt-20 lg:px-10 lg:pt-24 lg:pb-16">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <a href="/" onClick={go('/')} className="inline-flex items-center gap-4">
              <span className="rounded-[22px] bg-[#F4EFE3] p-2.5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]">
                <img src="/logo.png" alt="" className="h-16 sm:h-20 w-auto object-contain" />
              </span>
              <span>
                <span className="block font-serif text-3xl sm:text-4xl font-semibold leading-none text-white">buddy4plant</span>
                <span className="mt-2 block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#9CCB8F]">Botanical Sanctuary</span>
              </span>
            </a>
            <p className="mt-7 max-w-md text-base leading-relaxed text-[#B9CBB3]">
              A Lucknow nursery and landscaping company - plants, pots and organic plant care, plus gardening and
              landscaping services across Uttar Pradesh and Delhi.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {wa && (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#F4EFE3] px-6 py-3.5 text-base font-semibold text-[#13301B] transition-colors hover:bg-white"
                >
                  <i className="fa-brands fa-whatsapp text-xl text-[#1F9D55]" aria-hidden="true" />
                  Chat on WhatsApp
                </a>
              )}
              {socials.map((x) => (
                <a
                  key={x.key}
                  href={x.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={x.label}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-lg text-white transition-colors hover:bg-white hover:text-[#13301B]"
                >
                  <i className={`fa-brands ${x.icon}`} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <nav className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5" aria-label="Footer">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#9CCB8F]">{col.title}</h4>
                <ul className="space-y-3.5">
                  {col.links.map((l) => (
                    <li key={l.path}>
                      <a href={l.path} onClick={go(l.path)} className="text-base text-[#D5E2D0] transition-colors hover:text-white">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#9CCB8F]">Get in touch</h4>
            <ul className="space-y-4 text-base">
              {phone && (
                <li>
                  <a href={`tel:+${phoneDigits}`} className="flex items-start gap-3.5 transition-colors hover:text-white">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9CCB8F]"><i className="fa-solid fa-phone text-sm" aria-hidden="true" /></span>
                    <span className="pt-1.5">{phone}</span>
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="flex items-start gap-3.5 break-all transition-colors hover:text-white">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9CCB8F]"><i className="fa-regular fa-envelope text-sm" aria-hidden="true" /></span>
                    <span className="pt-1.5">{email}</span>
                  </a>
                </li>
              )}
              <li>
                <a href="/store-locator" onClick={go('/store-locator')} className="flex items-start gap-3.5 transition-colors hover:text-white">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9CCB8F]"><i className="fa-solid fa-location-dot text-sm" aria-hidden="true" /></span>
                  <span className="whitespace-pre-line pt-1.5">{address}</span>
                </a>
              </li>
              {settings.storeHours && (
                <li className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9CCB8F]"><i className="fa-regular fa-clock text-sm" aria-hidden="true" /></span>
                  <span className="whitespace-pre-line pt-1.5">{settings.storeHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Large faded wordmark */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden whitespace-nowrap px-4 pb-6 pt-2 text-center font-serif font-semibold leading-[1.1] tracking-tight text-white/[0.08] text-[16vw] lg:text-[11.5rem]">
        buddy4plant
      </div>

      {/* Bottom bar */}
      <div className="relative bg-[#0C2213]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 pb-28 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:pb-7">
          <p className="text-sm text-[#A9BFA3]">
            &copy; {new Date().getFullYear()} Buddy4Plant, Lucknow. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {[
              { label: 'Shipping & Returns', path: '/shipping-policy' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'Locate Our Store', path: '/store-locator' },
              { label: 'Track Order', path: '/track-order' },
            ].map((l) => (
              <li key={l.path}>
                <a href={l.path} onClick={go(l.path)} className="text-[#D5E2D0] transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm text-[#D5E2D0]">
              <i className="fa-solid fa-map-location-dot text-[#9CCB8F]" aria-hidden="true" />
              Serving Uttar Pradesh &amp; Delhi
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4EFE3] text-[#13301B] transition-transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-arrow-up" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
