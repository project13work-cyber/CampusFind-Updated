import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Loader2,
  ArrowLeft,
  FileCheck
} from 'lucide-react';

export default function ManageReports() {
  const [reports, setReports] = useState({ lost: [], found: [] });
  const [activeType, setActiveType] = useState('all'); // 'all', 'lost', 'found'
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeType !== 'all') params.append('type', activeType);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.getAdminReports(params.toString());
      if (res.success) {
        setReports({
          lost: res.lost || [],
          found: res.found || []
        });
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeType, statusFilter]);

  const handleApprove = async (id, type) => {
    try {
      await api.approveReport(id, type);
      fetchReports();
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id, type) => {
    const reason = prompt('Please provide a reason for closing/rejecting this report:');
    if (reason === null) return;
    try {
      await api.rejectReport(id, type, reason);
      fetchReports();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  const allList = [
    ...(activeType !== 'found' ? reports.lost : []),
    ...(activeType !== 'lost' ? reports.found : [])
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
              Manage Campus Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Verify student submissions, inspect author credentials, and moderate listings
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveType('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeType === 'all' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveType('lost')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeType === 'lost' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Lost ({reports.lost.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveType('found')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeType === 'found' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Found ({reports.found.length})
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading reports database...</span>
            </div>
          ) : allList.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No Reports Found"
              description="No reports match your current filter settings."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-5">Item Details</th>
                    <th className="py-4 px-5">Type</th>
                    <th className="py-4 px-5">Location / Zone</th>
                    <th className="py-4 px-5">Reporter (Admin View)</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allList.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Item Details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={
                              item.images && item.images[0]
                                ? item.images[0]
                                : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.itemName}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Category: {item.category}</p>
                            {item.privateIdentifier && (
                              <p className="text-[10px] text-amber-800 dark:text-amber-400 font-mono mt-0.5 line-clamp-1">
                                [Secret: {item.privateIdentifier}]
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.reportType === 'LOST'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50'
                          }`}
                        >
                          {item.reportType}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.locationName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.zone || 'General'}</p>
                      </td>

                      {/* Reporter Info */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{item.userId?.name || 'Anonymous'}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{item.userId?.email || 'N/A'}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{item.userId?.phone || 'N/A'} • ID: {item.userId?.studentId}</span>
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {item.status !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handleApprove(item._id, item.reportType)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Approve Report"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {item.status !== 'CLOSED' && (
                            <button
                              type="button"
                              onClick={() => handleReject(item._id, item.reportType)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Close / Reject Report"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Close</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
