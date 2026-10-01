import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './CardNav.css';

/**
 * CardNav from React Bits (reactbits.dev), adapted for Buddy4Plant:
 * - links navigate inside the app instead of reloading the page
 * - the top bar sits outside the animated panel so dropdowns (account menu) are never clipped
 * - any number of cards, height measured from the content
 * - closes on Escape, outside click and after a link is chosen
 */
export type CardNavLink = { label: string; href: string; ariaLabel?: string };
export type CardNavItem = { label: string; bgColor: string; textColor: string; links: CardNavLink[] };

type CardNavProps = {
  logo: React.ReactNode;
  onLogoClick?: () => void;
  items: CardNavItem[];
  actions?: React.ReactNode;
  /** optional middle slot (e.g. a search bar); when set the logo sits on the left */
  center?: React.ReactNode;
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonLabel?: React.ReactNode;
  onButtonClick?: () => void;
  onNavigate: (href: string) => void;
  /** when this value changes (e.g. the current page path) the menu closes */
  closeKey?: string;
};

const CardNav: React.FC<CardNavProps> = ({
  logo,
  onLogoClick,
  items,
  actions,
  center,
  className = '',
  ease = 'power3.out',
  baseColor = '#FDFCF9',
  menuColor = '#1F341C',
  buttonBgColor = '#13301B',
  buttonTextColor = '#F4EFE3',
  buttonLabel,
  onButtonClick,
  onNavigate,
  closeKey,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const topBarHeight = () => (window.matchMedia('(max-width: 768px)').matches ? 58 : 64);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 300;
    const contentEl = navEl.querySelector<HTMLElement>('.card-nav-content');
    if (!contentEl) return 300;
    const prev = { v: contentEl.style.visibility, p: contentEl.style.position, h: contentEl.style.height };
    contentEl.style.visibility = 'visible';
    contentEl.style.position = 'static';
    contentEl.style.height = 'auto';
    const contentHeight = contentEl.scrollHeight;
    contentEl.style.visibility = prev.v;
    contentEl.style.position = prev.p;
    contentEl.style.height = prev.h;
    return topBarHeight() + contentHeight + 4;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: topBarHeight(), overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 40, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.07 }, '-=0.1');
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      tlRef.current.kill();
      const newTl = createTimeline();
      if (!newTl) return;
      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        newTl.progress(1);
      }
      tlRef.current = newTl;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const close = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    setIsHamburgerOpen(false);
    tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
    tl.reverse();
  }, []);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    // use the button state, so a click during the closing animation re-opens instead of being ignored
    if (!isHamburgerOpen) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.eventCallback('onReverseComplete', null);
      tl.play(0);
    } else {
      close();
    }
  };

  // Escape key and clicks outside close the menu
  useEffect(() => {
    if (!isHamburgerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [isHamburgerOpen, close]);

  // Close when the page changes, on Back, and on taps outside (touch screens)
  useEffect(() => {
    close();
  }, [closeKey, close]);
  useEffect(() => {
    if (!isHamburgerOpen) return;
    const onPop = () => close();
    const onTouch = (e: TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    window.addEventListener('popstate', onPop);
    document.addEventListener('touchstart', onTouch, { passive: true });
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('touchstart', onTouch);
    };
  }, [isHamburgerOpen, close]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    close();
    onNavigate(href);
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div ref={containerRef} className={`card-nav-container ${className}`}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? 'open' : ''}`}
        style={{ backgroundColor: baseColor }}
        aria-label="Main"
      >
        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {items.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links.map((lnk, i) => (
                  <a
                    key={`${lnk.label}-${i}`}
                    className="nav-card-link"
                    href={lnk.href}
                    aria-label={lnk.ariaLabel || lnk.label}
                    tabIndex={isExpanded ? 0 : -1}
                    onClick={go(lnk.href)}
                  >
                    <i className="fa-solid fa-arrow-right nav-card-link-icon" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Top bar sits above the animated panel so dropdowns are never clipped */}
      <div className={`card-nav-top ${center ? 'has-center' : ''}`}>
        <div className="card-nav-left">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
              }
            }}
            role="button"
            aria-label={isHamburgerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isHamburgerOpen}
            tabIndex={0}
            style={{ color: menuColor }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>
          <span className="hamburger-label" onClick={toggleMenu} aria-hidden="true">
            {isHamburgerOpen ? 'Close' : 'Menu'}
          </span>
          <div className="logo-container" onClick={() => { close(); onLogoClick?.(); }}>
            {logo}
          </div>
        </div>

        {center && <div className="card-nav-center">{center}</div>}

        <div className="card-nav-actions">
          {actions}
          {buttonLabel && (
            <button
              type="button"
              className="card-nav-cta-button"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              onClick={onButtonClick}
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardNav;
