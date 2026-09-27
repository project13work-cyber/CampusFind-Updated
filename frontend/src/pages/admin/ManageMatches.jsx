import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import EmptyState from '../../components/common/EmptyState';
import { Sparkles, ArrowLeft, CheckCircle2, MapPin, Tag, Calendar, Loader2 } from 'lucide-react';

export default function ManageMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllMatches = async () => {
      try {
        setLoading(true);
        const res = await api.getMatches('minScore=50');
        if (res.success) {
          setMatches(res.matches || []);
        }
      } catch (err) {
        console.error('Error fetching admin matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMatches();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Console</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Automated Campus Similarity Matches
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Computed by the 7-factor weighted algorithm matrix (0–100%)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Calculating similarity matrix...</span>
          </div>
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Matches Detected"
            description="No active items currently meet the 50% confidence match threshold."
          />
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match._id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Match Score: {match.score}% ({match.matchLevel})
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        Match ID: {match._id} • Status: {match.status}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/admin/claims"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    View Related Claims →
                  </Link>
                </div>

                {/* Side by side items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lost Item */}
                  <div className="bg-rose-50/40 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-rose-700 dark:text-rose-400 block">
                      Lost Item Report
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{match.lostItemId?.itemName}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Category: <span className="font-semibold text-slate-800 dark:text-slate-200">{match.lostItemId?.category}</span></p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Location: <span className="font-semibold text-slate-800 dark:text-slate-200">{match.lostItemId?.locationName} ({match.lostItemId?.zone})</span>
                    </p>
                    <p className="text-[11px] text-amber-900 dark:text-amber-300 font-mono bg-white dark:bg-slate-800 p-2 rounded-lg border border-amber-200/70 dark:border-amber-700/60">
                      Secret Detail: {match.lostItemId?.privateIdentifier || 'None'}
                    </p>
                  </div>

                  {/* Found Item */}
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 block">
                      Found Item Report
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{match.foundItemId?.itemName}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Category: <span className="font-semibold text-slate-800 dark:text-slate-200">{match.foundItemId?.category}</span></p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Location: <span className="font-semibold text-slate-800 dark:text-slate-200">{match.foundItemId?.locationName} ({match.foundItemId?.zone})</span>
                    </p>
                    <p className="text-[11px] text-amber-900 dark:text-amber-300 font-mono bg-white dark:bg-slate-800 p-2 rounded-lg border border-amber-200/70 dark:border-amber-700/60">
                      Secret Detail: {match.foundItemId?.privateIdentifier || 'None'}
                    </p>
                  </div>
                </div>

                {/* Score breakdown factors */}
                {match.matchingFactors?.details && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">Contributing Match Factors:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      {match.matchingFactors.details.map((d, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
