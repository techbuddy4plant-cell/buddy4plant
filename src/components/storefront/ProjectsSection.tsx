import React from 'react';
import { ArrowUpRight, Sparkles, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { PlantImage } from '../../utils/imageFallback';

interface ProjectsSectionProps {
  navigate: (path: string) => void;
}

export const BOTANICAL_PROJECTS = [
  {
    id: 'balcony-sanctuary',
    title: 'The Urban Balcony Sanctuary',
    location: 'Indiranagar, Bengaluru',
    category: 'Residential Balcony',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    description:
      'Transformed a bare 150 sq.ft sunny balcony into a lush subtropical sanctuary featuring custom drainage-friendly planters, monstera deliciosa, and automated organic misting.',
    speciesCount: 28,
    plantHighlights: ['Monstera Deliciosa', 'Fiddle Leaf Fig', 'Golden Pothos', 'Organic Kelp Fed Soil'],
    tag: 'Completed Project',
  },
  {
    id: 'biophilic-atrium',
    title: 'Biophilic Workspace Atrium',
    location: 'Whitefield Tech Park, Bengaluru',
    category: 'Corporate Green Interior',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80',
    description:
      'Engineered an indoor oxygen micro-climate for 400+ employees with 120+ NASA air-purifiers, zero-maintenance self-watering planters, and bi-weekly organic soil nutrition.',
    speciesCount: 120,
    plantHighlights: ['Areca Palms', 'Snake Plants', 'ZZ Raven', 'Peace Lilies'],
    tag: 'Completed Project',
  },
  {
    id: 'terrace-zen-garden',
    title: 'Terrace Zen & Organic Herb Garden',
    location: 'Greater Kailash, New Delhi',
    category: 'Rooftop Terrace',
    image: 'https://images.unsplash.com/photo-1599598425947-320d43702580?auto=format&fit=crop&w=1200&q=80',
    description:
      'A serene rooftop retreat with hand-thrown terracotta pots, cold-pressed neem fed soil beds, and aromatic culinary and medicinal plants resilient to extreme northern heat.',
    speciesCount: 45,
    plantHighlights: ['Lemon Grass', 'Holy Basil (Tulsi)', 'Aloe Arborescens', 'Rosemary'],
    tag: 'Completed Project',
  },
];

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ navigate }) => {
  return (
    <section className="py-20 lg:py-28 bg-[#FBFBFA] border-b border-[#E8E5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1F3B22]" />
              Botanical Architecture &amp; Styling
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] tracking-tight">
              Curated Botanical Projects
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#5C5C5C] max-w-xl">
              From compact urban balconies to full corporate atriums, explore living spaces thoughtfully greenscaped with our nurtured flora.
            </p>
          </div>

          <button
            onClick={() => navigate('/projects')}
            className="pill-btn-light self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            View All Projects
            <ArrowRight className="w-3.5 h-3.5 text-[#1F3B22]" />
          </button>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {BOTANICAL_PROJECTS.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate('/projects')}
              className="group relative cursor-pointer bg-[#FAF9F5] rounded-3xl overflow-hidden border border-[#E5E2D9] hover:border-[#1F3B22]/40 hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE7DF]">
                <PlantImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                <div className="absolute top-4 left-4">
                  <span className="bg-[#1F3B22] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {project.category}
                  </span>
                </div>

                <div className="absolute top-4 right-4">
                  <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#141414] group-hover:bg-[#1F3B22] group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute bottom-3.5 left-4 flex items-center gap-1.5 text-white/90 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#A3B899]" />
                  <span>{project.location}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between grow">
                <div>
                  <h3 className="font-editorial font-bold text-xl text-[#141414] group-hover:text-[#1F3B22] transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#5C5C5C] leading-relaxed line-clamp-2 font-normal">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E8E5DC] flex items-center justify-between text-xs">
                  <span className="text-[#1F3B22] font-bold">
                    {project.speciesCount} Live Flora Specimen
                  </span>
                  <span className="text-[11px] font-semibold text-[#7A7A7A] group-hover:text-[#141414] group-hover:translate-x-0.5 transition-all">
                    View Case Study &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
