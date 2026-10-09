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
    <section className="py-20 lg:py-28 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-[11px] font-semibold text-[#486B44] uppercase tracking-[0.18em] block mb-3">Landscaping &amp; Garden Care</span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] tracking-tight">
              {homepageCMS.projectsTitle && homepageCMS.projectsTitle !== 'Curated Botanical Projects' ? homepageCMS.projectsTitle : 'Our Landscaping Projects'}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#5C5C5C] max-w-xl">
              {homepageCMS.projectsSubtitle && !homepageCMS.projectsSubtitle.startsWith('From compact urban balconies') ? homepageCMS.projectsSubtitle : 'Landscaping and garden maintenance for government campuses, institutes, industry and homes across Uttar Pradesh and Delhi.'}
            </p>
          </div>

          <button
            onClick={() => navigate('/projects')}
            className="self-start sm:self-auto px-6 py-2.5 rounded-full border border-[#1F6B3A] text-[#1F6B3A] text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-[#1F6B3A] hover:text-white transition-colors"
          >
            View all projects
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project Cards: photo with a dark green caption */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate('/projects')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/projects')}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-[#173A22] flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E8B4E] focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#22402A]">
                <PlantImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#173A22]">
                  {project.category}
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-6 sm:py-7">
                <h3 className="font-editorial text-lg sm:text-[1.35rem] font-semibold text-white leading-snug">{project.title}</h3>
                <p className="mt-2 text-sm text-white/70 inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#BFE3B0]" />
                  {project.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
