import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Sparkles,
  MapPin,
  Building,
  ShieldCheck,
  Search,
  Layers,
  Zap,
  Key,
  Laptop,
  Headphones,
  CreditCard,
  Droplets,
  Radio
} from 'lucide-react';

/**
 * Premium 3D Campus Spatial Matching Visualization
 * Features:
 * - Central glowing rotating search/navigation core
 * - Floating campus objects: Backpack, Keys, Water bottle, Student ID card, Laptop, Headphones, Wallet, Smartphone
 * - Small 3D glassmorphic campus buildings (Library, Tech Block, Food Court, Security Desk)
 * - Orbiting coordinates and location pins with soft pulsing scanning waves
 * - Animated glowing connection lines / laser rays between matching objects & locations
 * - Dynamic mouse parallax with 3D depth and tilt responsiveness
 * - Floating ambient particles & isometric grid
 * - Respects prefers-reduced-motion and provides lightweight automatic mode on mobile
 */
export default function HeroSpatialScene({ mousePos = { x: 0, y: 0 } }) {
  const [activeObject, setActiveObject] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const [localParallax, setLocalParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle local card mouse move for precise smooth 3D tilt
  const handleMouseMove = (e) => {
    if (isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setLocalParallax({
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3))
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveObject(null);
    setLocalParallax({ x: 0, y: 0 });
  };

  // Parallax offsets
  const px = isMobile ? 0 : (localParallax.x * 12 + mousePos.x * 0.4);
  const py = isMobile ? 0 : (localParallax.y * 12 + mousePos.y * 0.4);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-xl aspect-[4/3.7] select-none flex items-center justify-center p-2 lg:p-4 perspective-[1400px]"
    >
      {/* Background Ambient Glow Behind Scene */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-400/20 rounded-[36px] blur-2xl pointer-events-none transform -translate-y-2" />

      {/* Main 3D Spatial Island Container with Glassmorphism */}
      <div
        style={{
          transform: `perspective(1200px) rotateY(${px * 0.7}deg) rotateX(${-py * 0.7}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="relative w-full h-full rounded-3xl bg-gradient-to-b from-slate-900/85 via-[#090e1e]/90 to-[#030712]/95 border border-indigo-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(79,70,229,0.15)] backdrop-blur-2xl flex flex-col justify-between p-5 sm:p-6 overflow-visible group"
      >
        {/* Top Spatial Status Header */}
        <div
          style={{ transform: 'translateZ(30px)' }}
          className="flex items-center justify-between border-b border-white/10 pb-3 relative z-30"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-extrabold tracking-wide text-cyan-300">
                CAMPUS SPATIAL INTELLIGENCE
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                Real-time 3D Object & Zone Correlation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            <span className="text-emerald-300 font-bold">7-Factor Active</span>
          </div>
        </div>

        {/* =========================================================================
            CENTRAL SPATIAL MATCHING RADAR & 3D ISOMETRIC PLANE
        ========================================================================= */}
        <div className="relative my-auto py-6 flex flex-col items-center justify-center">
          {/* Animated 3D Isometric Grid Floor */}
          <div
            style={{
              transform: `translate3d(${px * -0.2}px, ${py * -0.2}px, 5px) rotateX(48deg) rotateZ(-20deg) scale(1.15)`,
              transformStyle: 'preserve-3d'
            }}
            className="absolute w-72 h-72 rounded-3xl border border-indigo-500/20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"
          />

          {/* Concentric Rotating Spatial Radar Rings */}
          <div
            style={{
              transform: `translate3d(${px * -0.3}px, ${py * -0.3}px, 15px)`
            }}
            className="absolute w-60 h-60 rounded-full border border-indigo-500/25 animate-spin-slow pointer-events-none"
          />
          <div
            style={{
              transform: `translate3d(${px * -0.4}px, ${py * -0.4}px, 20px)`
            }}
            className="absolute w-44 h-44 rounded-full border border-dashed border-cyan-400/30 animate-pulse pointer-events-none"
          />
          <div
            style={{
              transform: `translate3d(${px * -0.5}px, ${py * -0.5}px, 25px)`
            }}
            className="absolute w-32 h-32 rounded-full border border-violet-500/30 animate-spin-slow pointer-events-none"
          />

          {/* Central Radial Energy Glow */}
          <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-indigo-600/35 via-violet-600/30 to-cyan-400/25 blur-2xl pointer-events-none animate-pulse-subtle" />

          {/* SVG Vector Laser Rays Connecting Objects & Buildings */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            viewBox="0 0 400 300"
          >
            <defs>
              <linearGradient id="cyanLaser" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="purpleLaser" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="emeraldLaser" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Ray to Headphones / Library (Top Right) */}
            <line
              x1="200"
              y1="140"
              x2="320"
              y2="55"
              stroke="url(#cyanLaser)"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
            {/* Ray to Backpack / Tech Block (Top Left) */}
            <line
              x1="200"
              y1="140"
              x2="80"
              y2="55"
              stroke="url(#purpleLaser)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              className="animate-pulse"
            />
            {/* Ray to Wallet / Canteen (Bottom Left) */}
            <line
              x1="200"
              y1="140"
              x2="75"
              y2="235"
              stroke="url(#purpleLaser)"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
            {/* Ray to Student ID / Security Desk (Bottom Right) */}
            <line
              x1="200"
              y1="140"
              x2="320"
              y2="235"
              stroke="url(#emeraldLaser)"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="animate-pulse"
            />

            {/* Traveling Matching Energy Pulses */}
            <circle cx="260" cy="98" r="3" fill="#38bdf8" className="animate-ping" opacity="0.8" />
            <circle cx="138" cy="188" r="3" fill="#c084fc" className="animate-ping" opacity="0.8" />
          </svg>

          {/* Central 3D Core: Rotating Search & Spatial Match Core */}
          <div
            style={{
              transform: `translate3d(${px * 0.4}px, ${py * 0.4}px, 45px)`,
              transformStyle: 'preserve-3d'
            }}
            className="relative z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-cyan-400 p-[2px] shadow-[0_0_35px_rgba(99,102,241,0.5)] hover:scale-105 transition-all duration-300 group/core cursor-pointer"
          >
            <div className="w-full h-full rounded-3xl bg-[#070b16] flex flex-col items-center justify-center p-2 text-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-transparent to-indigo-500/20 opacity-80 group-hover/core:opacity-100 transition-opacity" />
              
              {/* Rotating Compass / Radar Reticle */}
              <div className="relative">
                <Compass className="w-8 h-8 sm:w-9 sm:h-9 text-cyan-300 animate-spin-slow drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
                <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-30" />
              </div>
              <span className="text-[9px] font-mono font-black text-slate-200 mt-1 uppercase tracking-tight">
                AI Matcher
              </span>
            </div>
          </div>

          {/* Central Match Status Tag */}
          <div
            style={{
              transform: `translate3d(${px * 0.25}px, ${py * 0.25}px, 35px)`
            }}
            className="mt-3 text-center relative z-20"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-indigo-500/30 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span className="text-xs font-extrabold text-white tracking-wide">
                Spatial Auto-Correlation
              </span>
              <Sparkles className="w-3 h-3 text-cyan-300" />
            </div>
            <p className="text-[10px] text-indigo-200/80 font-mono mt-1">
              "Lost Item → Location → Matching → Recovery"
            </p>
          </div>
        </div>

        {/* =========================================================================
            8 FLOATING 3D LOST-AND-FOUND BELONGINGS & ISOMETRIC CAMPUS HUBS
        ========================================================================= */}

        {/* 1. 🎒 Backpack & Tech Block Lab 3 (Top-Left) */}
        <div
          onMouseEnter={() => setActiveObject('backpack')}
          onMouseLeave={() => setActiveObject(null)}
          style={{
            transform: `translate3d(${px * -0.9}px, ${py * -0.9}px, 60px)`,
            transition: 'transform 0.15s ease-out'
          }}
          className={`absolute -top-3 -left-3 sm:-left-6 bg-slate-900/90 hover:bg-slate-900 border ${
            activeObject === 'backpack' ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-indigo-500/40'
          } p-2.5 sm:p-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-float-slow flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 z-30`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl filter drop-shadow shadow-inner">
            🎒
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-indigo-300 uppercase">Tech Block 2</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            </div>
            <p className="text-xs font-extrabold text-white leading-tight">Wildcraft Bag</p>
            <p className="text-[10px] text-slate-400 font-mono">Zone: CS Lab 3</p>
          </div>
        </div>

        {/* 2. 🎧 Headphones / Boat Neckband & Library (Top-Right) */}
        <div
          onMouseEnter={() => setActiveObject('headphones')}
          onMouseLeave={() => setActiveObject(null)}
          style={{
            transform: `translate3d(${px * 1.0}px, ${py * -0.9}px, 70px)`,
            transition: 'transform 0.15s ease-out'
          }}
          className={`absolute -top-3 -right-3 sm:-right-6 bg-slate-900/90 hover:bg-slate-900 border ${
            activeObject === 'headphones' ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-cyan-500/40'
          } p-2.5 sm:p-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-float-medium flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 z-30`}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-2xl filter drop-shadow shadow-inner">
            🎧
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase">Library 1F</span>
              <span className="text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-500/30">
                96% MATCH
              </span>
            </div>
            <p className="text-xs font-extrabold text-white leading-tight">Boat Earphones</p>
            <p className="text-[10px] text-slate-400 font-mono">Reading Table 7</p>
          </div>
        </div>

        {/* 3. 💻 Laptop / MacBook (Middle-Left Orbit) */}
        <div
          onMouseEnter={() => setActiveObject('laptop')}
          onMouseLeave={() => setActiveObject(null)}
          style={{
            transform: `translate3d(${px * -1.2}px, ${py * 0.1}px, 55px)`,
            transition: 'transform 0.15s ease-out'
          }}
          className={`absolute top-1/4 -left-6 sm:-left-9 bg-slate-900/90 hover:bg-slate-900 border ${
            activeObject === 'laptop' ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-violet-500/40'
          } px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-xl animate-float-reverse flex items-center gap-2 cursor-pointer transition-all hover:scale-105 z-30`}
        >
          <span className="text-xl filter drop-shadow">💻</span>
          <div>
            <p className="text-[9px] font-mono font-bold text-violet-300 uppercase">MacBook Air</p>
            <p className="text-[11px] font-bold text-white leading-tight">Seminar Hall B</p>
          </div>
        </div>

        {/* 4. 🔑 Keys & Keyring (Middle-Right Orbit) */}
        <div
          onMouseEnter={() => setActiveObject('keys')}
          onMouseLeave={() => setActiveObject(null)}
          style={{
            transform: `translate3d(${px * 1.2}px, ${py * 0.3}px, 50px)`,
            transition: 'transform 0.15s ease-out'
          }}
          className={`absolute top-1/4 -right-6 sm:-right-8 bg-slate-900/90 hover:bg-slate-900 border ${
            activeObject === 'keys' ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-amber-500/40'
          } px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-xl animate-float-slow flex items-center gap-2 cursor-pointer transition-all hover:scale-105 z-30`}
        >
          <span className="text-xl filter drop-shadow">🔑</span>
          <div>
            <p className="text-[9px] font-mono font-bold text-amber-300 uppercase">Main Plaza</p>
            <p className="text-[11px] font-bold text-white leading-tight">Honda Keyring</p>
          </div>
        </div>

        {/* 5. 💧 Water Bottle (Orbiting Badge Middle Lower Right) */}
        <div
          onMouseEnter={() => setActiveObject('bottle')}
          onMouseLeave={() => setActiveObject(null)}
          style={{
            transform: `translate3d(${px * 1.3}px, ${py * 0.7}px, 55px)`,
            transition: 'transform 0.15s ease-out'
          }}
          className={`absolute top-1/2 -right-4 sm:-right-7 bg-slate-900/90 hover:bg-slate-900 border ${
            activeObject === 'bottle' ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-sky-500/40'
          } px-2.5 py-1.5 rounded-xl shadow-xl backdrop-blur-xl animate-float-medium flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 z-30`}
        >
          <span className="text-lg filter drop-shadow">💧</span>
          <div>
            <p className="text-[8.5px] font-mono font-bold text-sky-300 uppercase">Sports Complex</p>
            <p className="text-[10px] font-bold text-white">Milton Bottle</p>
          </div>
        </div>

        {/* 6. 👛 Wallet & Canteen (Bottom-Left) */}
        <div
          onMouseEnter={() => setActiveObject('wallet')}
          onMouseLeave={() => setActiveObject(null)}
          style={{
            transform: `translate3d(${px * -0.8}px, ${py * 1.0}px, 65px)`,
            transition: 'transform 0.15s ease-out'
          }}
          className={`absolute -bottom-3 -left-3 sm:-left-5 bg-slate-900/90 hover:bg-slate-900 border ${
            activeObject === 'wallet' ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-rose-500/40'
          } p-2.5 sm:p-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-float-medium flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 z-30`}
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-2xl filter drop-shadow shadow-inner">
            👛
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-rose-300 uppercase">Canteen GF</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
            </div>
            <p className="text-xs font-extrabold text-white leading-tight">WildHorn Wallet</p>
            <p className="text-[10px] text-slate-400 font-mono">Table 5 Window</p>
          </div>
        </div>

        {/* 7. 🪪 Student ID Card & Security Gate Desk (Bottom-Right) */}
        <div
          onMouseEnter={() => setActiveObject('idcard')}
          onMouseLeave={() => setActiveObject(null)}
          style={{
            transform: `translate3d(${px * 0.8}px, ${py * 0.9}px, 70px)`,
            transition: 'transform 0.15s ease-out'
          }}
          className={`absolute -bottom-3 -right-3 sm:-right-5 bg-slate-900/90 hover:bg-slate-900 border ${
            activeObject === 'idcard' ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-emerald-500/40'
          } p-2.5 sm:p-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-float-reverse flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 z-30`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-2xl filter drop-shadow shadow-inner">
            🪪
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-emerald-300 uppercase">Security Desk</span>
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-xs font-extrabold text-white leading-tight">Student ID Card</p>
            <p className="text-[10px] text-slate-400 font-mono">Ref: SEC-2026-0042</p>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div
          style={{ transform: 'translateZ(25px)' }}
          className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] text-slate-300 relative z-30 font-mono"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-slate-400">Match Confidence:</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
              98.4%
            </span>
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_6px_#34d399]" />
            <span>Interactive 3D Engine</span>
          </span>
        </div>
      </div>
    </div>
  );
}
