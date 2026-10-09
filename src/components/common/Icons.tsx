import React from 'react';

/**
 * Font Awesome icons for the storefront.
 * Exposes the same component names the site used before (Search, ShoppingBag, ...) so every
 * component keeps working, but each one now renders a Font Awesome 6 icon (loaded in index.html).
 * Size comes from the w-* class (w-4 = 1rem), colour from the text-* class, as before.
 */
type IconProps = {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
  title?: string;
  // accepted for compatibility, ignored
  strokeWidth?: number | string;
  fill?: string;
  [key: string]: unknown;
};

const sizeFromClass = (className = ''): string | null => {
  const m = className.match(/(?:^|\s)(?:w|size)-(\d+(?:\.\d+)?)(?=\s|$)/);
  if (m) return `${parseFloat(m[1]) / 4}rem`;
  const px = className.match(/(?:^|\s)w-\[(\d+)px\](?=\s|$)/);
  return px ? `${px[1]}px` : null;
};

/** Removes sizing / svg-only classes that make no sense on a font icon. */
const cleanClass = (className = '') =>
  className
    .split(/\s+/)
    .filter((c) => c && !/^(?:[a-z]+:)?(?:w|h|size)-/.test(c) && !/^(?:[a-z]+:)?(?:fill|stroke)-/.test(c))
    .join(' ');

const make = (fa: string, opts: { regular?: boolean; brand?: boolean; spin?: boolean } = {}) => {
  const Icon: React.FC<IconProps> = ({ className = '', size, style, title }) => {
    const filled = /(?:^|\s)fill-(?!none|transparent)/.test(className);
    const family = opts.brand ? 'fa-brands' : opts.regular && !filled ? 'fa-regular' : 'fa-solid';
    const dim = size !== undefined ? (typeof size === 'number' ? `${size}px` : size) : sizeFromClass(className) || '1.25rem';
    return (
      <i
        aria-hidden={title ? undefined : true}
        title={title}
        className={`${family} fa-${fa} ${cleanClass(className)}`}
        style={{
          width: dim,
          height: dim,
          fontSize: `calc(${dim} * 0.88)`,
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  };
  Icon.displayName = `Fa(${fa})`;
  return Icon;
};

export const AlertCircle = make('circle-exclamation');
export const AlertTriangle = make('triangle-exclamation');
export const ArrowDown = make('arrow-down');
export const ArrowLeft = make('arrow-left');
export const ArrowRight = make('arrow-right');
export const ArrowUp = make('arrow-up');
export const ArrowUpDown = make('arrow-down-wide-short');
export const ArrowUpRight = make('arrow-up-right-from-square');
export const Bell = make('bell', { regular: true });
export const BookOpen = make('book-open');
export const Building2 = make('building', { regular: true });
export const Calendar = make('calendar', { regular: true });
export const CalendarCheck = make('calendar-check', { regular: true });
export const Check = make('check');
export const CheckCircle = make('circle-check');
export const CheckCircle2 = make('circle-check');
export const ChevronDown = make('chevron-down');
export const ChevronLeft = make('chevron-left');
export const ChevronRight = make('chevron-right');
export const ChevronUp = make('chevron-up');
export const Clock = make('clock', { regular: true });
export const CloudOff = make('cloud');
export const CloudRain = make('cloud-rain');
export const Compass = make('compass', { regular: true });
export const Copy = make('copy', { regular: true });
export const DollarSign = make('indian-rupee-sign');
export const Droplets = make('droplet');
export const Edit2 = make('pen');
export const Edit3 = make('pen-to-square', { regular: true });
export const ExternalLink = make('arrow-up-right-from-square');
export const Eye = make('eye', { regular: true });
export const Facebook = make('facebook-f', { brand: true });
export const Film = make('film');
export const Flower2 = make('spa');
export const Gift = make('gift');
export const Grid = make('table-cells-large');
export const Heart = make('heart', { regular: true });
export const HeartHandshake = make('handshake', { regular: true });
export const HelpCircle = make('circle-question', { regular: true });
export const Home = make('house');
export const Image = make('image', { regular: true });
export const ImagePlus = make('image', { regular: true });
export const Images = make('images', { regular: true });
export const Inbox = make('inbox');
export const Instagram = make('instagram', { brand: true });
export const Key = make('key');
export const KeyRound = make('key');
export const Landmark = make('landmark');
export const LayoutDashboard = make('gauge');
export const Leaf = make('leaf');
export const Lightbulb = make('lightbulb', { regular: true });
export const Link = make('link');
export const ListTree = make('list');
export const Loader2 = make('circle-notch');
export const Lock = make('lock');
export const LogOut = make('right-from-bracket');
export const Mail = make('envelope', { regular: true });
export const MapPin = make('location-dot');
export const Menu = make('bars');
export const MessageCircle = make('whatsapp', { brand: true });
export const MessageSquare = make('message', { regular: true });
export const Minus = make('minus');
export const Moon = make('moon', { regular: true });
export const Navigation = make('location-arrow');
export const Package = make('box');
export const PawPrint = make('paw');
export const Percent = make('percent');
export const Phone = make('phone');
export const PlayCircle = make('circle-play', { regular: true });
export const Plus = make('plus');
export const Printer = make('print');
export const RefreshCw = make('rotate');
export const RotateCcw = make('rotate-left');
export const Save = make('floppy-disk', { regular: true });
export const Search = make('magnifying-glass');
export const Send = make('paper-plane');
export const Share2 = make('share-nodes');
export const Shield = make('shield');
export const ShieldAlert = make('shield-halved');
export const ShieldCheck = make('shield-halved');
export const ShoppingBag = make('bag-shopping');
export const ShoppingCart = make('cart-shopping');
export const SlidersHorizontal = make('sliders');
export const Snowflake = make('snowflake', { regular: true });
export const Sparkles = make('leaf');
export const Sprout = make('seedling');
export const Star = make('star', { regular: true });
export const Sun = make('sun', { regular: true });
export const Tag = make('tag');
export const Thermometer = make('temperature-half');
export const Trash2 = make('trash-can', { regular: true });
export const Trees = make('tree');
export const Truck = make('truck-fast');
export const Upload = make('upload');
export const User = make('user', { regular: true });
export const Wrench = make('screwdriver-wrench');
export const X = make('xmark');
export const Youtube = make('youtube', { brand: true });
export const Zap = make('bolt');
export const CreditCard = make('credit-card', { regular: true });
export const Banknote = make('money-bill-wave');
export const Download = make('download');
export const PackageCheck = make('box-open');
export const PackageOpen = make('box-open');
