import { useEffect } from 'react';

/**
 * Placeholder text that types itself out, phrase by phrase (paused while the box is in use).
 * Writes straight to the inputs marked with `data-b4p-typing`, so the animation never
 * re-renders the navbar. Returns the static text to use as the React placeholder.
 */
export function useTypingPlaceholder(phrases: string[], paused: boolean, prefix = '') {
  const key = phrases.join('|');
  useEffect(() => {
    if (paused || phrases.length === 0 || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const set = (text: string) =>
      document.querySelectorAll<HTMLInputElement>('input[data-b4p-typing]').forEach((el) => {
        if (document.activeElement !== el && !el.value) el.placeholder = text;
      });
    let i = 0;
    let n = 0;
    let deleting = false;
    let t: number;
    const tick = () => {
      if (document.hidden) {
        t = window.setTimeout(tick, 1000);
        return;
      }
      const word = phrases[i % phrases.length];
      if (!deleting) {
        n++;
        set(prefix + word.slice(0, n));
        if (n >= word.length) {
          deleting = true;
          t = window.setTimeout(tick, 1600); // hold the full phrase
          return;
        }
        t = window.setTimeout(tick, 70);
      } else {
        n--;
        set(prefix + word.slice(0, n));
        if (n <= 0) {
          deleting = false;
          i++;
          t = window.setTimeout(tick, 350);
          return;
        }
        t = window.setTimeout(tick, 35);
      }
    };
    t = window.setTimeout(tick, 1200);
    return () => {
      window.clearTimeout(t);
      set(prefix + phrases[0]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, key, prefix]);
  return prefix + (phrases[0] || '');
}
