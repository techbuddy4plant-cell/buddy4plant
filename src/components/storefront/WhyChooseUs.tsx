import React from 'react';
import { Truck, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const WhyChooseUs: React.FC = () => {
  const { homepageCMS } = useStoreSettings();

  const features = [
    {
      icon: <Truck className="w-5 h-5 text-[#1F3B22]" />,
      title: homepageCMS.trustBadge1Title || 'Botanical Safe-Transit System',
      desc: homepageCMS.trustBadge1Desc || 'Our bespoke shock-absorbing ventilated chambers secure organic roots and lock moisture so plants arrive lush, hydrated, and intact.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#1F3B22]" />,
      title: homepageCMS.trustBadge2Title || '14-Day Vitality Guarantee',
      desc: homepageCMS.trustBadge2Desc || 'Should your living botanical show transit distress or soil imbalance, our horticulturist team replaces or nurtures it immediately.',
    },
    {
      icon: <Leaf className="w-5 h-5 text-[#1F3B22]" />,
      title: homepageCMS.trustBadge3Title || 'Microbiome-Enriched Organic Soil',
      desc: homepageCMS.trustBadge3Desc || 'Formulated with organic composted bark, perlite, and cold-pressed bio-actives rather than heavy compacted field clay.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#1F3B22]" />,
      title: homepageCMS.trustBadge4Title || 'Lifetime Botanical Support',
      desc: homepageCMS.trustBadge4Desc || 'Receive personalized watering rhythms, lighting guidance, and seasonal diagnosis direct from certified botanists.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-transparent border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block">
            The Botanical Promise
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] mt-2 tracking-tight">
            Cultivated with Patience &amp; Precision
          </h2>
          <p className="text-xs sm:text-sm text-[#616161] mt-3 font-normal leading-relaxed">
            Every green specimen is acclimatized in our bio-controlled sanctuary before finding a home in your living space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-[#FAF9F5] p-8 rounded-3xl border border-[#E5E2D9] hover:border-[#1F3B22]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EFECE3] border border-[#DDD9CE] flex items-center justify-center mb-6 shadow-xs">
                  {f.icon}
                </div>
                <h3 className="font-editorial font-bold text-[#141414] text-lg mb-2.5">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#616161] leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
