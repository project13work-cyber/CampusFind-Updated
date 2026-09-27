import React from 'react';
import { Sparkles, ArrowRight, PackageSearch, MapPin, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * EmptyState with 3D floating lost-and-found radar animation
 */
export default function EmptyState({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'There are no records matching your query right now.',
  actionText,
  actionLink,
  onActionClick,
  variant = 'default', // 'default', 'lost', 'found', 'match'
  className = '',
}) {
  const iconBg = {
    default: 'from-indigo-500/20 via-violet-500/20 to-cyan-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    lost: 'from-rose-500/20 via-orange-500/20 to-amber-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
    found: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    match: 'from-purple-500/20 via-indigo-500/20 to-violet-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  }[variant];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-premium max-w-md mx-auto my-6 relative overflow-hidden group ${className}`}>
      {/* 3D Floating Lost-and-Found Object & Rotating Search Ring */}
      <div className="relative w-24 h-24 mx-auto mb-5 flex items-center justify-center">
        {/* Soft Ambient Radial Background Glow */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/15 blur-xl pointer-events-none animate-pulse-subtle" />

        {/* Orbiting Rotating Search Ring */}
        <div className="absolute inset-1 rounded-full border border-dashed border-indigo-400/40 animate-spin-slow pointer-events-none" />

        {/* Floating 3D Core Icon Container */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${iconBg} border flex items-center justify-center shadow-lg shadow-indigo-950/10 dark:shadow-black/40 animate-float-medium relative z-10 group-hover:scale-105 transition-transform duration-300 backdrop-blur-md`}>
          <Icon className="w-8 h-8 filter drop-shadow" />

          {/* Micro Floating Map Pin */}
          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-cyan-500/90 text-white flex items-center justify-center text-[10px] shadow-md border border-white/40 animate-float-reverse">
            📍
          </span>
        </div>
      </div>

      <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1.5 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">
        {description}
      </p>

      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}

      {actionText && onActionClick && !actionLink && (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
