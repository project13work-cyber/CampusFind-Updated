import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { MapPin, Calendar, Clock, Tag, ArrowRight, ShieldCheck, Handshake, Sparkles } from 'lucide-react';

export default function ItemCard({ item, type = 'LOST', onClaimClick }) {
  const isLost = type === 'LOST' || item.reportType === 'LOST';
  const itemDate = item.lostDate || item.foundDate || item.itemDate || item.createdAt;

  const defaultImage = isLost
    ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';

  const displayImage = item.images && item.images.length > 0 ? item.images[0] : defaultImage;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-premium-hover dark:hover:shadow-2xl transition-all duration-300 flex flex-col group hover:-translate-y-1 relative">
      {/* Top Media Container */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={displayImage}
          alt={item.itemName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />

        {/* Gradient Overlay on Bottom of Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/10 pointer-events-none" />

        {/* Type Badge (LOST / FOUND) */}
        <div className="absolute top-3.5 left-3.5">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-sm backdrop-blur-md ${
              isLost
                ? 'bg-rose-600/90 text-white border border-rose-400/30'
                : 'bg-emerald-600/90 text-white border border-emerald-400/30'
            }`}
          >
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3.5 right-3.5">
          <StatusBadge status={item.status} className="shadow-sm backdrop-blur-md bg-white/95 dark:bg-slate-900/95" />
        </div>

        {/* Current Custody Badge if Security Office */}
        {item.currentLocation === 'Submitted to Security Office' && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-slate-700/50">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>At Security Desk ({item.storageRefNumber || 'Safekeeping'})</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Metadata Chips: Category, Color, Brand */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg text-slate-700 dark:text-slate-300 text-[11px]">
              <Tag className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              {item.category}
            </span>
            {item.color && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                {item.color}
              </span>
            )}
            {item.brand && (
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                {item.brand}
              </span>
            )}
          </div>

          {/* Item Title */}
          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.itemName}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description || 'No detailed description provided.'}
          </p>
        </div>

        {/* Location & Incident Date info */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {item.locationName}
            </span>
            {item.zone && (
              <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate">
                • {item.zone}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{itemDate ? new Date(itemDate).toLocaleDateString() : 'Recent'}</span>
            </div>
            {(item.approxTime || item.foundTime) && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span>{item.approxTime || item.foundTime}</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-2.5 flex gap-2">
            <Link
              to={`/items/${item._id}?type=${isLost ? 'lost' : 'found'}`}
              className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-bold bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5 group/btn"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>

            {!isLost && item.status !== 'RETURNED' && onClaimClick && (
              <button
                type="button"
                onClick={() => onClaimClick(item)}
                className="py-2 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Claim</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
