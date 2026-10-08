import { useEffect, useState } from 'react';

/** Placeholder text that types itself out, phrase by phrase (paused while the box is in use). */
export function useTypingPlaceholder(phrases: string[], paused: boolean, prefix = '') {
  const [text, setText] = useState(prefix + (phrases[0] || ''));
  useEffect(() => {
    if (paused || phrases.length === 0) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(prefix + phrases[0]);
      return;
    }
    let i = 0;
    let n = 0;
    let deleting = false;
    let t: number;
    const tick = () => {
      const word = phrases[i % phrases.length];
      if (!deleting) {
        n++;
        setText(prefix + word.slice(0, n));
        if (n >= word.length) {
          deleting = true;
          t = window.setTimeout(tick, 1600); // hold the full phrase
          return;
        }
        t = window.setTimeout(tick, 70);
      } else {
        n--;
        setText(prefix + word.slice(0, n));
        if (n <= 0) {
          deleting = false;
          i++;
          t = window.setTimeout(tick, 350);
          return;
        }
        t = window.setTimeout(tick, 35);
      }
    };
    setText(prefix);
    t = window.setTimeout(tick, 400);
    return () => window.clearTimeout(t);
  }, [paused, phrases.join('|'), prefix]);
  return text;
}
