import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Info,
  Check,
  Navigation,
  Sparkles,
  Layers,
  Building,
  Radio,
  Eye
} from 'lucide-react';

const ZONES = [
  {
    name: 'Dining Tables 1 - 3 (North Wing)',
    code: 'TABLES_NORTH',
    bounds: { xMin: 80, xMax: 550, yMin: 70, yMax: 260 },
    defaultCenter: { x: 310, y: 160 },
    color: '#e0e7ff',
    border: '#818cf8',
    itemCount: '2 items'
  },
  {
    name: 'Dining Tables 4 - 6 (Central Wing)',
    code: 'TABLES_CENTRAL',
    bounds: { xMin: 80, xMax: 550, yMin: 270, yMax: 470 },
    defaultCenter: { x: 310, y: 370 },
    color: '#fef3c7',
    border: '#f59e0b',
    itemCount: '3 items'
  },
  {
    name: 'Food Ordering Counter',
    code: 'COUNTER',
    bounds: { xMin: 650, xMax: 950, yMin: 430, yMax: 590 },
    defaultCenter: { x: 790, y: 510 },
    color: '#dcfce7',
    border: '#22c55e',
    itemCount: '1 item'
  },
  {
    name: 'Beverage & Snack Stall',
    code: 'SNACK_STALL',
    bounds: { xMin: 650, xMax: 950, yMin: 90, yMax: 290 },
    defaultCenter: { x: 800, y: 190 },
    color: '#ffedd5',
    border: '#fb923c',
    itemCount: '1 item'
  },
  {
    name: 'Water Station & Wash Area',
    code: 'WATER_AREA',
    bounds: { xMin: 50, xMax: 260, yMin: 490, yMax: 610 },
    defaultCenter: { x: 150, y: 550 },
    color: '#e0f2fe',
    border: '#38bdf8',
    itemCount: '0 items'
  },
  {
    name: 'Main Entrance & Lobby',
    code: 'ENTRANCE',
    bounds: { xMin: 340, xMax: 620, yMin: 490, yMax: 610 },
    defaultCenter: { x: 480, y: 560 },
    color: '#f3e8ff',
    border: '#c084fc',
    itemCount: '1 item'
  }
];

export default function CampusMap({
  coordinates = { x: 320, y: 380 },
  onChange,
  readOnly = false,
  selectedZone = '',
  onZoneChange
}) {
  const [coords, setCoords] = useState(coordinates || { x: 320, y: 380 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [activeZone, setActiveZone] = useState(selectedZone || 'Dining Tables 4 - 6 (Central Wing)');
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [is3DMode, setIs3DMode] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => {
    if (coordinates && (coordinates.x !== coords.x || coordinates.y !== coords.y)) {
      setCoords(coordinates);
      detectZone(coordinates.x, coordinates.y);
    }
  }, [coordinates]);

  const detectZone = (x, y) => {
    const matched = ZONES.find(
      (z) => x >= z.bounds.xMin && x <= z.bounds.xMax && y >= z.bounds.yMin && y <= z.bounds.yMax
    );
    const zoneName = matched ? matched.name : 'General Canteen Area';
    setActiveZone(zoneName);
    if (onZoneChange) onZoneChange(zoneName);
    return zoneName;
  };

  const updatePin = (svgX, svgY) => {
    // Clamp to floor boundary (50 to 950, 50 to 600)
    const clampedX = Math.max(50, Math.min(950, Math.round(svgX)));
    const clampedY = Math.max(50, Math.min(600, Math.round(svgY)));
    const newCoords = { x: clampedX, y: clampedY };
    setCoords(newCoords);
    detectZone(clampedX, clampedY);
    if (onChange) onChange(newCoords);
  };

  const getSvgCoordinates = (event) => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  };

  const handleSvgClick = (e) => {
    if (readOnly) return;
    const pt = getSvgCoordinates(e);
    if (pt) updatePin(pt.x, pt.y);
  };

  const handlePointerDown = (e) => {
    if (readOnly) return;
    e.stopPropagation();
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || readOnly) return;
    const pt = getSvgCoordinates(e);
    if (pt) updatePin(pt.x, pt.y);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleZoneButtonClick = (zone) => {
    if (readOnly) return;
    updatePin(zone.defaultCenter.x, zone.defaultCenter.y);
    setActiveZone(zone.name);
    if (onZoneChange) onZoneChange(zone.name);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xl transition-all duration-300">
      {/* Map Control Header */}
      <div className="p-4 bg-gradient-to-r from-[#030712] via-slate-900 to-[#0f172a] text-white flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-cyan-400 border border-indigo-400/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-cyan-300 block">
                3D SPATIAL CAMPUS RADAR
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
              Campus Canteen & Incident Spatial Grid — Ground Floor
            </h4>
          </div>
        </div>

        {/* View Controls & 3D Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* 3D Isometric View Mode Toggle */}
          <button
            type="button"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              is3DMode
                ? 'bg-indigo-600/40 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{is3DMode ? '3D Isometric' : '2D Top-Down'}</span>
          </button>

          {/* Zoom and Reset Controls */}
          <div className="flex items-center gap-1 bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setZoom(Math.min(1.3, zoom + 0.1))}
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-cyan-300 px-1.5">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.max(0.85, zoom - 0.1))}
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors ml-1 cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container with 3D Depth Isometric Perspective */}
      <div
        className="relative bg-slate-950 overflow-hidden flex items-center justify-center min-h-[420px] p-6 select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Subtle Background Animated Glows in 3D Stage */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

        {/* 3D Isometric View Wrapper */}
        <div
          style={{
            transform: is3DMode
              ? `perspective(1000px) rotateX(24deg) rotateZ(-3deg) scale(${zoom * 0.96})`
              : `scale(${zoom})`,
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="relative py-4"
        >
          {/* Floor Shadow for Isometric Elevation */}
          {is3DMode && (
            <div className="absolute inset-x-8 -bottom-4 h-12 bg-black/60 blur-xl rounded-full pointer-events-none transform translate-y-4" />
          )}

          <svg
            ref={svgRef}
            viewBox="0 0 1000 650"
            className={`w-[680px] sm:w-[840px] md:w-[940px] h-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] rounded-3xl bg-[#090e1e] border border-indigo-500/30 ${
              readOnly ? 'cursor-default' : 'cursor-crosshair'
            }`}
            onClick={handleSvgClick}
          >
            {/* Grid Pattern and Gradient Definitions */}
            <defs>
              <pattern id="campus3DGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.25" />
              </pattern>
              <linearGradient id="wallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="northBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="centralBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2e1065" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="counterBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="snackBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7c2d12" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#431407" stopOpacity="0.95" />
              </linearGradient>
              <radialGradient id="pinGlowWave" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
              <filter id="isometricShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Floor tile grid */}
            <rect x="20" y="20" width="960" height="610" fill="url(#campus3DGrid)" rx="16" />

            {/* Outer Perimeter Glass Wall with 3D Bevel Outline */}
            <rect
              x="20"
              y="20"
              width="960"
              height="610"
              fill="none"
              stroke="url(#wallGradient)"
              strokeWidth="6"
              rx="16"
            />

            {/* =========================================================================
                3D ISOMETRIC BUILDING SECTORS & ZONES
            ========================================================================= */}

            {/* North Wing Tables Zone */}
            <g
              onMouseEnter={() => setHoveredBuilding('north')}
              onMouseLeave={() => setHoveredBuilding(null)}
              className="transition-all cursor-pointer group"
            >
              {/* 3D Extruded Base Shadow */}
              <rect
                x="60"
                y="54"
                width="510"
                height="200"
                rx="14"
                fill="#000000"
                fillOpacity="0.5"
              />
              <rect
                x="60"
                y={hoveredBuilding === 'north' ? "46" : "50"}
                width="510"
                height="200"
                rx="14"
                fill="url(#northBuildingGrad)"
                stroke={hoveredBuilding === 'north' ? "#38bdf8" : "#818cf8"}
                strokeWidth={hoveredBuilding === 'north' ? "2.5" : "1.5"}
                filter="url(#isometricShadow)"
                className="transition-all duration-200"
              />
              <text x="80" y={hoveredBuilding === 'north' ? "74" : "78"} fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="0.8" fontFamily="monospace">
                NORTH DINING WING (Tables 1 - 3)
              </text>
              <circle cx="540" cy={hoveredBuilding === 'north' ? "70" : "74"} r="4" fill="#38bdf8" className="animate-pulse" />
            </g>

            {/* Central Wing Tables Zone */}
            <g
              onMouseEnter={() => setHoveredBuilding('central')}
              onMouseLeave={() => setHoveredBuilding(null)}
              className="transition-all cursor-pointer group"
            >
              <rect
                x="60"
                y="274"
                width="510"
                height="190"
                rx="14"
                fill="#000000"
                fillOpacity="0.5"
              />
              <rect
                x="60"
                y={hoveredBuilding === 'central' ? "266" : "270"}
                width="510"
                height="190"
                rx="14"
                fill="url(#centralBuildingGrad)"
                stroke={hoveredBuilding === 'central' ? "#c084fc" : "#a855f7"}
                strokeWidth={hoveredBuilding === 'central' ? "2.5" : "1.5"}
                filter="url(#isometricShadow)"
                className="transition-all duration-200"
              />
              <text x="80" y={hoveredBuilding === 'central' ? "294" : "298"} fill="#d8b4fe" fontSize="12" fontWeight="bold" letterSpacing="0.8" fontFamily="monospace">
                CENTRAL DINING WING (Tables 4 - 6)
              </text>
              <circle cx="540" cy={hoveredBuilding === 'central' ? "290" : "294"} r="4" fill="#c084fc" className="animate-pulse" />
            </g>

            {/* Snack & Beverage Stall */}
            <g
              onMouseEnter={() => setHoveredBuilding('snack')}
              onMouseLeave={() => setHoveredBuilding(null)}
              className="transition-all cursor-pointer group"
            >
              <rect
                x="650"
                y="54"
                width="310"
                height="230"
                rx="14"
                fill="#000000"
                fillOpacity="0.5"
              />
              <rect
                x="650"
                y={hoveredBuilding === 'snack' ? "46" : "50"}
                width="310"
                height="230"
                rx="14"
                fill="url(#snackBuildingGrad)"
                stroke={hoveredBuilding === 'snack' ? "#fb923c" : "#ea580c"}
                strokeWidth={hoveredBuilding === 'snack' ? "2.5" : "1.8"}
                filter="url(#isometricShadow)"
                className="transition-all duration-200"
              />
              <rect x="660" y={hoveredBuilding === 'snack' ? "56" : "60"} width="290" height="28" fill="#c2410c" rx="6" />
              <text x="680" y={hoveredBuilding === 'snack' ? "75" : "79"} fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">
                BEVERAGE & SNACK STALL
              </text>
              <circle cx="730" cy="160" r="20" fill="#431407" stroke="#ea580c" strokeWidth="2" />
              <text x="718" y="164" fontSize="11" fontWeight="bold" fill="#fdba74">Tea</text>
              <circle cx="810" cy="160" r="20" fill="#431407" stroke="#ea580c" strokeWidth="2" />
              <text x="793" y="164" fontSize="11" fontWeight="bold" fill="#fdba74">Snacks</text>
              <circle cx="890" cy="160" r="20" fill="#431407" stroke="#ea580c" strokeWidth="2" />
              <text x="874" y="164" fontSize="11" fontWeight="bold" fill="#fdba74">Juice</text>
            </g>

            {/* Food Ordering Counter */}
            <g
              onMouseEnter={() => setHoveredBuilding('counter')}
              onMouseLeave={() => setHoveredBuilding(null)}
              className="transition-all cursor-pointer group"
            >
              <rect
                x="650"
                y="324"
                width="310"
                height="280"
                rx="14"
                fill="#000000"
                fillOpacity="0.5"
              />
              <rect
                x="650"
                y={hoveredBuilding === 'counter' ? "316" : "320"}
                width="310"
                height="280"
                rx="14"
                fill="url(#counterBuildingGrad)"
                stroke={hoveredBuilding === 'counter' ? "#34d399" : "#059669"}
                strokeWidth={hoveredBuilding === 'counter' ? "2.5" : "1.8"}
                filter="url(#isometricShadow)"
                className="transition-all duration-200"
              />
              <rect x="660" y={hoveredBuilding === 'counter' ? "326" : "330"} width="290" height="30" fill="#047857" rx="6" />
              <text x="675" y={hoveredBuilding === 'counter' ? "347" : "351"} fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace">
                FOOD BILLING & TOKEN COUNTERS
              </text>

              {/* Counter Stations */}
              <rect x="670" y="380" width="75" height="38" fill="#064e3b" stroke="#10b981" rx="4" />
              <text x="684" y="404" fontSize="10" fontWeight="bold" fill="#a7f3d0">Reg 1</text>

              <rect x="765" y="380" width="75" height="38" fill="#064e3b" stroke="#10b981" rx="4" />
              <text x="779" y="404" fontSize="10" fontWeight="bold" fill="#a7f3d0">Reg 2</text>

              <rect x="860" y="380" width="75" height="38" fill="#064e3b" stroke="#10b981" rx="4" />
              <text x="872" y="404" fontSize="10" fontWeight="bold" fill="#a7f3d0">Tokens</text>

              {/* Queue Barricades */}
              <line x1="680" y1="440" x2="680" y2="530" stroke="#059669" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="770" y1="440" x2="770" y2="530" stroke="#059669" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="860" y1="440" x2="860" y2="530" stroke="#059669" strokeWidth="2.5" strokeDasharray="5 3" />
              <text x="730" y="555" fontSize="10" fill="#6ee7b7" fontWeight="bold" fontFamily="monospace">Order Queue Zone</text>
            </g>

            {/* Water Station & Wash Area */}
            <g>
              <rect
                x="50"
                y="480"
                width="210"
                height="140"
                rx="12"
                fill="#082f49"
                stroke="#0284c7"
                strokeWidth="1.5"
                filter="url(#isometricShadow)"
              />
              <rect x="60" y="490" width="190" height="24" fill="#0369a1" rx="4" />
              <text x="72" y="506" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">
                WATER & WASH BASINS
              </text>
              <circle cx="100" cy="560" r="16" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="90" y="564" fontSize="9" fontWeight="bold" fill="#bae6fd">Disp 1</text>
              <circle cx="160" cy="560" r="16" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="150" y="564" fontSize="9" fontWeight="bold" fill="#bae6fd">Disp 2</text>
              <circle cx="215" cy="560" r="16" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="204" y="564" fontSize="9" fontWeight="bold" fill="#bae6fd">Wash</text>
            </g>

            {/* Main Entrance Foyer */}
            <g>
              <rect
                x="330"
                y="500"
                width="260"
                height="125"
                rx="10"
                fill="#2e1065"
                stroke="#9333ea"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                filter="url(#isometricShadow)"
              />
              <text x="370" y="535" fill="#e9d5ff" fontSize="12" fontWeight="bold" fontFamily="monospace">
                MAIN CAMPUS ENTRANCE
              </text>
              <path d="M 460 590 L 460 550 M 450 560 L 460 545 L 470 560" stroke="#c084fc" strokeWidth="3" fill="none" strokeLinecap="round" />
              <text x="405" y="610" fontSize="10" fill="#d8b4fe" fontWeight="bold" fontFamily="monospace">
                ← PLAZA INFLOW →
              </text>
            </g>

            {/* 3D DINING TABLES (North Wing) */}
            {/* Table 1 */}
            <g className="cursor-pointer group">
              <circle cx="150" cy="160" r="36" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" filter="url(#isometricShadow)" />
              <circle cx="150" cy="108" r="10" fill="#0284c7" />
              <circle cx="150" cy="212" r="10" fill="#0284c7" />
              <circle cx="98" cy="160" r="10" fill="#0284c7" />
              <circle cx="202" cy="160" r="10" fill="#0284c7" />
              <text x="132" y="164" fontSize="11" fontWeight="bold" fill="#e0f2fe" fontFamily="monospace">T-1</text>
            </g>

            {/* Table 2 */}
            <g className="cursor-pointer group">
              <circle cx="310" cy="160" r="36" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" filter="url(#isometricShadow)" />
              <circle cx="310" cy="108" r="10" fill="#0284c7" />
              <circle cx="310" cy="212" r="10" fill="#0284c7" />
              <circle cx="258" cy="160" r="10" fill="#0284c7" />
              <circle cx="362" cy="160" r="10" fill="#0284c7" />
              <text x="292" y="164" fontSize="11" fontWeight="bold" fill="#e0f2fe" fontFamily="monospace">T-2</text>
            </g>

            {/* Table 3 */}
            <g className="cursor-pointer group">
              <circle cx="470" cy="160" r="36" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" filter="url(#isometricShadow)" />
              <circle cx="470" cy="108" r="10" fill="#0284c7" />
              <circle cx="470" cy="212" r="10" fill="#0284c7" />
              <circle cx="418" cy="160" r="10" fill="#0284c7" />
              <circle cx="522" cy="160" r="10" fill="#0284c7" />
              <text x="452" y="164" fontSize="11" fontWeight="bold" fill="#e0f2fe" fontFamily="monospace">T-3</text>
            </g>

            {/* 3D DINING TABLES (Central Wing) */}
            {/* Table 4 */}
            <g className="cursor-pointer group">
              <circle cx="150" cy="370" r="36" fill="#1e293b" stroke="#c084fc" strokeWidth="2.5" filter="url(#isometricShadow)" />
              <circle cx="150" cy="318" r="10" fill="#7c3aed" />
              <circle cx="150" cy="422" r="10" fill="#7c3aed" />
              <circle cx="98" cy="370" r="10" fill="#7c3aed" />
              <circle cx="202" cy="370" r="10" fill="#7c3aed" />
              <text x="132" y="374" fontSize="11" fontWeight="bold" fill="#f3e8ff" fontFamily="monospace">T-4</text>
            </g>

            {/* Table 5 */}
            <g className="cursor-pointer group">
              <circle cx="310" cy="370" r="36" fill="#1e293b" stroke="#c084fc" strokeWidth="2.5" filter="url(#isometricShadow)" />
              <circle cx="310" cy="318" r="10" fill="#7c3aed" />
              <circle cx="310" cy="422" r="10" fill="#7c3aed" />
              <circle cx="258" cy="370" r="10" fill="#7c3aed" />
              <circle cx="362" cy="370" r="10" fill="#7c3aed" />
              <text x="292" y="374" fontSize="11" fontWeight="bold" fill="#f3e8ff" fontFamily="monospace">T-5</text>
            </g>

            {/* Table 6 */}
            <g className="cursor-pointer group">
              <circle cx="470" cy="370" r="36" fill="#1e293b" stroke="#c084fc" strokeWidth="2.5" filter="url(#isometricShadow)" />
              <circle cx="470" cy="318" r="10" fill="#7c3aed" />
              <circle cx="470" cy="422" r="10" fill="#7c3aed" />
              <circle cx="418" cy="370" r="10" fill="#7c3aed" />
              <circle cx="522" cy="370" r="10" fill="#7c3aed" />
              <text x="452" y="374" fontSize="11" fontWeight="bold" fill="#f3e8ff" fontFamily="monospace">T-6</text>
            </g>

            {/* Tray Return Station */}
            <rect x="20" y="310" width="20" height="90" fill="#334155" rx="4" />
            <text
              transform="rotate(-90 28 355)"
              x="28"
              y="355"
              fill="#94a3b8"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              TRAY RETURN
            </text>

            {/* THE 3D ANIMATED INCIDENT PIN */}
            {coords && coords.x != null && coords.y != null && (
              <g
                transform={`translate(${coords.x}, ${coords.y})`}
                onPointerDown={handlePointerDown}
                className={readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
              >
                {/* Outward Scanning Radar Pulse Wave */}
                <circle cx="0" cy="0" r="42" fill="url(#pinGlowWave)" className="animate-ping" opacity="0.75" />
                <circle cx="0" cy="0" r="28" fill="#38bdf8" opacity="0.2" className="animate-pulse" />
                <circle cx="0" cy="0" r="8" fill="#22d3ee" className="shadow-[0_0_8px_#22d3ee]" />

                {/* 3D Vertical Floating Needle */}
                <path
                  d="M 0 0 C -10 -12 -14 -24 0 -42 C 14 -24 10 -12 0 0 Z"
                  fill="url(#snackBuildingGrad)"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  filter="drop-shadow(0px 8px 12px rgba(239,68,68,0.5))"
                />
                <circle cx="0" cy="-24" r="6" fill="#ffffff" />
                <circle cx="0" cy="-24" r="3" fill="#ef4444" />

                {/* Floating 3D Badge Above Pin */}
                <rect x="-65" y="-68" width="130" height="22" rx="6" fill="#020617" stroke="#38bdf8" strokeWidth="1" opacity="0.95" />
                <text x="0" y="-53" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {readOnly ? 'Pinned Location' : 'Drag or Click Point'}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Zone Quick-Selector & Coordinates Status Bar */}
      <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Identified Campus Zone:
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {activeZone}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce-soft" />
            <span>X: {coords.x}</span>
            <span className="text-slate-400">|</span>
            <span>Y: {coords.y}</span>
          </div>
        </div>

        {/* Predefined Zone Selector Buttons */}
        {!readOnly && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
              Quick Snap to Predefined Campus Zone:
            </p>
            <div className="flex flex-wrap gap-2">
              {ZONES.map((zone) => (
                <button
                  key={zone.code}
                  type="button"
                  onClick={() => handleZoneButtonClick(zone)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeZone === zone.name
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm ring-2 ring-indigo-500/30'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {zone.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        )}

        {!readOnly && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              Tip: Click anywhere on the 3D isometric floor plan or drag the red coordinate pin to precisely mark the incident location.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
