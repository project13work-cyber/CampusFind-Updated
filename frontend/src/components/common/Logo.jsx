import React from 'react';

/**
 * CampusFind Premium Brand Logo Icon (Custom Vector SVG)
 * Blends:
 * 1. Campus Map Pin with subtle 3D rounded geometry
 * 2. Search / Radar Discovery Lens
 * 3. High-precision Focal Spark at center
 * 4. Micro-layered depth and subtle outer aura
 */
export function LogoIcon({ size = 'w-9 h-9', className = '' }) {
  return (
    <div
      className={`relative ${size} flex items-center justify-center shrink-0 group select-none ${className}`}
    >
      {/* Soft Ambient Radial Aura */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#4F7CFF] via-[#7C4DFF] to-[#9B6CFF] opacity-35 blur-md group-hover:opacity-60 group-hover:blur-lg transition-all duration-300 pointer-events-none" />

      {/* Main 3D Glass / Gradient Tile Body */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#0F172A]/90 via-[#1E1B4B]/95 to-[#0F172A]/90 dark:from-[#0B0F19] dark:via-[#161233] dark:to-[#090D16] p-[1.5px] shadow-lg shadow-indigo-950/30 dark:shadow-black/60 border border-white/20 dark:border-white/10 overflow-hidden group-hover:scale-105 group-hover:border-indigo-400/40 transition-all duration-300">
        {/* Subtle Top Specular Shine */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />

        {/* Inner Canvas for Precision Vector */}
        <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-[#4F7CFF]/15 via-[#7C4DFF]/25 to-[#9B6CFF]/20 flex items-center justify-center p-1.5 backdrop-blur-sm">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          >
            <defs>
              {/* Gradient: Pin & Structure */}
              <linearGradient id="cfPinGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="45%" stopColor="#818CF8" />
                <stop offset="75%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>

              {/* Gradient: Radar Search Arc */}
              <linearGradient id="cfRadarGrad" x1="14" y1="12" x2="34" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>

              {/* Gradient: Center Spark */}
              <linearGradient id="cfSparkGrad" x1="20" y1="16" x2="28" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#C4B5FD" />
              </linearGradient>

              {/* Subtle Drop Shadow */}
              <filter id="cfGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#4F46E5" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Geometric Outer Campus Pin Loop with 3D Bevel Curve */}
            <path
              d="M24 6C15.163 6 8 13.163 8 22C8 31.8 20.2 41.2 22.8 43.1C23.52 43.64 24.48 43.64 25.2 43.1C27.8 41.2 40 31.8 40 22C40 13.163 32.837 6 24 6Z"
              stroke="url(#cfPinGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />

            {/* Inner Concentric Search Radar Ring */}
            <circle
              cx="24"
              cy="21"
              r="8"
              stroke="url(#cfRadarGrad)"
              strokeWidth="2.5"
              strokeDasharray="28 6"
              strokeLinecap="round"
              className="opacity-90"
            />

            {/* Discovery Core Pulse Dot */}
            <circle
              cx="24"
              cy="21"
              r="3.2"
              fill="url(#cfSparkGrad)"
              filter="url(#cfGlow)"
            />

            {/* Four-Point Search Sparkle / Crosshair Accents */}
            <path
              d="M24 13.5V15.5M24 26.5V28.5M16.5 21H18.5M29.5 21H31.5"
              stroke="#E0E7FF"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="opacity-80"
            />

            {/* Diagonal Finder Ray */}
            <path
              d="M29.5 26.5L34 31"
              stroke="url(#cfPinGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Main CampusFind Brand Logo Component
 * Supports:
 * - Full horizontal logo: icon + CampusFind + tagline
 * - Compact logo: icon + CampusFind
 * - Icon-only: icon
 * - Light and dark responsive themes
 */
export default function Logo({
  className = '',
  iconSize = 'w-9 h-9',
  showText = true,
  showTagline = true,
  taglineText = 'DIGITAL LOST & FOUND',
  textClass = 'text-xl',
  badgeClass = 'text-[9.5px]',
  variant = 'auto', // 'auto', 'dark', 'light'
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 group select-none transition-all duration-200 ${className}`}
    >
      {/* Modern High-End Icon */}
      <LogoIcon size={iconSize} />

      {/* Typography Block */}
      {showText && (
        <div className="flex flex-col justify-center text-left leading-tight">
          {/* Main Brand Wordmark */}
          <div className="flex items-center tracking-tight font-extrabold">
            <span
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-extrabold tracking-[-0.03em] ${
                variant === 'dark'
                  ? 'text-white'
                  : variant === 'light'
                  ? 'text-slate-900'
                  : 'text-slate-900 dark:text-white'
              } transition-colors ${textClass}`}
            >
              Campus
            </span>
            <span
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-[#4F7CFF] via-[#7C4DFF] to-[#9B6CFF] bg-clip-text text-transparent group-hover:brightness-110 transition-all ${textClass}`}
            >
              Find
            </span>
          </div>

          {/* Subtitle / Tagline */}
          {showTagline && (
            <span
              className={`font-['Inter',sans-serif] font-bold tracking-[0.2em] uppercase mt-0.5 ${
                variant === 'dark'
                  ? 'text-slate-400'
                  : variant === 'light'
                  ? 'text-slate-500'
                  : 'text-slate-500 dark:text-slate-400'
              } ${badgeClass}`}
            >
              {taglineText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
