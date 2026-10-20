import React, { useState } from 'react';
import { X, ShieldAlert, Upload, CheckCircle2, AlertCircle, Loader2, Sparkles, Handshake } from 'lucide-react';
import api, { resolveImageUrl } from '../../api/client';
import { validateImageFiles } from '../../api/imageValidation';
import Button from '../common/Button';

export default function ClaimModal({ item, lostItemId, matchId, isOpen, onClose, onSuccess }) {
  const [whereLost, setWhereLost] = useState('');
  const [uniqueFeatures, setUniqueFeatures] = useState('');
  const [insideOrAttached, setInsideOrAttached] = useState('');
  const [proofFiles, setProofFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !item) return null;

  const handleFileChange = (e) => {
    const picked = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = ''; // lets you pick the same file again
    if (picked.length === 0) return;

    const { accepted, error: imageError } = validateImageFiles([], picked, { maxFiles: 3 });
    setError(imageError);
    if (accepted.length > 0) setProofFiles(accepted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!whereLost.trim() || !uniqueFeatures.trim() || !insideOrAttached.trim()) {
      setError('Please provide complete answers to all 3 verification questions.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('foundItemId', item._id);
      if (lostItemId) formData.append('lostItemId', lostItemId);
      if (matchId) formData.append('matchId', matchId);
      formData.append('whereLost', whereLost);
      formData.append('uniqueFeatures', uniqueFeatures);
      formData.append('insideOrAttached', insideOrAttached);

      proofFiles.forEach((file) => {
        formData.append('proofImages', file);
      });

      const res = await api.createClaim(formData);
      if (res.success) {
        setSuccessMessage('Ownership claim submitted successfully! Campus administrators and security will verify your details.');
        setTimeout(() => {
          setWhereLost('');
          setUniqueFeatures('');
          setInsideOrAttached('');
          setProofFiles([]);
          setSuccessMessage('');
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 shadow-xs">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
              Campus Security Verification
            </span>
            <h3 className="text-lg font-bold tracking-tight">
              Claim Ownership: {item.itemName}
            </h3>
          </div>
        </div>

        {/* Item preview card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 mb-5 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          {item.images && item.images[0] && (
            <img
              src={resolveImageUrl(item.images[0])}
              alt={item.itemName}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
          )}
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{item.itemName} ({item.category})</p>
            <p className="text-slate-500 dark:text-slate-400">Found at: {item.locationName} • {item.zone || 'General'}</p>
            <span className="text-[11px] text-amber-800 dark:text-amber-400 font-semibold">
              Custody: {item.currentLocation || 'Campus Security'}
            </span>
          </div>
        </div>

        {/* Informational Alert */}
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-3.5 mb-5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            To prevent false claims, your questionnaire answers are strictly compared against confidential private markings logged by the finder and campus security.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs p-3.5 rounded-xl mb-4 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              1. Where & when do you believe you lost this item? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={whereLost}
              onChange={(e) => setWhereLost(e.target.value)}
              placeholder="e.g. Canteen Central Wing near Table 5 during lunch hour"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              2. Describe a unique identifying feature only you would know: <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={uniqueFeatures}
              onChange={(e) => setUniqueFeatures(e.target.value)}
              placeholder="e.g. Small scratch on bottom right rim, custom blue sticker inside, specific brand engraving..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              3. What was inside or attached to the item? <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={insideOrAttached}
              onChange={(e) => setInsideOrAttached(e.target.value)}
              placeholder="e.g. Student ID card 2024CS014, Rs 400 cash, red lanyard keychain"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Optional Proof Images */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              4. Upload Proof of Ownership (Optional receipt, serial no, photo):
            </label>
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/70 dark:bg-slate-800/60 hover:bg-indigo-50/30">
              <Upload className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-1" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                {proofFiles.length > 0 ? `${proofFiles.length} file(s) selected` : 'Click to select proof images'}
              </span>
              <span className="text-[10px] text-slate-400">JPG, PNG, WEBP up to 5 MB each (max 3)</span>              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              loading={submitting}
              variant="primary"
              size="md"
            >
              Submit Verification Claim
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
