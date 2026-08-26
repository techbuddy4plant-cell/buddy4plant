import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  Droplets,
  Sun,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  HelpCircle,
  Leaf
} from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
            Our Story & Nursery Heritage
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Cultivating Calm in Indian Living Spaces
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-3 leading-relaxed">
            Founded with a vision to reconnect urban homes with pristine botanical nature, buddy4plant nurtures climate-resilient plants suited for Indian living conditions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm space-y-8 text-stone-700 text-xs sm:text-sm leading-relaxed">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-900 mb-3">Greenhouse to Doorstep</h2>
            <p>
              Unlike traditional roadside nurseries where plants sit in low-grade heavy clay soil and face transplant shock, every buddy4plant specimen is grown in our eco-controlled greenhouses across Western Ghats and Bengaluru. We pot our plants in aerated, sterilized cocopeat enriched with organic vermicompost, perlite, and neem cake.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-stone-100">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-serif font-bold text-2xl text-emerald-950 block mb-1">0%</span>
              <span className="font-bold text-stone-900 text-xs block">Single-Use Plastics</span>
              <p className="text-[11px] text-stone-500 mt-1">All packaging is 100% recyclable honeycomb board.</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-serif font-bold text-2xl text-emerald-950 block mb-1">7 Days</span>
              <span className="font-bold text-stone-900 text-xs block">Transit Guarantee</span>
              <p className="text-[11px] text-stone-500 mt-1">Immediate free replacement if damaged in transit.</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="font-serif font-bold text-2xl text-emerald-950 block mb-1">24x7</span>
              <span className="font-bold text-stone-900 text-xs block">Plant Doctor Advice</span>
              <p className="text-[11px] text-stone-500 mt-1">Direct WhatsApp access to botanists.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PlantDoctorPage: React.FC = () => {
  const [selectedIssue, setSelectedIssue] = useState<string | null>('yellow-leaves');

  const issues = [
    {
      id: 'yellow-leaves',
      title: 'Yellowing Leaves',
      icon: 'fa-solid fa-leaf text-amber-600',
      cause: 'Overwatering is the #1 culprit. Soil remains soggy, suffocating root oxygen absorption.',
      solution: 'Allow top 2 inches of soil to dry out before watering again. Ensure your planter has drainage holes at the bottom.',
    },
    {
      id: 'brown-tips',
      title: 'Crispy Brown Leaf Tips',
      icon: 'fa-solid fa-fire text-orange-500',
      cause: 'Low ambient room humidity (common with AC or heaters) or chlorinated hard tap water.',
      solution: 'Mist foliage every 2-3 days, use filtered or rested water, and group plants together to create a micro-humid zone.',
    },
    {
      id: 'drooping',
      title: 'Wilting & Drooping Stems',
      icon: 'fa-solid fa-temperature-arrow-down text-rose-500',
      cause: 'Severe underwatering or sudden temperature shock from direct AC drafts.',
      solution: 'Give a thorough deep bottom-watering bath. Move the plant away from direct airflow vents.',
    },
    {
      id: 'pests',
      title: 'White Fluff or Sticky Leaves (Pests)',
      icon: 'fa-solid fa-bug text-emerald-600',
      cause: 'Mealybugs or spider mites attracted to dusty or stagnant indoor foliage.',
      solution: 'Wipe leaves with diluted organic neem oil spray (included in our botanical care kit) once a week.',
    },
  ];

  const current = issues.find((i) => i.id === selectedIssue);

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
            Self-Help & Diagnostic Guide
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            The Botanical Plant Doctor
          </h1>
          <p className="text-xs text-stone-500 mt-2">
            Diagnose common leaf symptoms in seconds or chat with our horticulturists on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Issue Selector */}
          <div className="md:col-span-5 space-y-2">
            {issues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                  selectedIssue === issue.id
                    ? 'bg-emerald-950 text-white border-emerald-950 shadow-md'
                    : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                  <i className={`${issue.icon} text-base`} />
                </div>
                <span className="text-xs font-bold font-serif">{issue.title}</span>
              </button>
            ))}
          </div>

          {/* Issue Remedy Card */}
          <div className="md:col-span-7">
            {current && (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <i className={`${current.icon} text-xl`} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">{current.title}</h3>
                    <span className="text-[11px] text-stone-400">Botanical Symptom Analysis</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider mb-1 flex items-center gap-1.5 text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Likely Root Cause
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{current.cause}</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60">
                  <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Recommended Action
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">{current.solution}</p>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <a
                    href="https://wa.me/919876543210?text=Hi%20Plant%20Doctor,%20I%20need%20help%20with%20my%20plant"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 hover:underline"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    Send a photo to WhatsApp Plant Doctor (+91 98765 43210) &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactUsPage: React.FC = () => {
  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
            Customer Care & Greenhouse Support
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">Get in Touch</h1>
          <p className="text-xs text-stone-500 mt-2">
            We are here to assist with plant selection, order tracking, corporate gifting, and care questions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900 mb-1">WhatsApp Support</h3>
            <p className="text-xs text-stone-500 mb-3">Fastest response for plant photos</p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-emerald-900 hover:underline"
            >
              +91 98765 43210
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900 mb-1">Email Care</h3>
            <p className="text-xs text-stone-500 mb-3">For order inquiries & corporate gifts</p>
            <a
              href="mailto:support@buddy4plant.com"
              className="text-xs font-bold text-emerald-900 hover:underline"
            >
              support@buddy4plant.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-stone-900 mb-1">Greenhouse Facility</h3>
            <p className="text-xs text-stone-500 mb-3">Western Ghats Botanical Reserve</p>
            <span className="text-xs text-stone-700 font-medium">Bengaluru & Pune Hubs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
