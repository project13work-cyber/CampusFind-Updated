import React from 'react';
import { CheckCircle2, Clock, Search, Sparkles, ShieldCheck, AlertCircle, Archive } from 'lucide-react';

const STATUS_CONFIGS = {
  REPORTED: {
    label: 'Reported',
    bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500',
    icon: Clock
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
    icon: Clock
  },
  APPROVED: {
    label: 'Verified Report',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    dot: 'bg-indigo-500',
    icon: ShieldCheck
  },
  SEARCHING: {
    label: 'Actively Searching',
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    dot: 'bg-cyan-500',
    icon: Search
  },
  MATCH_FOUND: {
    label: 'Possible Match Found!',
    bg: 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-300 font-bold shadow-sm shadow-purple-500/10 animate-pulse-subtle',
    dot: 'bg-purple-500',
    icon: Sparkles
  },
  MATCHING: {
    label: 'Match Detected',
    bg: 'bg-purple-50 text-purple-700 border-purple-200/80 font-medium',
    dot: 'bg-purple-500',
    icon: Sparkles
  },
  CLAIM_PENDING: {
    label: 'Claim Under Review',
    bg: 'bg-orange-50 text-orange-700 border-orange-200/80',
    dot: 'bg-orange-500',
    icon: Clock
  },
  CLAIM_APPROVED: {
    label: 'Claim Approved — Ready for Pickup',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300/90 font-bold shadow-sm shadow-emerald-500/10',
    dot: 'bg-emerald-500',
    icon: CheckCircle2
  },
  RETURNED: {
    label: 'Handed Over & Returned',
    bg: 'bg-teal-50 text-teal-800 border-teal-300 font-bold shadow-sm shadow-teal-500/10',
    dot: 'bg-teal-500',
    icon: CheckCircle2
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: Archive
  },
  REJECTED: {
    label: 'Claim Rejected',
    bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
    icon: AlertCircle
  }
};

export default function StatusBadge({ status, className = '', showIcon = true }) {
  const config = STATUS_CONFIGS[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-normal shadow-xs transition-all ${config.bg} ${className}`}
    >
      {showIcon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      )}
      <span className="truncate">{config.label}</span>
    </span>
  );
}
