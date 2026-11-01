import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Pop-ups that are open right now (the last one is on top). Esc closes only the top one.
const openStack: number[] = [];
let nextId = 1;

/**
 * Round ✕ button that stays in the top-right corner of the screen while an admin pop-up is open,
 * so it can always be reached (even on a phone, or after scrolling down a long form).
 * Place it as the first child of the pop-up's outer `fixed inset-0` wrapper.
 */
export const ModalClose: React.FC<{ onClose: () => void; label?: string }> = ({ onClose, label = 'Close' }) => {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const id = nextId++;
    openStack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || openStack[openStack.length - 1] !== id) return;
      e.stopPropagation();
      closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      const i = openStack.indexOf(id);
      if (i >= 0) openStack.splice(i, 1);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      title={`${label} (Esc)`}
      className="fixed top-3 right-3 z-[80] w-10 h-10 rounded-full bg-white text-[#1A1A1A] shadow-lg border border-black/10 flex items-center justify-center hover:bg-[#F5F2EB] active:scale-95 transition"
    >
      <X className="w-5 h-5" />
    </button>
  );
};
