import React, { useEffect, useState } from 'react';
import { PlantImage } from '../../utils/imageFallback';

/**
 * Bar that slides up from the bottom once the main "Add to Cart" row has scrolled out of view,
 * so shoppers can add the product from anywhere on the page.
 */
export const StickyBuyBar: React.FC<{
  targetId: string;
  image?: string;
  name: string;
  price: number;
  comparePrice?: number;
  option?: string;
  disabled?: boolean;
  onAdd: () => void;
}> = ({ targetId, image, name, price, comparePrice, option, disabled, onAdd }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);

  // lets the floating WhatsApp button move up while this bar is showing
  useEffect(() => {
    if (show) document.body.dataset.buybar = '1';
    else delete document.body.dataset.buybar;
    return () => {
      delete document.body.dataset.buybar;
    };
  }, [show]);

  return (
    <div
      className={`fixed inset-x-0 bottom-[60px] lg:bottom-0 z-30 border-t border-[#E6E0D3] bg-white/95 backdrop-blur-md shadow-[0_-10px_30px_-18px_rgba(19,48,27,0.35)] transition-[transform,opacity] duration-300 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-[240%] opacity-0 pointer-events-none'
      }`}
      aria-hidden={!show}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {image && (
          <span className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl bg-[#F1ECE2]">
            <PlantImage src={image} alt="" className="h-full w-full object-cover" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-sm sm:text-base font-medium text-[#13301B]">{name}</p>
          <p className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-[#141414]">₹{price.toLocaleString('en-IN')}</span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-[#9A9A9A] line-through">₹{comparePrice.toLocaleString('en-IN')}</span>
            )}
            {option && <span className="hidden sm:inline truncate text-xs text-[#6B6B6B]">· {option}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          tabIndex={show ? 0 : -1}
          className="shrink-0 rounded-full bg-[#13301B] px-5 sm:px-8 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#1F4A2B] disabled:cursor-not-allowed disabled:bg-[#A7A7A7]"
        >
          {disabled ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
