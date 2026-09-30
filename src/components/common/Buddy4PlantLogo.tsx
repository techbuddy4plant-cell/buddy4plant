import React from 'react';

/**
 * Buddy4Plant brand logo (the official tree + "buddy4plant" wordmark).
 * Source file: /public/logo.png (transparent background).
 *
 * variant="horizontal"  - the logo as-is, used in the header and menus (height = size * 1.55)
 * variant="full-circle" / "icon-only" - the logo inside a round white badge (avatars, login, admin)
 */
interface Buddy4PlantLogoProps {
  size?: number | string;
  className?: string;
  /** show the "buddy4plant / Botanical Sanctuary" heading next to the logo (horizontal only) */
  showText?: boolean;
  textColor?: string;
  variant?: 'full-circle' | 'icon-only' | 'horizontal';
  onClick?: () => void;
}

export const LOGO_SRC = '/logo.png';

export const Buddy4PlantLogo: React.FC<Buddy4PlantLogoProps> = ({
  size = 44,
  className = '',
  variant = 'horizontal',
  showText = true,
  textColor,
  onClick,
}) => {
  const n = typeof size === 'number' ? size : parseInt(size as string, 10) || 44;

  if (variant === 'full-circle' || variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
        onClick={onClick}
        title="Buddy4Plant"
      >
        <div
          style={{ width: n, height: n }}
          className="shrink-0 rounded-full overflow-hidden bg-white border border-[#E5E2D9] shadow-xs flex items-center justify-center transition-transform hover:scale-105"
        >
          <img src={LOGO_SRC} alt="Buddy4Plant logo" className="w-[86%] h-[86%] object-contain" draggable={false} />
        </div>
      </div>
    );
  }

  const h = Math.round(n * 1.55);
  return (
    <div
      className={`inline-flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none ${className}`}
      onClick={onClick}
      title="Buddy4Plant - Lucknow nursery & landscaping"
    >
      <img
        src={LOGO_SRC}
        alt="Buddy4Plant"
        style={{ height: h, width: Math.round(h * 1.32) }}
        className="b4p-logo-img object-contain shrink-0 max-sm:h-11! max-sm:w-[58px]!"
        draggable={false}
      />
      {showText && (
        <div className="hidden min-[390px]:flex flex-col justify-center">
          <span
            className="b4p-logo-text font-serif text-lg sm:text-2xl font-black tracking-tight leading-none transition-colors"
            style={{ color: textColor || '#1F341C' }}
          >
            buddy<span className="text-[#8C5835] font-extrabold mx-0.5">4</span>plant
          </span>
          <span className="b4p-logo-sub hidden sm:block text-[9px] sm:text-[10px] tracking-[0.22em] text-[#5A6E55] uppercase font-semibold mt-0.5">
            Botanical Sanctuary
          </span>
        </div>
      )}
    </div>
  );
};

export default Buddy4PlantLogo;
