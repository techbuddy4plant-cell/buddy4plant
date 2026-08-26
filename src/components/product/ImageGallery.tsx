import React, { useState } from 'react';
import { PlantImage, DEFAULT_PLANT_IMAGE } from '../../utils/imageFallback';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images && images.length > 0 ? images : [DEFAULT_PLANT_IMAGE];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F2EB] border border-[#E5E2D9]">
        <PlantImage
          src={displayImages[selectedIndex]}
          alt={productName}
          className="w-full h-full object-cover transition-all duration-300"
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-20 h-20 overflow-hidden border shrink-0 transition-all ${
                selectedIndex === idx
                  ? 'border-[#2D4A27] shadow-xs'
                  : 'border-[#E5E2D9] opacity-70 hover:opacity-100'
              }`}
            >
              <PlantImage src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
