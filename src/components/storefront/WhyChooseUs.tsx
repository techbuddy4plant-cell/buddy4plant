import React from 'react';
import { Truck, ShieldCheck, HeartHandshake, Leaf, PhoneCall } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <Truck className="w-5 h-5 text-[#2D4A27]" />,
      title: 'Botanical Safe-Transit Box',
      desc: 'Our proprietary honeycomb corrugated boxes lock pot soil in place and allow air circulation so leaves arrive fresh and undamaged.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#2D4A27]" />,
      title: '7-Day Replacement Guarantee',
      desc: 'If your plant arrives stressed, damaged, or unhealthy, simply send a photo on WhatsApp for an immediate free replacement.',
    },
    {
      icon: <Leaf className="w-5 h-5 text-[#2D4A27]" />,
      title: 'Potted in Nutrient-Rich Mix',
      desc: 'No sub-standard nursery red soil. Every plant is potted in enriched cocopeat, vermicompost, perlite, and organic neem meal.',
    },
    {
      icon: <PhoneCall className="w-5 h-5 text-[#2D4A27]" />,
      title: 'Free Plant Doctor Advice',
      desc: 'Got a yellow leaf or pest question? Connect with our dedicated horticulturists anytime via WhatsApp for step-by-step guidance.',
    },
  ];

  return (
    <section className="py-16 bg-[#F5F2EB]/50 border-b border-[#E5E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] font-bold text-[#2D4A27] uppercase tracking-[0.25em] block">
            The Vana Botanica Standard
          </span>
          <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
            Why Indian Plant Lovers Trust Us
          </h2>
          <p className="text-xs text-[#5A5A5A] mt-2 font-light">
            Every green specimen is acclimatized in our eco-controlled greenhouse before reaching your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 border border-[#E5E2D9] hover:border-[#2D4A27]/40 transition-colors"
            >
              <div className="w-11 h-11 bg-[#F5F2EB] border border-[#E5E2D9] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-serif font-bold text-[#1A1A1A] text-base mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-[#5A5A5A] leading-relaxed font-light">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
