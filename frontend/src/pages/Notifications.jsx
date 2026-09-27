import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  CheckCheck,
  Tag,
  Clock
} from 'lucide-react';

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const navigate = useNavigate();

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
    if (n.relatedMatchId) {
      navigate('/my-reports');
    } else if (n.relatedItemId) {
      navigate(`/items/${n.relatedItemId}`);
    } else if (n.relatedClaimId) {
      navigate('/my-reports');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40 text-xs font-extrabold mb-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Notification Center</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Campus Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Updates on your reports, similarity match alerts, and claim verifications
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification List Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No Notifications Found"
              description="You have no notifications in this view. Updates about your campus reports will appear here."
            />
          ) : (
            filtered.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-all flex items-start gap-4 ${
                  !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {n.type === 'MATCH_FOUND' ? (
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  ) : n.type === 'CLAIM_APPROVED' ? (
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                      <Bell className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString()}{' '}
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>View associated record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0"></span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
