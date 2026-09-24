import React from 'react';
import { Truck, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

const parseBadge = (
  rawBadge: string | undefined,
  defaultTitle: string,
  defaultDesc: string,
  titleOverride?: string,
  descOverride?: string
) => {
  if (titleOverride && descOverride) {
    return { title: titleOverride, desc: descOverride };
  }
  if (!rawBadge) return { title: defaultTitle, desc: defaultDesc };
  const parts = rawBadge.split(/—|–|-/);
  if (parts.length >= 2) {
    return { title: parts[0].trim(), desc: parts.slice(1).join('—').trim() };
  }
  return { title: rawBadge.trim(), desc: defaultDesc };
};

export const WhyChooseUs: React.FC = () => {
  const { homepageCMS } = useStoreSettings();

  const b1 = parseBadge(
    homepageCMS.trustBadge1,
    'Botanical Safe-Transit System',
    'Our bespoke shock-absorbing ventilated chambers secure organic roots and lock moisture so plants arrive lush, hydrated, and intact.',
    (homepageCMS as any).trustBadge1Title,
    (homepageCMS as any).trustBadge1Desc
  );

  const b2 = parseBadge(
    homepageCMS.trustBadge2,
    '14-Day Vitality Guarantee',
    'Should your living botanical show transit distress or soil imbalance, our horticulturist team replaces or nurtures it immediately.',
    (homepageCMS as any).trustBadge2Title,
    (homepageCMS as any).trustBadge2Desc
  );

  const b3 = parseBadge(
    homepageCMS.trustBadge3,
    'Microbiome-Enriched Organic Soil',
    'Formulated with organic composted bark, perlite, and cold-pressed bio-actives rather than heavy compacted field clay.',
    (homepageCMS as any).trustBadge3Title,
    (homepageCMS as any).trustBadge3Desc
  );

  const b4 = parseBadge(
    homepageCMS.trustBadge4,
    'Lifetime Botanical Support',
    'Receive personalized watering rhythms, lighting guidance, and seasonal diagnosis direct from certified botanists.',
    (homepageCMS as any).trustBadge4Title,
    (homepageCMS as any).trustBadge4Desc
  );

  const features = [
    {
      icon: <Truck className="w-5 h-5 text-[#1F3B22]" />,
      title: b1.title,
      desc: b1.desc,
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#1F3B22]" />,
      title: b2.title,
      desc: b2.desc,
    },
    {
      icon: <Leaf className="w-5 h-5 text-[#1F3B22]" />,
      title: b3.title,
      desc: b3.desc,
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#1F3B22]" />,
      title: b4.title,
      desc: b4.desc,
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
            {homepageCMS.whyChooseUsTitle || 'Cultivated with Patience & Precision'}
          </h2>
          <p className="text-xs sm:text-sm text-[#616161] mt-3 font-normal leading-relaxed">
            {homepageCMS.whyChooseUsSubtitle || 'Every green specimen is acclimatized in our bio-controlled sanctuary before finding a home in your living space.'}
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
