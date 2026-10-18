/**
 * Email links (contactus@buddy4plant.in is filled in as the recipient).
 *
 * Every email link is a normal "mailto:" link, so the device decides what opens:
 *  - phones go straight to the mail app (or show the phone's own app chooser)
 *  - computers open the default mail app, or the system's "choose an app" window
 * Many Windows computers have no mail app set up and then nothing happens at all. So on a computer,
 * if no mail app has opened after a moment, a small menu appears instead: Gmail, Outlook, or copy the address.
 */

const MENU_ID = 'b4p-email-menu';

const parseMailto = (href: string) => {
  const [addr, query = ''] = href.replace(/^mailto:/i, '').split('?');
  const params = new URLSearchParams(query);
  return {
    to: decodeURIComponent(addr || ''),
    subject: params.get('subject') || '',
    body: params.get('body') || '',
  };
};

const isComputer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  window.innerWidth >= 768;

function closeMenu() {
  document.getElementById(MENU_ID)?.remove();
  document.removeEventListener('keydown', onKey, true);
  document.removeEventListener('click', onOutside, true);
  window.removeEventListener('scroll', closeMenu, true);
  window.removeEventListener('resize', closeMenu);
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu();
}
function onOutside(e: MouseEvent) {
  const menu = document.getElementById(MENU_ID);
  if (menu && !menu.contains(e.target as Node)) closeMenu();
}

function openMenu(link: HTMLAnchorElement, title?: string) {
  closeMenu();
  const { to, subject, body } = parseMailto(link.getAttribute('href') || '');
  if (!to) return;
  const enc = encodeURIComponent;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(to)}${subject ? `&su=${enc(subject)}` : ''}${body ? `&body=${enc(body)}` : ''}`;
  const outlook = `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(to)}${subject ? `&subject=${enc(subject)}` : ''}${body ? `&body=${enc(body)}` : ''}`;

  const menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.setAttribute('role', 'menu');
  menu.style.cssText =
    'position:fixed;z-index:2147483001;min-width:230px;background:#fff;border:1px solid #E3DFD4;border-radius:14px;' +
    'box-shadow:0 12px 32px rgba(20,43,26,.18);padding:6px;font:500 14px/1.3 "DM Sans",system-ui,sans-serif;color:#1A1A1A';

  const head = document.createElement('div');
  head.textContent = title ? `${title} ${to}` : to;
  head.style.cssText = 'padding:8px 10px 6px;font-size:12px;color:#5B6B5C;word-break:break-all';
  menu.appendChild(head);

  const item = (icon: string, label: string, run: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'menuitem');
    b.innerHTML = `<i class="${icon}" aria-hidden="true" style="width:18px;text-align:center;color:#1F4A2C"></i><span></span>`;
    (b.querySelector('span') as HTMLSpanElement).textContent = label;
    b.style.cssText =
      'display:flex;align-items:center;gap:10px;width:100%;padding:10px;border:0;background:none;border-radius:10px;cursor:pointer;text-align:left;font:inherit;color:inherit';
    b.onmouseenter = () => (b.style.background = '#F1F5EE');
    b.onmouseleave = () => (b.style.background = 'none');
    b.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      run();
    };
    menu.appendChild(b);
    return b;
  };

  item('fa-solid fa-envelope', 'Open in Gmail', () => {
    window.open(gmail, '_blank', 'noopener');
    closeMenu();
  });
  item('fa-solid fa-envelope-open-text', 'Open in Outlook', () => {
    window.open(outlook, '_blank', 'noopener');
    closeMenu();
  });
  const copyBtn = item('fa-regular fa-copy', 'Copy email address', () => {
    const done = () => {
      (copyBtn.querySelector('span') as HTMLSpanElement).textContent = 'Copied!';
      window.setTimeout(closeMenu, 900);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(to).then(done, done);
    else done();
  });

  document.body.appendChild(menu);
  // place it under the link, kept inside the screen
  const r = link.getBoundingClientRect();
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  const left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
  const below = r.bottom + 8;
  const top = below + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 8) : below;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  (menu.querySelector('button') as HTMLButtonElement | null)?.focus();

  window.setTimeout(() => {
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('click', onOutside, true);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);
  }, 0);
}

export function installEmailLinkMenu() {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest?.('a[href^="mailto:" i]') as HTMLAnchorElement | null;
    if (!link || !isComputer()) return; // phones: the normal mailto opens the mail app
    // Computers: let the browser open the system's mail app / app chooser as usual.
    // If nothing takes over the screen within ~1.5 s (no mail app set up), offer the menu.
    let opened = false;
    const left = () => {
      opened = true;
    };
    window.addEventListener('blur', left, { once: true });
    document.addEventListener('visibilitychange', left, { once: true });
    window.addEventListener('pagehide', left, { once: true });
    window.setTimeout(() => {
      window.removeEventListener('blur', left);
      document.removeEventListener('visibilitychange', left);
      window.removeEventListener('pagehide', left);
      if (!opened && document.hasFocus()) openMenu(link, 'No mail app opened? Write to');
    }, 1500);
  });
}
