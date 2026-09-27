import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ItemCard from '../components/items/ItemCard';
import ClaimModal from '../components/claims/ClaimModal';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import CampusMap from '../components/map/CampusMap';
import HeroSpatialScene from '../components/home/HeroSpatialScene';
import {
  Search,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Lock,
  Building,
  Smartphone,
  CheckCircle2,
  Zap,
  ChevronRight,
  Compass,
  Layers,
  Radio,
  Eye,
  Bell,
  ShieldAlert,
  Camera,
  CheckCircle,
  HelpCircle,
  Users,
  Award,
  ArrowUpRight,
  KeyRound,
  Shield,
  Fingerprint,
  Loader2,
  Handshake,
  PackageSearch
} from 'lucide-react';

/**
 * 3D Interactive Card Component with Spring-like tilt & depth
 */
function TiltCard({ children, className = '', glowColor = 'indigo' }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const glowStyles = {
    indigo: 'hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.25)]',
    purple: 'hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-[0_15px_30px_-5px_rgba(168,85,247,0.25)]',
    cyan: 'hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-[0_15px_30px_-5px_rgba(6,182,212,0.25)]',
    emerald: 'hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.25)]',
    rose: 'hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-[0_15px_30px_-5px_rgba(244,63,94,0.25)]',
  }[glowColor] || '';

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${isHovered ? -6 : 0}px)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`transition-all duration-300 ${glowStyles} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalLost: 124,
    totalFound: 87,
    possibleMatches: 62,
    itemsReturned: 49
  });

  // Animated metric counters
  const [animatedStats, setAnimatedStats] = useState({
    totalLost: 0,
    totalFound: 0,
    possibleMatches: 0,
    itemsReturned: 0
  });

  const [recentFound, setRecentFound] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick search hero input & scanning animation state
  const [heroSearch, setHeroSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Claim modal state
  const [selectedFoundItem, setSelectedFoundItem] = useState(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  // 3D Parallax Mouse Tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rawX: 0, rawY: 0 });
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        rawX: e.clientX,
        rawY: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection Observer for Scroll Triggered Stats Counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Fetch recent found items
        const foundRes = await api.getFound('status=REPORTED&status=APPROVED&status=MATCHING');
        if (foundRes.success) {
          setRecentFound(foundRes.items?.slice(0, 6) || []);
        }

        // Fetch counts from search
        const searchLost = await api.getLost();
        const searchFound = await api.getFound();
        const lostCount = searchLost.items?.length || 0;
        const foundCount = searchFound.items?.length || 0;

        // If authenticated, fetch user's matches
        let matchCount = 3;
        if (isAuthenticated) {
          const matchRes = await api.getMatches('minScore=70');
          if (matchRes.success) {
            setUserMatches(matchRes.matches || []);
            matchCount = matchRes.matches?.length || 0;
          }
        }

        const targetStats = {
          totalLost: lostCount || 124,
          totalFound: foundCount || 87,
          possibleMatches: matchCount || 62,
          itemsReturned: 49
        };

        setStats(targetStats);

        // Counter Animation with Smooth Easing
        let start = 0;
        const duration = 1400;
        const steps = 35;
        const intervalTime = duration / steps;

        const timer = setInterval(() => {
          start++;
          const progress = Math.min(1, start / steps);
          const easeOutQuad = (t) => t * (2 - t);
          const eased = easeOutQuad(progress);

          setAnimatedStats({
            totalLost: Math.round(eased * targetStats.totalLost),
            totalFound: Math.round(eased * targetStats.totalFound),
            possibleMatches: Math.round(eased * targetStats.possibleMatches),
            itemsReturned: Math.round(eased * targetStats.itemsReturned)
          });

          if (progress >= 1) clearInterval(timer);
        }, intervalTime);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [isAuthenticated]);

  const handleClaim = (item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedFoundItem(item);
    setClaimModalOpen(true);
  };

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    setIsScanning(true);

    // 1.2s premium scan wave animation sequence
    setTimeout(() => {
      setIsScanning(false);
      if (heroSearch.trim()) {
        navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
      } else {
        navigate('/search');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-24 overflow-x-hidden">
      {/* ==================================================
          1. HERO SECTION — MAIN 3D SPATIAL MATCHING ARENA
      ================================================== */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-b from-[#020617] via-[#090e1e] to-[#0f172a] text-white pt-16 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-indigo-500/15"
      >
        {/* Subtle Ambient Parallax Glows & Grid Mesh */}
        <div
          style={{
            transform: `translate3d(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px, 0px)`
          }}
          className="absolute inset-0 bg-[radial-gradient(#4f46e5_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-25 pointer-events-none transition-transform duration-300 ease-out"
        />
        <div
          style={{
            transform: `translate3d(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px, 0px)`
          }}
          className="absolute top-10 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/25 blur-[120px] pointer-events-none animate-pulse-subtle transition-transform duration-300 ease-out"
        />
        <div
          style={{
            transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0px)`
          }}
          className="absolute top-1/4 -right-32 w-[550px] h-[550px] rounded-full bg-cyan-500/20 blur-[130px] pointer-events-none animate-pulse-subtle transition-transform duration-300 ease-out"
        />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[350px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading, Supporting Text, Search & Dual CTAs */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left z-10">
              {/* Campus Technology Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-xs font-bold backdrop-blur-xl shadow-inner hover:scale-105 transition-transform duration-200">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                </span>
                <span className="tracking-wide">Official College Lost & Found System</span>
              </div>

              {/* Main Explosive Heading */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
                  Lost something on campus?
                </h1>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-300">
                  Let's find it.
                </h2>
              </div>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-normal">
                A smarter way to report, discover, match, and recover lost belongings across your college campus with automated similarity detection.
              </p>

              {/* Hero Search Bar with Scanning Radar Wave */}
              <form onSubmit={handleHeroSearchSubmit} className="max-w-xl mx-auto lg:mx-0 relative">
                <div
                  className={`relative flex items-center bg-white/10 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl border ${
                    isScanning ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'border-white/20'
                  } p-2 shadow-2xl focus-within:border-cyan-400 focus-within:bg-white/15 transition-all duration-300 overflow-hidden`}
                >
                  {/* Outward Scanning Radar Pulse Wave when Active */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent animate-shimmer pointer-events-none" />
                  )}

                  <Search
                    className={`w-5 h-5 ml-3.5 shrink-0 transition-colors duration-300 ${
                      isScanning ? 'text-cyan-300 animate-pulse' : 'text-slate-300'
                    }`}
                  />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search by keyword, e.g. 'WildHorn wallet', 'Boat earphones', 'Casio calculator'..."
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isScanning}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                        <span className="font-mono text-cyan-100">Scanning campus...</span>
                      </>
                    ) : (
                      <span>Search</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Primary Dual CTAs & Browse Link */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
                <Link
                  to="/report-lost"
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs sm:text-sm font-bold shadow-xl shadow-rose-900/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 border border-rose-400/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report Lost Item</span>
                </Link>

                <Link
                  to="/report-found"
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-900/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 border border-emerald-400/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report Found Item</span>
                </Link>

                <Link
                  to="/search"
                  className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 backdrop-blur-xl"
                >
                  <Search className="w-4 h-4 text-cyan-300" />
                  <span>Explore Catalog</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Security & Platform Trust Marks */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-3 text-xs text-slate-300 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Campus Security Desk Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>7-Factor Match Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Protected Private Identifiers</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Spatial Matching Scene */}
            <div className="lg:col-span-5 relative flex items-center justify-center py-8 lg:py-4">
              <HeroSpatialScene mousePos={mousePos} />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. RECOVERY LIFECYCLE CARDS (3D TILT INTERACTION)
      ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-16 relative z-20">
        <div className="bg-white dark:bg-slate-900/95 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Campus Recovery Lifecycle
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              From Report to Safe Return in 4 Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Step 1: Reported */}
            <TiltCard
              glowColor="indigo"
              className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-default group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  📦
                </div>
                <span className="text-xs font-mono font-extrabold text-slate-400 dark:text-slate-500">STAGE 01</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                Reported
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Log lost or found items with photos, specs, and precise campus floor plan coordinates.
              </p>
            </TiltCard>

            {/* Step 2: Searching & Matching */}
            <TiltCard
              glowColor="purple"
              className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-default group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  🔍
                </div>
                <span className="text-xs font-mono font-extrabold text-slate-400 dark:text-slate-500">STAGE 02</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                Searching & Matching
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated similarity algorithm calculates weighted scores (0–100%) across categories, dates, and locations.
              </p>
            </TiltCard>

            {/* Step 3: Verified Claim */}
            <TiltCard
              glowColor="cyan"
              className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-default group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  ✨
                </div>
                <span className="text-xs font-mono font-extrabold text-cyan-500 font-bold">96% MATCH</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                Verified Claims
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Claimant answers 3 private questions evaluated against secret markings logged with the item.
              </p>
            </TiltCard>

            {/* Step 4: Handover at Desk */}
            <TiltCard
              glowColor="emerald"
              className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 cursor-default group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  🎉
                </div>
                <span className="text-xs font-mono font-extrabold text-emerald-500 font-bold">RETURNED</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                Handover at Desk
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Campus Security Gate 1 finalizes the physical handover with student ID confirmation.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. STATISTICS SECTION (MICRO-INTERACTIONS & 3D TILT)
      ================================================== */}
      <section ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Lost Reports */}
          <TiltCard
            glowColor="rose"
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium flex items-center gap-4 group cursor-default"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-rose-500/10 rounded-2xl blur-sm group-hover:opacity-100 opacity-0 transition-opacity" />
              <TrendingUp className="w-7 h-7 relative z-10" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lost Reports</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{animatedStats.totalLost}</p>
            </div>
          </TiltCard>

          {/* Found Items */}
          <TiltCard
            glowColor="emerald"
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium flex items-center gap-4 group cursor-default"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-sm group-hover:opacity-100 opacity-0 transition-opacity" />
              <FileCheck2 className="w-7 h-7 relative z-10" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Found Items</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{animatedStats.totalFound}</p>
            </div>
          </TiltCard>

          {/* Matches Found */}
          <TiltCard
            glowColor="purple"
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium flex items-center gap-4 group cursor-default"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-sm group-hover:opacity-100 opacity-0 transition-opacity" />
              <Sparkles className="w-7 h-7 relative z-10" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Matches Found</p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{animatedStats.possibleMatches}</p>
            </div>
          </TiltCard>

          {/* Items Returned */}
          <TiltCard
            glowColor="cyan"
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium flex items-center gap-4 group cursor-default"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-sm group-hover:opacity-100 opacity-0 transition-opacity" />
              <ShieldCheck className="w-7 h-7 relative z-10" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Items Returned</p>
              <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">{animatedStats.itemsReturned}</p>
            </div>
          </TiltCard>
        </div>

        {/* Potential Match Identified Banner for Logged-In User */}
        {isAuthenticated && userMatches.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-7 text-white shadow-2xl border border-purple-500/40">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/30 text-purple-300 flex items-center justify-center shrink-0 shadow-inner">
                  <Sparkles className="w-7 h-7 animate-pulse text-purple-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-500/40 text-purple-200 text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full border border-purple-400/30">
                      Similarity Match Found
                    </span>
                    <span className="text-xs text-indigo-300 font-bold">
                      Confidence: {userMatches[0].score}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    A recently found belonging matches your lost report!
                  </h3>
                  <p className="text-xs text-purple-200 mt-0.5">
                    Discovered at {userMatches[0].foundItemId?.locationName}. Review matching specs and file your ownership claim.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                <Link
                  to="/my-reports"
                  className="w-full md:w-auto text-center px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all"
                >
                  View Match Details →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================
          4. RECENTLY FOUND ITEMS LIVE FEED
      ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Live Campus Deposited Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Recently Found Belongings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Safely reported by students and stored with campus security desks
            </p>
          </div>
          <Link
            to="/search?type=found"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>Browse all found items</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={3} />
          </div>
        ) : recentFound.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No Found Items Reported Yet"
            description="When students deposit found items, they will appear in this real-time campus catalog."
            actionText="Report a Found Item"
            actionLink="/report-found"
            variant="found"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFound.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                type="FOUND"
                onClaimClick={handleClaim}
              />
            ))}
          </div>
        )}
      </section>

      {/* ==================================================
          5. SPATIAL CAMPUS MAP SECTION (3D UPGRADE)
      ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Spatial Campus Navigation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Pinpoint Incident Zones & Coordinates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Lost something at the Food Court or Library? Mark exact table coordinates on the digital floor plan to boost similarity match probability.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shrink-0 shadow-sm"
          >
            <span>Explore Map Zones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <CampusMap coordinates={{ x: 310, y: 370 }} readOnly={false} />
      </section>

      {/* ==================================================
          6. HOW CAMPUSFIND WORKS (4 VALUE CARDS WITH 3D TILT)
      ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-premium">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Engineered for College Campuses
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              How CampusFind Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              From loss incident reporting to verified physical handover at campus security gates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 01 */}
            <TiltCard
              glowColor="indigo"
              className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm cursor-default group"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-sm font-mono font-black text-slate-400 dark:text-slate-500">01</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">01 — Report</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Report lost or found belongings with specifications, photos, and precise campus zone pin coordinates.
              </p>
            </TiltCard>

            {/* Card 02 */}
            <TiltCard
              glowColor="purple"
              className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm cursor-default group"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-sm font-mono font-black text-slate-400 dark:text-slate-500">02</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">02 — Match</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                7-factor similarity matrix automatically scores matches between lost reports and deposited found belongings.
              </p>
            </TiltCard>

            {/* Card 03 */}
            <TiltCard
              glowColor="cyan"
              className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm cursor-default group"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-sm font-mono font-black text-slate-400 dark:text-slate-500">03</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">03 — Verify</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ownership questionnaire verifies claimant identity against secret private markings without public disclosure.
              </p>
            </TiltCard>

            {/* Card 04 */}
            <TiltCard
              glowColor="emerald"
              className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm cursor-default group"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-mono font-black text-slate-400 dark:text-slate-500">04</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">04 — Recover</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Complete verified pickup at Security Gate 1 with official reference number and physical ID confirmation.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. SAFE OWNERSHIP VERIFICATION PROTOCOL
      ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-[#020617] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Security Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Safe Ownership Verification Protocol
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Multi-layered verification guarantees items are returned only to their authentic student owners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            <TiltCard
              glowColor="emerald"
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 space-y-3 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Private Identifiers</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Secret stickers, internal contents, or scratches are encrypted and hidden from the public catalog.
              </p>
            </TiltCard>

            <TiltCard
              glowColor="indigo"
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 space-y-3 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Security Desk Custody</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                High-value items are safekept at Gate 1 with official reference numbers (e.g. SEC-2026-0042).
              </p>
            </TiltCard>

            <TiltCard
              glowColor="cyan"
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 space-y-3 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/30 text-cyan-300 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">3-Question Proof</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Claimants must describe matching private details and display their student ID upon collection.
              </p>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ==================================================
          8. FINAL CALL TO ACTION
      ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-r from-indigo-900 via-violet-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-2xl border border-indigo-500/30 text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Help something find its way home.
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-lg mx-auto">
              Join students and faculty across campus to report, track, and recover lost belongings with ease.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <Link
                to="/report-lost"
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs sm:text-sm font-bold shadow-xl shadow-rose-950/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Lost Item</span>
              </Link>

              <Link
                to="/report-found"
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-950/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Found Item</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        item={selectedFoundItem}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={() => {
          navigate('/my-reports');
        }}
      />
    </div>
  );
}
