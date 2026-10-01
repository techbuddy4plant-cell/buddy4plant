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
      { label: 'Gifting Plants', path: '/gifting' },
    ],
  },
  {
    title: 'Services & Care',
    links: [
      { label: 'Gardening Services', path: '/garden-services' },
      { label: 'Landscaping Projects', path: '/projects' },
      { label: 'Botanical Blog', path: '/blog' },
      { label: 'Customer Reviews', path: '/reviews' },
    ],
  },
  {
    title: 'Legal & Policies',
    links: [
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Terms & Conditions', path: '/terms-and-conditions' },
      { label: 'Refund & Cancellation', path: '/refund-policy' },
      { label: 'Shipping & Delivery', path: '/shipping-policy' },
      { label: 'About Us', path: '/about' },
    ],
  },
];

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { settings } = useStoreSettings();
  const phone = settings.contactPhone || settings.whatsappSupportNumber || '+91 80048 81668';
  const phoneDigits = phone.replace(/\D/g, '');
  const wa = (settings.whatsappSupportNumber || phone).replace(/\D/g, '') || '918004881668';
  const email = settings.contactEmail || 'buddy4plant@gmail.com';
  const address = settings.storeAddress || 'Buddy4Plant Nursery, Lucknow, Uttar Pradesh, India';

  // Social & contact channels with reliable fallbacks
  const socials = [
    {
      key: 'instagram',
      icon: 'fa-brands fa-instagram',
      label: 'Instagram',
      url: 'https://www.instagram.com/buddy4plant',
    },
    {
      key: 'whatsapp-channel',
      icon: 'fa-brands fa-whatsapp',
      label: 'WhatsApp Channel',
      url: 'https://whatsapp.com/channel/0029VaPulYg7IUYYvXmx4w0L',
    },
    {
      key: 'mail',
      icon: 'fa-regular fa-envelope',
      label: 'Email Us',
      url: `mailto:${email}`,
    },
  ];

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              A Lucknow nursery and landscaping company - healthy living plants, pots, organic nutrition, and turnkey garden landscaping across Uttar Pradesh and Delhi.
            </p>

            {/* Social & Contact Icons in a single line */}
            <div className="mt-8 flex items-center gap-3">
              {socials.map((x) => (
                <a
                  key={x.key}
                  href={x.url}
                  target={x.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={x.label}
                  title={x.label}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-base text-white transition-all hover:bg-white hover:text-[#13301B] hover:scale-105"
                >
                  <i className={x.icon} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <nav className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5" aria-label="Footer Navigation">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#9CCB8F]">{col.title}</h4>
                <ul className="space-y-3.5">
                  {col.links.map((l) => (
                    <li key={l.path}>
                      <a href={l.path} onClick={go(l.path)} className="text-sm sm:text-base text-[#D5E2D0] transition-colors hover:text-white">
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
            <ul className="space-y-4 text-sm sm:text-base">
              {phone && (
                <li>
                  <a href={`tel:+${phoneDigits}`} className="flex items-start gap-3.5 transition-colors hover:text-white">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9CCB8F]">
                      <i className="fa-solid fa-phone text-sm" aria-hidden="true" />
                    </span>
                    <span className="pt-1.5">{phone}</span>
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="flex items-start gap-3.5 break-all transition-colors hover:text-white">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9CCB8F]">
                      <i className="fa-regular fa-envelope text-sm" aria-hidden="true" />
                    </span>
                    <span className="pt-1.5">{email}</span>
                  </a>
                </li>
              )}
              <li>
                <a href="/store-locator" onClick={go('/store-locator')} className="flex items-start gap-3.5 transition-colors hover:text-white">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9CCB8F]">
                    <i className="fa-solid fa-location-dot text-sm" aria-hidden="true" />
                  </span>
                  <span className="whitespace-pre-line pt-1.5">{address}</span>
                </a>
              </li>
              {settings.storeHours && (
                <li className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#9CCB8F]">
                    <i className="fa-regular fa-clock text-sm" aria-hidden="true" />
                  </span>
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
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm">
            {[
              { label: 'Privacy Policy', path: '/privacy-policy' },
              { label: 'Terms & Conditions', path: '/terms-and-conditions' },
              { label: 'Refund Policy', path: '/refund-policy' },
              { label: 'Shipping & Delivery', path: '/shipping-policy' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'Locate Store', path: '/store-locator' },
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
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4EFE3] text-[#13301B] transition-transform hover:-translate-y-0.5 cursor-pointer"
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
