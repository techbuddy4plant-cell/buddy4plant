import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const AnnouncementTicker: React.FC = () => {
  const { settings, homepageCMS } = useStoreSettings();

  if (settings.announcementBarActive === false) return null;

  const activeAnnouncementText =
    homepageCMS.announcementText ||
    settings.announcementBarText ||
    'Welcome to buddy4plant: Free Express Delivery over ₹999 | Free Ceramic Pot above ₹1,499';

  const phone = settings.whatsappSupportNumber || settings.contactPhone || '';
  const defaultAnnouncements = [
    { icon: 'fa-solid fa-leaf text-[#9CCB8F]', text: activeAnnouncementText },
    { icon: 'fa-solid fa-seedling text-[#9CCB8F]', text: 'Nursery-grown plants from Lucknow' },
    { icon: 'fa-solid fa-tree text-[#9CCB8F]', text: 'Landscaping & garden maintenance across Uttar Pradesh and Delhi' },
    { icon: 'fa-solid fa-gift text-[#9CCB8F]', text: 'Use code WELCOME10 for 10% off your first order' },
    ...(phone ? [{ icon: 'fa-brands fa-whatsapp text-[#7FD49A]', text: `Plant help on WhatsApp: ${phone}` }] : []),
  ];

  // Clean out emojis if present in settings.announcementBarText
  const cleanAnnouncements = defaultAnnouncements.map((item) => ({
    ...item,
    text: item.text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|🌿|🌱|🪴|📦|🚚|⚡|🔒|⭐/gu, '').trim(),
  }));

  // Duplicate items for seamless infinite marquee loop
  const marqueeItems = [...cleanAnnouncements, ...cleanAnnouncements, ...cleanAnnouncements, ...cleanAnnouncements];

  return (
    <div className="bg-[#1D3319] text-white text-[10px] sm:text-[11px] font-medium tracking-widest uppercase border-b border-[#2A4724] overflow-hidden py-2 shadow-inner select-none relative z-30">
      <div className="flex animate-marquee items-center gap-12 whitespace-nowrap">
        {marqueeItems.map((ann, idx) => (
          <div key={idx} className="flex items-center gap-2.5 shrink-0 px-2 group cursor-default">
            <i className={`${ann.icon} text-xs`} aria-hidden="true" />
            <span className="text-[#E8F5E9] font-medium tracking-wider">{ann.text}</span>
            <span className="text-[#4E7A4A] ml-6" aria-hidden="true">&middot;</span>
          </div>
        ))}
      </div>
    </div>
  );
};
