import React, { useCallback, useEffect, useRef, useState } from 'react';

interface HeroBannerProps {
  navigate: (path: string) => void;
}

type Slide = { src: string; alt: string; link: string };

/** Home page banner slides. Pictures only - the banners carry their own wording. */
const SLIDES: Slide[] = [
  { src: '/editorial/home-slide-1.jpg', alt: 'Buddy4Plant - Green homes, brighter tomorrows', link: '/plants' },
  { src: '/editorial/home-slide-plant-food.jpg', alt: 'Buddy4Plant organic Plant Food - healthy plants, happier homes', link: '/plants/fertilizers' },
  { src: '/editorial/home-slide-gardening-shop.jpg', alt: 'Buddy4Plant - your one-stop gardening shop', link: '/plants' },
];

const INTERVAL = 5000;

/**
 * Home page hero: a rounded, auto-swiping 3-slide banner.
 * Slides automatically every 5 seconds; supports swipe on phones,
 * arrow buttons, dots and the keyboard arrows.
 */
export const HeroBanner: React.FC<HeroBannerProps> = ({ navigate }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = SLIDES.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  // Always slides on its own; it only waits while a finger is on it (phones) or the tab is in the background.
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      if (!document.hidden) next();
    }, INTERVAL);
    return () => window.clearInterval(t);
  }, [paused, next, index]);

  return (
    <section className="b4p-fixed-theme px-1.5 sm:px-5 lg:px-8 pt-1 pb-4 sm:pb-8" aria-roledescription="carousel" aria-label="Featured">
      <div
        className="group relative mx-auto max-w-7xl overflow-hidden rounded-2xl sm:rounded-[28px] bg-[#EFE8DA] shadow-[0_18px_40px_-24px_rgba(19,48,27,0.45)]"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') next();
          if (e.key === 'ArrowLeft') prev();
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          setPaused(false);
          if (start === null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        }}
      >
        {/* Track */}
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translate3d(-${index * 100}%,0,0)` }}
        >
          {SLIDES.map((s, i) => (
            <a
              key={s.src}
              href={s.link}
              onClick={(e) => {
                e.preventDefault();
                navigate(s.link);
              }}
              className="relative block w-full shrink-0 aspect-[1672/940] max-h-[640px]"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${s.alt}`}
              aria-hidden={i !== index}
              tabIndex={i === index ? 0 : -1}
            >
              <img
                src={s.src}
                srcSet={`${s.src.replace(/\.jpg$/, '-800.webp')} 800w, ${s.src.replace(/\.jpg$/, '.webp')} 1600w`}
                sizes="(max-width: 1280px) 100vw, 1280px"
                width={1600}
                height={900}
                alt={s.alt}
                draggable={false}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover select-none"
              />
            </a>
          ))}
        </div>

        {/* Arrows (desktop) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#FDFCF9]/90 text-[#13301B] shadow-md opacity-0 transition-opacity duration-300 hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 sm:flex"
        >
          <i className="fa-solid fa-chevron-left text-sm" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#FDFCF9]/90 text-[#13301B] shadow-md opacity-0 transition-opacity duration-300 hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 sm:flex"
        >
          <i className="fa-solid fa-chevron-right text-sm" aria-hidden="true" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/15 px-2.5 py-1.5 backdrop-blur-sm">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/85'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
