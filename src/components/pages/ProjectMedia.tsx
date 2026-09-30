import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, PlayCircle, X } from '../common/Icons';
import type { BotanicalProject } from '../../types';

/** All photos of a project: cover first, then the gallery (no duplicates). */
export const projectPhotos = (p: BotanicalProject): string[] => {
  const list = [p.image, ...(p.gallery || [])].filter((s) => !!s && !s.endsWith('.svg'));
  return Array.from(new Set(list));
};

/** Full-screen photo viewer with arrows, swipe-free keyboard support and a counter. */
export const PhotoLightbox: React.FC<{ photos: string[]; start: number; title: string; onClose: () => void }> = ({
  photos,
  start,
  title,
  onClose,
}) => {
  const [i, setI] = useState(start);
  const go = (d: number) => setI((v) => (v + d + photos.length) % photos.length);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);
  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <img
        src={photos[i]}
        alt={`${title} - photo ${i + 1}`}
        className="max-w-[94vw] max-h-[84vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-[#142B1A] flex items-center justify-center">
        <X className="w-5 h-5" />
      </button>
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-[#142B1A] flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(1); }}
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-[#142B1A] flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      <div className="absolute bottom-5 left-0 right-0 text-center text-white/85 text-xs font-semibold">
        {title} · {i + 1} / {photos.length}
      </div>
    </div>
  );
};

/** Before & after, photo grid and videos for a project (used inside the project details window). */
export const ProjectMediaSection: React.FC<{ project: BotanicalProject }> = ({ project }) => {
  const photos = projectPhotos(project);
  const videos = project.videos || [];
  const ba = project.beforeAfter;
  const [open, setOpen] = useState<number | null>(null);
  if (photos.length <= 1 && !videos.length && !ba) return null;

  return (
    <div className="space-y-6">
      {ba && (
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#142B1A] block mb-2">Before &amp; After</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { src: ba.before, label: 'Before' },
              { src: ba.after, label: 'After' },
            ].map((x) => (
              <div key={x.label} className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#EEE]">
                <img src={x.src} alt={`${project.title} - ${x.label.toLowerCase()}`} loading="lazy" className="w-full h-full object-cover" />
                <span
                  className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    x.label === 'Before' ? 'bg-white/90 text-[#6B4A2B]' : 'bg-[#1F3B22] text-white'
                  }`}
                >
                  {x.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length > 1 && (
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#142B1A] block mb-2">
            Site Photos ({photos.length})
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setOpen(i)}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#EEE] group focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                aria-label={`Open photo ${i + 1}`}
              >
                <img src={src} alt={`${project.title} - photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </button>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#142B1A] block mb-2">
            Site Videos ({videos.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {videos.map((v) => (
              <video
                key={v.src}
                src={v.src}
                poster={v.poster}
                controls
                playsInline
                preload="none"
                className="w-full aspect-[9/16] object-cover rounded-xl bg-black"
              />
            ))}
          </div>
        </div>
      )}

      {open !== null && <PhotoLightbox photos={photos} start={open} title={project.title} onClose={() => setOpen(null)} />}
    </div>
  );
};

/** Small badge for project cards: "12 photos · 6 videos". */
export const ProjectMediaBadge: React.FC<{ project: BotanicalProject; className?: string }> = ({ project, className = '' }) => {
  const n = projectPhotos(project).length;
  const v = (project.videos || []).length;
  if (n <= 1 && !v) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 text-white text-[10px] font-bold backdrop-blur-sm ${className}`}>
      <Images className="w-3 h-3" /> {n}
      {v > 0 && (
        <>
          <span className="opacity-60">·</span>
          <PlayCircle className="w-3 h-3" /> {v}
        </>
      )}
    </span>
  );
};
