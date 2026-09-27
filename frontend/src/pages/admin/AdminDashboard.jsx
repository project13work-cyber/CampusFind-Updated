import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Shield,
  TrendingUp,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Tag,
  ArrowRight,
  Users,
  Building,
  Handshake,
  Loader2,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminDashboard();
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || 'Failed to load dashboard metrics');
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Loading security dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium">
          <p className="text-rose-600 dark:text-rose-400 font-bold text-sm mb-2">{error || 'Access Denied'}</p>
          <Link to="/" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Return to Student Portal
          </Link>
        </div>
      </div>
    );
  }

  const { stats, charts, recent } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Campus Security & Admin Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Administrative Control Console
            </h1>
            <p className="text-xs text-slate-300">
              Real-time Lost & Found monitoring, matching engine verification, and physical handover records
            </p>
          </div>

          {/* Sub-nav quick links */}
          <div className="relative z-10 flex flex-wrap gap-2">
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/15 backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <span>All Reports</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </Link>
            <Link
              to="/admin/matches"
              className="px-4 py-2.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Matches</span>
              <Sparkles className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/claims"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-950/40 flex items-center gap-1.5"
            >
              <span>Verify Claims</span>
              <Handshake className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 6 Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium hover:shadow-premium-hover transition-all">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Lost</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalLost}</p>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Reported</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium hover:shadow-premium-hover transition-all">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Found</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalFound}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Discovered</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium hover:shadow-premium-hover transition-all">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stats.pendingReports}</p>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Needs Approval</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium hover:shadow-premium-hover transition-all">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Smart Matches</p>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{stats.possibleMatches}</p>
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">Calculated</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium hover:shadow-premium-hover transition-all">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Claims</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{stats.pendingClaims}</p>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">To Verify</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium hover:shadow-premium-hover transition-all">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Items Returned</p>
            <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{stats.itemsReturned}</p>
            <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold">Handed Over</span>
          </div>
        </div>

        {/* Charts Grid: Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Categories Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Lost Belongings by Category</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Distribution</span>
            </div>

            <div className="space-y-3.5 pt-2">
              {charts.categories.length === 0 ? (
                <p className="text-xs text-slate-400">No category metrics logged yet.</p>
              ) : (
                charts.categories.map((cat, idx) => {
                  const maxCount = Math.max(...charts.categories.map((c) => c.count), 1);
                  const pct = Math.round((cat.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{cat.category}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{cat.count} items</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chart 2: Location Hotspots */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Found Items by Campus Location</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Hotspots</span>
            </div>

            <div className="space-y-3.5 pt-2">
              {charts.locations.length === 0 ? (
                <p className="text-xs text-slate-400">No location data logged yet.</p>
              ) : (
                charts.locations.map((loc, idx) => {
                  const maxCount = Math.max(...charts.locations.map((l) => l.count), 1);
                  const pct = Math.round((loc.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{loc.location}</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{loc.count} reports</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Action Tables: Recent Claims Pending Verification */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Handshake className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Ownership Claims Awaiting Security Verification</span>
            </h3>
            <Link
              to="/admin/claims"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group"
            >
              <span>Manage All Claims</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.claims.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No pending claims at this moment.</p>
            ) : (
              recent.claims.map((claim) => (
                <div key={claim._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {claim.foundItemId?.itemName || 'Item'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Claimant: {claim.claimantUserId?.name} ({claim.claimantUserId?.studentId})
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={claim.status} />
                    <Link
                      to="/admin/claims"
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors"
                    >
                      Review Answers
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
