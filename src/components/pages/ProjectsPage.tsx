import React from 'react';
import { Sparkles, MapPin, CheckCircle, ArrowRight, MessageCircle, Leaf, ShieldCheck, Sun } from 'lucide-react';
import { PlantImage } from '../../utils/imageFallback';
import { BOTANICAL_PROJECTS } from '../storefront/ProjectsSection';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface ProjectsPageProps {
  navigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ navigate }) => {
  const { settings } = useStoreSettings();

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-12 text-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A7A7A] mb-8">
          <button onClick={() => navigate('/')} className="hover:text-[#141414] transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-[#141414] font-medium">Botanical Projects &amp; Landscaping</span>
        </div>

        {/* Hero Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1F3B22]" />
            Living Space Transformations
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#141414] tracking-tight">
            Curated Botanical Projects
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#525252] leading-relaxed font-normal">
            We partner with home owners, architects, and forward-thinking studios to integrate living botanical flora,
            microclimate-specific soil nutrition, and artisanal pottery into everyday living environments.
          </p>
        </div>

        {/* Projects Deep Showcase */}
        <div className="space-y-16 lg:space-y-24">
          {BOTANICAL_PROJECTS.map((project, idx) => (
            <div
              key={project.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-[#FAF9F5] p-6 sm:p-10 rounded-4xl border border-[#E5E2D9] ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="lg:col-span-6 overflow-hidden rounded-3xl border border-[#E2DFD6] shadow-sm aspect-[4/3]">
                <PlantImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#1F3B22] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {project.category}
                    </span>
                    <span className="text-xs text-[#7A7A7A] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1F3B22]" />
                      {project.location}
                    </span>
                  </div>

                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414] mb-3">
                    {project.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#5C5C5C] leading-relaxed mb-6 font-normal">
                    {project.description}
                  </p>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#141414] block">
                      Flora Specimen &amp; Care Implemented:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.plantHighlights.map((plant, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-3 py-1.5 bg-white border border-[#DDD9CE] rounded-full text-xs text-[#333333] font-medium flex items-center gap-1.5"
                        >
                          <Leaf className="w-3 h-3 text-[#1F3B22]" />
                          {plant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E8E5DC] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-[#1F3B22]">
                    Total {project.speciesCount} Nurtured Live Plants Installed
                  </span>

                  <a
                    href={`https://wa.me/${(settings.whatsappSupportNumber || '919876543210').replace(/[^0-9]/g, '')}?text=Hi%20buddy4plant,%20I%20am%20interested%20in%20a%20similar%20project%20like%20${encodeURIComponent(project.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pill-btn-dark px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Inquire About Similar Space
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consultation Callout */}
        <div className="mt-20 sm:mt-28 bg-[#1F3B22] text-white p-8 sm:p-14 rounded-4xl flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#A3B899] uppercase tracking-[0.25em] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Bespoke Green Consultation
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold">
              Ready to transform your home or office space?
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed font-light">
              Our certified horticulturists evaluate natural sunlight, humidity patterns, and aesthetic preferences
              to assemble plants that thrive long-term.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto">
            <a
              href={`https://wa.me/${(settings.whatsappSupportNumber || '919876543210').replace(/[^0-9]/g, '')}?text=Hi,%20I%20would%20like%20to%20book%20a%20green%20styling%20consultation`}
              target="_blank"
              rel="noreferrer"
              className="pill-btn-light px-7 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-[#141414] shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-[#1F3B22]" />
              WhatsApp Consultation
            </a>
            <button
              onClick={() => navigate('/plants')}
              className="px-7 py-3.5 rounded-full border border-white/40 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider text-center transition-colors"
            >
              Explore Nursery Flora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
