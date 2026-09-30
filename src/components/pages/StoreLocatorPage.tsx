import React, { useEffect } from 'react';
import { Clock, MapPin, MessageCircle, Navigation, Phone, Truck } from '../common/Icons';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { setSeo } from '../../utils/seo';

/** "Locate Our Store" - address, map, directions, call and WhatsApp. Details come from Admin > Settings. */
export const StoreLocatorPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { settings } = useStoreSettings();
  const address = settings.storeAddress || 'Lucknow, Uttar Pradesh, India';
  const phone = settings.contactPhone || settings.whatsappSupportNumber || '';
  const phoneDigits = phone.replace(/\D/g, '');
  const waDigits = (settings.whatsappSupportNumber || phone).replace(/\D/g, '');
  const mapsQuery = `Buddy4Plant, ${address}`;
  const directions = settings.storeMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`;
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`;

  useEffect(() => {
    setSeo({
      title: 'Locate Our Store - Buddy4Plant Nursery, Lucknow',
      description: `Visit the Buddy4Plant nursery: ${address}. Get directions, call or WhatsApp us for plants, pots and gardening services across Uttar Pradesh and Delhi.`,
      path: '/store-locator',
    });
  }, [address]);

  return (
    <div className="bg-[#FDFCF9] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A] mb-6">
          <button onClick={() => navigate('/')} className="hover:text-[#141414]">Home</button>
          <span>/</span>
          <span className="text-[#1F3B22] font-semibold">Locate Our Store</span>
        </div>

        <div className="max-w-2xl mb-8">
          <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-[0.24em] block mb-2">Visit Us</span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-extrabold text-[#142B1A] leading-tight">Locate Our Store</h1>
          <p className="text-sm text-[#5C5C5C] mt-3">
            Come and see our plants in person, pick up an order, or talk to our team about a garden project.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5 sm:gap-6">
          <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-[#E5E2D9] bg-[#EEF3EA] min-h-[320px] sm:min-h-[420px] shadow-sm">
            <iframe
              title="Buddy4Plant store location map"
              src={embed}
              className="w-full h-full min-h-[320px] sm:min-h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E2D9] p-6 sm:p-7 shadow-sm flex flex-col gap-5">
            <div className="flex gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#EBF5EC] text-[#1F3B22] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">Address</span>
                <p className="text-sm font-semibold text-[#142B1A] leading-relaxed whitespace-pre-line">{address}</p>
              </div>
            </div>

            {settings.storeHours && (
              <div className="flex gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#EBF5EC] text-[#1F3B22] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">Opening hours</span>
                  <p className="text-sm font-semibold text-[#142B1A] whitespace-pre-line">{settings.storeHours}</p>
                </div>
              </div>
            )}

            {phone && (
              <div className="flex gap-3">
                <span className="w-10 h-10 rounded-2xl bg-[#EBF5EC] text-[#1F3B22] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </span>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">Phone &amp; WhatsApp</span>
                  <a href={`tel:+${phoneDigits}`} className="text-sm font-semibold text-[#142B1A] hover:underline">
                    {phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <span className="w-10 h-10 rounded-2xl bg-[#EBF5EC] text-[#1F3B22] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </span>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">Gardening services</span>
                <p className="text-sm text-[#4A4A4A]">Landscaping and maintenance across Uttar Pradesh and Delhi.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2 pt-1 mt-auto">
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-xl bg-[#1F3B22] hover:bg-[#162D19] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Directions
              </a>
              {phoneDigits && (
                <a
                  href={`tel:+${phoneDigits}`}
                  className="px-4 py-3 rounded-xl border border-[#1F3B22] text-[#1F3B22] hover:bg-[#EBF5EC] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
              {waDigits && (
                <a
                  href={`https://wa.me/${waDigits}?text=${encodeURIComponent('Hi Buddy4Plant, I would like to visit your store. Please share the location.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5A] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocatorPage;
