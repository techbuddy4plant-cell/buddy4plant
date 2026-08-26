import React from 'react';

interface Buddy4PlantLogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  textColor?: string;
  variant?: 'full-circle' | 'icon-only' | 'horizontal';
  onClick?: () => void;
}

export const Buddy4PlantLogo: React.FC<Buddy4PlantLogoProps> = ({
  size = 44,
  className = '',
  showText = true,
  textColor,
  variant = 'horizontal',
  onClick,
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size as string, 10) || 44;

  // The circular badge that precisely reproduces the uploaded logo design
  const CircleLogoBadge = ({ badgeSize }: { badgeSize: number }) => (
    <div
      style={{ width: badgeSize, height: badgeSize }}
      className="relative shrink-0 rounded-full select-none overflow-hidden bg-[#E2F0ED] border border-[#BCE1D8] shadow-xs flex items-center justify-center transition-transform hover:scale-105"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle circular background gradient */}
          <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#EBF6F4" />
            <stop offset="70%" stopColor="#D9ECE8" />
            <stop offset="100%" stopColor="#CDE4DE" />
          </radialGradient>

          {/* Leaf color gradients */}
          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#40916C" />
            <stop offset="100%" stopColor="#1B4332" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#74C69D" />
            <stop offset="100%" stopColor="#2D6A4F" />
          </linearGradient>
          <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8C5835" />
            <stop offset="50%" stopColor="#6E3D1E" />
            <stop offset="100%" stopColor="#532B13" />
          </linearGradient>
        </defs>

        {/* Circular background */}
        <circle cx="100" cy="100" r="98" fill="url(#bgGrad)" stroke="#B8DDD3" strokeWidth="2.5" />

        {/* Tree Foliage Clusters (Lush Green Canopy) */}
        <g id="canopy-leaves">
          {/* Background deeper leaves */}
          <ellipse cx="100" cy="65" rx="72" ry="40" fill="#2D6A4F" opacity="0.9" />
          <ellipse cx="65" cy="72" rx="42" ry="30" fill="#1B4332" opacity="0.85" />
          <ellipse cx="135" cy="72" rx="42" ry="30" fill="#1B4332" opacity="0.85" />
          <ellipse cx="100" cy="48" rx="55" ry="26" fill="#40916C" />
          <ellipse cx="48" cy="78" rx="30" ry="22" fill="#2D6A4F" />
          <ellipse cx="152" cy="78" rx="30" ry="22" fill="#2D6A4F" />
          <ellipse cx="80" cy="55" rx="36" ry="24" fill="#52B788" opacity="0.9" />
          <ellipse cx="120" cy="55" rx="36" ry="24" fill="#52B788" opacity="0.9" />
          
          {/* Individual detailed leaf scatter clusters */}
          <g fill="#74C69D" opacity="0.95">
            {/* Top crown */}
            <path d="M100 28 Q103 20 100 16 Q97 20 100 28Z" />
            <path d="M88 32 Q92 24 87 20 Q83 25 88 32Z" />
            <path d="M112 32 Q117 25 113 20 Q108 24 112 32Z" />
            <path d="M72 38 Q77 30 71 27 Q67 32 72 38Z" />
            <path d="M128 38 Q133 32 129 27 Q123 30 128 38Z" />
            <path d="M58 48 Q64 42 59 38 Q53 42 58 48Z" />
            <path d="M142 48 Q147 42 141 38 Q136 42 142 48Z" />
            <path d="M42 62 Q47 56 41 53 Q37 58 42 62Z" />
            <path d="M158 62 Q163 58 159 53 Q153 56 158 62Z" />
            <path d="M32 76 Q37 72 32 68 Q27 72 32 76Z" />
            <path d="M168 76 Q173 72 168 68 Q163 72 168 76Z" />
          </g>

          {/* Detailed botanical leaf sprites */}
          <g fill="#2D6A4F">
            {/* Left side leaves */}
            <path d="M50 70 C40 65 42 55 52 62 C58 66 56 72 50 70Z" />
            <path d="M62 55 C54 48 58 40 68 47 C74 52 70 58 62 55Z" />
            <path d="M78 42 C72 35 78 28 86 35 C92 40 86 46 78 42Z" />
            <path d="M38 82 C30 76 34 68 44 74 C49 78 46 84 38 82Z" />
            
            {/* Right side leaves */}
            <path d="M150 70 C160 65 158 55 148 62 C142 66 144 72 150 70Z" />
            <path d="M138 55 C146 48 142 40 132 47 C126 52 130 58 138 55Z" />
            <path d="M122 42 C128 35 122 28 114 35 C108 40 114 46 122 42Z" />
            <path d="M162 82 C170 76 166 68 156 74 C151 78 154 84 162 82Z" />
          </g>

          {/* Accent bright spring green leaves */}
          <g fill="#95D5B2">
            <circle cx="85" cy="50" r="4" />
            <circle cx="115" cy="50" r="4" />
            <circle cx="68" cy="65" r="3.5" />
            <circle cx="132" cy="65" r="3.5" />
            <circle cx="100" cy="38" r="4" />
            <circle cx="52" cy="80" r="3" />
            <circle cx="148" cy="80" r="3" />
          </g>
        </g>

        {/* Tree Trunk & Branches (Brown Wood) */}
        <g id="branches" stroke="url(#trunkGrad)" strokeLinecap="round" strokeLinejoin="round">
          {/* Upper branching canopy */}
          <path d="M100 78 Q90 62 70 58" strokeWidth="6" fill="none" />
          <path d="M100 78 Q110 62 130 58" strokeWidth="6" fill="none" />
          <path d="M85 68 Q72 52 56 55" strokeWidth="4.5" fill="none" />
          <path d="M115 68 Q128 52 144 55" strokeWidth="4.5" fill="none" />
          <path d="M70 58 Q55 45 42 60" strokeWidth="3.5" fill="none" />
          <path d="M130 58 Q145 45 158 60" strokeWidth="3.5" fill="none" />
          <path d="M100 70 Q98 50 96 36" strokeWidth="4" fill="none" />
          <path d="M100 70 Q102 50 104 36" strokeWidth="4" fill="none" />
          <path d="M96 48 Q86 38 78 35" strokeWidth="3" fill="none" />
          <path d="M104 48 Q114 38 122 35" strokeWidth="3" fill="none" />
          <path d="M56 55 Q45 52 35 68" strokeWidth="3" fill="none" />
          <path d="M144 55 Q155 52 165 68" strokeWidth="3" fill="none" />
        </g>

        {/* Central "4" integrated as Trunk */}
        <g id="trunk-number-4">
          {/* Main vertical tree trunk forming right stem of "4" */}
          <path
            d="M97 78 L97 136 Q97 142 101 144 Q105 142 105 136 L105 78 Z"
            fill="url(#trunkGrad)"
          />
          {/* Diagonal left stroke of 4 */}
          <path
            d="M99 82 L84 116 L107 116 L107 124 L78 124 L78 114 L94 80 Z"
            fill="url(#trunkGrad)"
          />
          {/* Horizontal crossbar of 4 */}
          <path
            d="M76 114 L118 114 Q120 114 120 119 Q120 124 116 124 L76 124 Z"
            fill="url(#trunkGrad)"
          />
        </g>

        {/* Tree Roots Spreading Outwards */}
        <g id="roots" stroke="url(#trunkGrad)" strokeLinecap="round" fill="none">
          <path d="M101 142 Q101 155 101 166" strokeWidth="4" />
          <path d="M99 143 Q90 152 76 162" strokeWidth="3.5" />
          <path d="M103 143 Q112 152 126 162" strokeWidth="3.5" />
          <path d="M94 146 Q80 156 65 158" strokeWidth="2.5" />
          <path d="M108 146 Q122 156 137 158" strokeWidth="2.5" />
          <path d="M85 156 Q75 165 68 172" strokeWidth="2" />
          <path d="M117 156 Q127 165 134 172" strokeWidth="2" />
          <path d="M97 155 Q92 166 88 172" strokeWidth="2" />
          <path d="M105 155 Q110 166 114 172" strokeWidth="2" />
        </g>

        {/* Logo Text: "buddy" (left) and "plant" (right) */}
        <g fill="#1F2923" fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif" fontWeight="800">
          <text
            x="14"
            y="118"
            fontSize="27"
            letterSpacing="-0.5"
          >
            buddy
          </text>
          <text
            x="122"
            y="118"
            fontSize="27"
            letterSpacing="-0.5"
          >
            plant
          </text>
        </g>
      </svg>
    </div>
  );

  if (variant === 'full-circle' || variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
        onClick={onClick}
        title="buddy4plant"
      >
        <CircleLogoBadge badgeSize={numericSize} />
      </div>
    );
  }

  // Horizontal Brand Lockup with rich typography
  return (
    <div
      className={`inline-flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group ${className}`}
      onClick={onClick}
      title="buddy4plant — Botanical Nursery"
    >
      <CircleLogoBadge badgeSize={numericSize} />

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline">
            <span
              className="font-serif text-xl sm:text-2xl font-black tracking-tight leading-none transition-colors"
              style={{ color: textColor || '#1F341C' }}
            >
              buddy<span className="text-[#8C5835] font-extrabold mx-0.5">4</span>plant
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-[#5A6E55] uppercase font-semibold mt-0.5">
            Botanical Sanctuary
          </span>
        </div>
      )}
    </div>
  );
};
