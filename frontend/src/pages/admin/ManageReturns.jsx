import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { ShieldCheck, ArrowLeft, Calendar, MapPin, Tag, CheckCircle2, Loader2 } from 'lucide-react';

export default function ManageReturns() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturnedItems = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminReports('status=RETURNED');
        if (res.success) {
          const combined = [...(res.lost || []), ...(res.found || [])];
          setItems(combined);
        }
      } catch (err) {
        console.error('Error loading returned items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReturnedItems();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
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
              Returned Items & Handover Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Official audit log of campus belongings successfully verified and handed over
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading return log...</span>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No Items Returned Yet"
            description="Items finalized through security handover will be logged in this audit log."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.itemName}</span>
                  <StatusBadge status="RETURNED" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Category: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.category}</span> • Campus Spot: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.locationName}</span>
                </p>
                {item.storageRefNumber && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>Storage Reference:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.storageRefNumber}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>Owner: <strong className="text-slate-600 dark:text-slate-300">{item.userId?.name || 'Verified Student'}</strong></span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Resolved & Closed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
