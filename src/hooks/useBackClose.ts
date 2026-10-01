import { useEffect, useRef } from 'react';

/**
 * While `open` is true, the browser/phone Back button closes the overlay (drawer, modal, menu)
 * instead of leaving the page with the overlay still showing.
 */
export function useBackClose(open: boolean, onClose: () => void) {
  const cb = useRef(onClose);
  cb.current = onClose;
  useEffect(() => {
    if (!open) return;
    let pushed = false;
    // deferred so React StrictMode's mount/unmount check never leaves a stray history entry
    const t = window.setTimeout(() => {
      window.history.pushState({ ...(window.history.state || {}), b4pOverlay: true }, '');
      pushed = true;
    }, 0);
    const onPop = () => {
      pushed = false;
      cb.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('popstate', onPop);
      // closed by a button (not by Back): drop the extra history entry we added
      if (pushed && window.history.state?.b4pOverlay) window.history.back();
    };
  }, [open]);
}
