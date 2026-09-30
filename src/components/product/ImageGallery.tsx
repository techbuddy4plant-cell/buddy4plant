import React, { useState } from 'react';
import { PlantImage, DEFAULT_PLANT_IMAGE } from '../../utils/imageFallback';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

/** Product photos: large rounded image with a thumbnail rail (left on desktop, below on phones). */
export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const displayImages = images && images.length > 0 ? images : [DEFAULT_PLANT_IMAGE];
  const count = displayImages.length;
  const go = (i: number) => setSelectedIndex(((i % count) + count) % count);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
      {/* Thumbnails */}
      {count > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 lg:max-h-[560px] lg:w-[84px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0 [scrollbar-width:thin]">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Show photo ${idx + 1}`}
              className={`h-[68px] w-[68px] lg:h-[80px] lg:w-[80px] shrink-0 overflow-hidden rounded-xl transition-all ${
                selectedIndex === idx
                  ? 'ring-2 ring-[#1E9E57] ring-offset-2 ring-offset-[#FAF7F1]'
                  : 'opacity-75 ring-1 ring-[#E6E0D3] hover:opacity-100'
              }`}
            >
              <PlantImage src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-[24px] bg-[#F1ECE2] shadow-[0_18px_40px_-26px_rgba(19,48,27,0.45)]">
        <PlantImage
          key={selectedIndex}
          src={displayImages[selectedIndex]}
          alt={productName}
          className="h-full w-full object-cover animate-fadeIn"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(selectedIndex - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#13301B] shadow-md opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(selectedIndex + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#13301B] shadow-md opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {selectedIndex + 1} / {count}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
