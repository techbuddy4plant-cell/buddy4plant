import { useStoreSettings } from '../../context/StoreSettingsContext';
import React from 'react';
import { ArrowUpRight, Sparkles, MapPin, CheckCircle, ArrowRight } from '../common/Icons';
import { PlantImage } from '../../utils/imageFallback';
import { LANDSCAPE_PROJECTS } from '../../data/landscapeProjects';

interface ProjectsSectionProps {
  navigate: (path: string) => void;
}


import { getProjects } from '../../services/projectService';

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ navigate }) => {
  const { homepageCMS } = useStoreSettings();
  const [projects, setProjects] = React.useState<any[]>(LANDSCAPE_PROJECTS);

  React.useEffect(() => {
    getProjects().then((data) => {
      if (data && data.length > 0) {
        setProjects(data.filter((p) => p.active !== false));
      }
    });

    const handleDataChanged = () => {
      getProjects().then((data) => {
        if (data && data.length > 0) {
          setProjects(data.filter((p) => p.active !== false));
        }
      });
    };

    window.addEventListener('b4p_store_data_changed', handleDataChanged);
    return () => {
      window.removeEventListener('b4p_store_data_changed', handleDataChanged);
    };
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-transparent border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-[10px] font-bold text-[#5B6E58] uppercase tracking-[0.24em] block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1F3B22]" />
              Botanical Architecture &amp; Styling
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] tracking-tight">
              {homepageCMS.projectsTitle && homepageCMS.projectsTitle !== 'Curated Botanical Projects' ? homepageCMS.projectsTitle : 'Our Landscaping Projects'}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#5C5C5C] max-w-xl">
              {homepageCMS.projectsSubtitle && !homepageCMS.projectsSubtitle.startsWith('From compact urban balconies') ? homepageCMS.projectsSubtitle : 'Landscaping and garden maintenance for government campuses, institutes, industry and homes across Uttar Pradesh and Delhi.'}
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
          {projects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              onClick={() => navigate('/projects')}
              className="group relative cursor-pointer bg-white rounded-[22px] overflow-hidden ring-1 ring-[#ECE6DA] shadow-[0_10px_30px_-18px_rgba(19,48,27,0.35)] hover:shadow-[0_22px_40px_-20px_rgba(19,48,27,0.45)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
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
                    {project.speciesCount > 0 ? `${project.speciesCount} plant species` : project.location}
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
