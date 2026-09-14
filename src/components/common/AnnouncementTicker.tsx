import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const AnnouncementTicker: React.FC = () => {
  const { settings, homepageCMS } = useStoreSettings();

  if (settings.announcementBarActive === false) return null;

  const activeAnnouncementText =
    homepageCMS.announcementText ||
    settings.announcementBarText ||
    'Welcome to buddy4plant: Free Express Delivery over ₹999 | Free Ceramic Pot above ₹1,499';

  const defaultAnnouncements = [
    {
      icon: 'fa-solid fa-leaf text-emerald-400 animate-cartoon-wiggle',
      text: activeAnnouncementText,
    },
    {
      icon: 'fa-solid fa-truck-fast text-[#95D5B2]',
      text: '100% Eco-Safe Transit Box Packaging across 25,000+ Indian Pincodes',
    },
    {
      icon: 'fa-solid fa-gift text-emerald-300',
      text: 'Use code WELCOME10 for 10% off your first botanical order',
    },
    {
      icon: 'fa-solid fa-shield-halved text-[#95D5B2]',
      text: '7-Day Healthy Plant Guarantee — Instant Replacement Assistance',
    },
    {
      icon: 'fa-solid fa-seedling text-emerald-400 animate-cartoon-float',
      text: 'Chat 1-on-1 with Certified Horticulturists via WhatsApp Plant Doctor',
    },
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
            <i className={`${ann.icon} text-xs transition-transform group-hover:scale-125`} />
            <span className="text-[#E8F5E9] font-medium tracking-wider">{ann.text}</span>
            <span className="text-[#4E7A4A] ml-6">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
