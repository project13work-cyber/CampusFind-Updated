import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import HandoverModal from '../../components/claims/HandoverModal';
import EmptyState from '../../components/common/EmptyState';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lock,
  User,
  Phone,
  Mail,
  FileCheck,
  Eye,
  Loader2,
  Handshake,
  Sparkles
} from 'lucide-react';

export default function ManageClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handover modal state
  const [handoverTarget, setHandoverTarget] = useState(null);
  const [handoverClaimId, setHandoverClaimId] = useState(null);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.getClaims();
      if (res.success) {
        setClaims(res.claims || []);
      }
    } catch (err) {
      console.error('Error fetching admin claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleApproveClaim = async (claimId) => {
    const notes = prompt('Enter admin approval notes (optional):', 'Ownership verified through matching private identifier.');
    if (notes === null) return;

    try {
      await api.approveClaim(claimId, notes);
      fetchClaims();
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectClaim = async (claimId) => {
    const reason = prompt('Enter rejection reason for student:', 'Verification details do not match item markings.');
    if (reason === null) return;

    try {
      await api.rejectClaim(claimId, reason);
      fetchClaims();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  const openHandover = (claim) => {
    setHandoverTarget(claim.foundItemId);
    setHandoverClaimId(claim._id);
    setHandoverModalOpen(true);
  };

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
              Ownership Claim Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side evaluation: Compare student answers against confidential private markings
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading claim records...</span>
          </div>
        ) : claims.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="No Claims Recorded"
            description="There are currently no ownership claims awaiting admin review."
          />
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <div
                key={claim._id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-6"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Claim for: {claim.foundItemId?.itemName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Filed on {new Date(claim.createdAt).toLocaleDateString()} • Claim ID: <span className="font-mono">{claim._id}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={claim.status} />
                  </div>
                </div>

                {/* Claimant Details Bar */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Claimant Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">{claim.claimantUserId?.name || 'Student'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Student ID</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{claim.claimantUserId?.studentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Contact Phone</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{claim.claimantUserId?.phone}</span>
                  </div>
                </div>

                {/* SIDE-BY-SIDE VERIFICATION EVALUATION BOX */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Claimant Questionnaire Answers */}
                  <div className="bg-indigo-50/40 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100/80 dark:border-indigo-900/30 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
                      Student Claimant's Submitted Answers
                    </span>

                    <div>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">1. Loss Location & Circumstances:</p>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-800 p-3 rounded-xl border border-indigo-200/80 dark:border-slate-700 mt-1">
                        "{claim.answers?.whereLost}"
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">2. Unique Distinguishing Feature:</p>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-800 p-3 rounded-xl border border-indigo-200/80 dark:border-slate-700 mt-1">
                        "{claim.answers?.uniqueFeatures}"
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">3. Interior / Attached Contents:</p>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium bg-white dark:bg-slate-800 p-3 rounded-xl border border-indigo-200/80 dark:border-slate-700 mt-1">
                        "{claim.answers?.insideOrAttached}"
                      </p>
                    </div>

                    {claim.proofImages && claim.proofImages.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">Attached Proof of Ownership:</p>
                        <div className="flex gap-2">
                          {claim.proofImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Proof"
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Reporter's Confidential Private Identifier */}
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/30 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Confidential Private Identifier Logged by Finder/Reporter</span>
                      </div>

                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-amber-300 dark:border-amber-700/80 font-mono text-xs text-amber-950 dark:text-amber-200 space-y-2">
                        <p className="text-[11px] font-bold font-sans text-amber-800 dark:text-amber-400">
                          Hidden from Public Eye:
                        </p>
                        <p className="font-semibold">
                          "{claim.foundItemId?.privateIdentifier || claim.lostItemId?.privateIdentifier || 'No secret identifiers recorded.'}"
                        </p>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <p><strong>Item Custody:</strong> {claim.foundItemId?.currentLocation}</p>
                        {claim.foundItemId?.storageRefNumber && (
                          <p><strong>Storage Ref Number:</strong> {claim.foundItemId.storageRefNumber}</p>
                        )}
                        <p><strong>Found Spot:</strong> {claim.foundItemId?.locationName} • {claim.foundItemId?.zone}</p>
                      </div>
                    </div>

                    {claim.adminNotes && (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Existing Admin Note:</span>
                        <p className="text-slate-800 dark:text-slate-200">{claim.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Actions Toolbar */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {claim.status === 'APPROVED' ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Claim Approved. Ready for physical handover recording.
                      </span>
                    ) : claim.status === 'RETURNED' ? (
                      <span className="text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Item handed over and returned successfully.
                      </span>
                    ) : (
                      <span>Compare student answers with secret details before approving.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {claim.status === 'PENDING_REVIEW' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRejectClaim(claim._id)}
                          className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject Claim
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveClaim(claim._id)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          Approve Ownership Claim
                        </button>
                      </>
                    )}

                    {claim.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => openHandover(claim)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Handshake className="w-4 h-4" />
                        <span>Record Physical Handover & Finalize Return</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handover Modal */}
      <HandoverModal
        isOpen={handoverModalOpen}
        item={handoverTarget}
        claimId={handoverClaimId}
        onClose={() => setHandoverModalOpen(false)}
        onSuccess={() => fetchClaims()}
      />
    </div>
  );
}
