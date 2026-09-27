import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, MapPin, Tag, Loader2, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../api/client';
import Button from '../common/Button';

export default function HandoverModal({ item, claimId, isOpen, onClose, onSuccess }) {
  const [handoverLocation, setHandoverLocation] = useState('Campus Security Office (Ground Floor, Gate 1)');
  const [storageRefNumber, setStorageRefNumber] = useState(item?.storageRefNumber || 'SEC-2026-0042');
  const [notes, setNotes] = useState('Owner identity confirmed with physical Student ID card and matching confidential markings.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.recordHandover(item._id, {
        claimId,
        handoverLocation,
        storageRefNumber,
        notes
      });

      if (res.success) {
        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to record handover');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
              Campus Security Return Protocol
            </span>
            <h3 className="text-lg font-bold tracking-tight">
              Finalize Handover & Mark as RETURNED
            </h3>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 mb-4 text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
          <p className="font-bold text-slate-900 dark:text-white">{item.itemName}</p>
          <p className="text-slate-500 dark:text-slate-400">Category: {item.category} • Location: {item.locationName}</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Handover Station / Location:</span>
            </label>
            <input
              type="text"
              required
              value={handoverLocation}
              onChange={(e) => setHandoverLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Security Storage Reference Number:</span>
            </label>
            <input
              type="text"
              required
              value={storageRefNumber}
              onChange={(e) => setStorageRefNumber(e.target.value)}
              placeholder="e.g. SEC-2026-0042"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Handover Verification Notes:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Verification notes, claimant ID verified, signature recorded..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              loading={loading}
              variant="success"
              size="md"
              icon={CheckCircle2}
            >
              Confirm Handover & Mark Returned
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
