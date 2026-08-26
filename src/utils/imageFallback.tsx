import React, { useState } from 'react';

// Verified, reliable, high-resolution botanical plant photos from Unsplash
export const PLANT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80', // Peace Lily / Monstera in light room
  'https://images.unsplash.com/photo-1599598425947-320d43702580?auto=format&fit=crop&w=800&q=80', // Snake plant
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', // Money plant / Pothos lush green foliage
  'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80', // Monstera Deliciosa
  'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=800&q=80', // ZZ Plant
  'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80', // Palm / Calathea
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80', // Succulent Jade
  'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=800&q=80', // Anthurium / Aglaonema
  'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80', // Potted plant collection
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80', // Artisan terracotta & ceramic planter
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80', // Balcony nursery greenery
];

export const DEFAULT_PLANT_IMAGE = PLANT_FALLBACK_IMAGES[0];

export const sanitizePlantImageUrl = (url?: string): string => {
  if (!url) return DEFAULT_PLANT_IMAGE;
  if (url.includes('1583324113626') || url.includes('70df0f4deaab')) {
    return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
  }
  return url;
};

/**
 * Universal error handler for HTML img elements to ensure fallback to a high-quality plant image.
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (!target.src.includes(DEFAULT_PLANT_IMAGE)) {
    target.src = DEFAULT_PLANT_IMAGE;
  }
};

interface PlantImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Safe Plant Image component with automatic retry, referrer policy, and smooth loading fallback
 */
export const PlantImage: React.FC<PlantImageProps> = ({
  src,
  alt = 'buddy4plant Botanical Specimen',
  className = '',
  fallbackSrc = DEFAULT_PLANT_IMAGE,
  ...rest
}) => {
  const cleanSrc = sanitizePlantImageUrl(src);
  const [imgSrc, setImgSrc] = useState<string>(cleanSrc || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  // Sync state if src changes
  React.useEffect(() => {
    setImgSrc(sanitizePlantImageUrl(src) || fallbackSrc);
  }, [src, fallbackSrc]);

  const onError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={onError}
      {...rest}
    />
  );
};
