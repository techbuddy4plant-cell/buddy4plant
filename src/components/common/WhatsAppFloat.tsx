import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

/** Floating WhatsApp chat button (bottom right) that opens a chat with the store's WhatsApp number. */
export const WhatsAppFloat: React.FC = () => {
  const { settings } = useStoreSettings();
  const digits = (settings.whatsappSupportNumber || settings.contactPhone || '').replace(/\D/g, '');
  if (!digits) return null;
  const text = encodeURIComponent('Hi Buddy4Plant, I have a question.');
  return (
    <a
      href={`https://wa.me/${digits}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="b4p-wa-float group fixed right-4 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_-8px_rgba(37,211,102,0.7)] transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping [animation-duration:2.4s]" aria-hidden="true" />
      <i className="fa-brands fa-whatsapp relative text-[30px] leading-none" aria-hidden="true" />
    </a>
  );
};

export default WhatsAppFloat;
