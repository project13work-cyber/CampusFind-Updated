import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import ClaimModal from '../components/claims/ClaimModal';
import EmptyState from '../components/common/EmptyState';
import SkeletonCard from '../components/common/SkeletonCard';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Handshake,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';

export default function MyReports() {
  const [activeTab, setActiveTab] = useState('lost'); // 'lost', 'found', 'matches', 'claims'

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Claim modal state
  const [selectedClaimFoundItem, setSelectedClaimFoundItem] = useState(null);
  const [selectedClaimLostItemId, setSelectedClaimLostItemId] = useState(null);
  const [selectedClaimMatchId, setSelectedClaimMatchId] = useState(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [lostRes, foundRes, matchRes, claimRes] = await Promise.all([
        api.getLost('myItems=true'),
        api.getFound('myItems=true'),
        api.getMatches(),
        api.getClaims()
      ]);

      if (lostRes.success) setLostItems(lostRes.items || []);
      if (foundRes.success) setFoundItems(foundRes.items || []);
      if (matchRes.success) setMatches(matchRes.matches || []);
      if (claimRes.success) setClaims(claimRes.claims || []);
    } catch (err) {
      console.error('Error fetching my reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteLost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lost report?')) return;
    try {
      await api.deleteLost(id);
      setLostItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete report');
    }
  };

  const handleDeleteFound = async (id) => {
    if (!window.confirm('Are you sure you want to delete this found report?')) return;
    try {
      await api.deleteFound(id);
      setFoundItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete report');
    }
  };

  const openClaimFromMatch = (match) => {
    setSelectedClaimFoundItem(match.foundItemId);
    setSelectedClaimLostItemId(match.lostItemId?._id);
    setSelectedClaimMatchId(match._id);
    setClaimModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40 text-xs font-extrabold mb-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Student Personal Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              My Campus Activity & Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Track your filed reports, automated similarity matches, and ownership claims
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/report-lost"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              + Report Lost
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              + Report Found
            </Link>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('lost')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Lost Items</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{lostItems.length}</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Filed by you</span>
          </div>

          <div
            onClick={() => setActiveTab('found')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'found'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Found Items</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{foundItems.length}</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Reported by you</span>
          </div>

          <div
            onClick={() => setActiveTab('matches')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Smart Matches</span>
            </div>
            <p className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 mt-1">{matches.length}</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Similarity detected</span>
          </div>

          <div
            onClick={() => setActiveTab('claims')}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'claims'
                ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              <Handshake className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>My Claims</span>
            </div>
            <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-1">{claims.length}</p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Verification status</span>
          </div>
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            My Lost Items ({lostItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('found')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'found'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            My Found Reports ({foundItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Possible Matches ({matches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'claims'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>My Claims ({claims.length})</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard count={4} />
          </div>
        ) : (
          <div>
            {/* TAB 1: LOST ITEMS */}
            {activeTab === 'lost' && (
              <div>
                {lostItems.length === 0 ? (
                  <EmptyState
                    variant="lost"
                    title="No Lost Items Filed"
                    description="You haven't reported any lost belongings on campus yet."
                    actionText="File a Lost Report"
                    actionLink="/report-lost"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lostItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="flex gap-4">
                          <img
                            src={
                              item.images && item.images[0]
                                ? item.images[0]
                                : 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80'
                            }
                            alt={item.itemName}
                            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/40">
                                {item.category}
                              </span>
                              <StatusBadge status={item.status} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                              {item.itemName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              <span>{item.locationName} • {item.zone}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                              Lost on {new Date(item.lostDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Link
                            to={`/items/${item._id}?type=lost`}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteLost(item._id)}
                            className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FOUND ITEMS */}
            {activeTab === 'found' && (
              <div>
                {foundItems.length === 0 ? (
                  <EmptyState
                    variant="found"
                    title="No Found Items Reported"
                    description="You haven't filed any found items yet. Thank you for keeping our campus safe!"
                    actionText="Report Found Item"
                    actionLink="/report-found"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {foundItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="flex gap-4">
                          <img
                            src={
                              item.images && item.images[0]
                                ? item.images[0]
                                : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300&auto=format&fit=crop&q=80'
                            }
                            alt={item.itemName}
                            className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                                {item.category}
                              </span>
                              <StatusBadge status={item.status} />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                              {item.itemName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{item.locationName} • {item.zone}</span>
                            </p>
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold block mt-1">
                              Custody: {item.currentLocation}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Link
                            to={`/items/${item._id}?type=found`}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteFound(item._id)}
                            className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: POSSIBLE MATCHES */}
            {activeTab === 'matches' && (
              <div>
                {matches.length === 0 ? (
                  <EmptyState
                    variant="match"
                    title="No Matches Detected"
                    description="When a found item matches your reported belongings, the 7-factor similarity engine will display it here."
                  />
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div
                        key={match._id}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-4"
                      >
                        {/* Match Header with percentage pill */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shadow-xs">
                              <Sparkles className="w-5 h-5" />
                            </span>
                            <div>
                              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Similarity Confidence: {match.score}%
                              </span>
                              <span
                                className={`ml-2 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                                  match.score >= 90
                                    ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                    : 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                }`}
                              >
                                {match.matchLevel} Confidence
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openClaimFromMatch(match)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                          >
                            <Handshake className="w-3.5 h-3.5" />
                            <span>Claim This Match</span>
                          </button>
                        </div>

                        {/* Side-by-Side comparison cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Lost Report Side */}
                          <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                              Your Reported Lost Item
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {match.lostItemId?.itemName || 'Item'}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Category: <span className="font-semibold text-slate-800 dark:text-slate-200">{match.lostItemId?.category}</span>
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Spot: <span className="font-semibold text-slate-800 dark:text-slate-200">{match.lostItemId?.locationName} ({match.lostItemId?.zone})</span>
                            </p>
                          </div>

                          {/* Found Report Side */}
                          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                              Matching Found Item
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {match.foundItemId?.itemName || 'Item'}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Category: <span className="font-semibold text-slate-800 dark:text-slate-200">{match.foundItemId?.category}</span>
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              Spot: <span className="font-semibold text-slate-800 dark:text-slate-200">{match.foundItemId?.locationName} ({match.foundItemId?.zone})</span>
                            </p>
                            <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold">
                              Custody: {match.foundItemId?.currentLocation}
                            </p>
                          </div>
                        </div>

                        {/* Matching factors explanation */}
                        {match.matchingFactors?.details && match.matchingFactors.details.length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                              Match Algorithm Factor Breakdown:
                            </p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {match.matchingFactors.details.map((detail, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MY CLAIMS */}
            {activeTab === 'claims' && (
              <div>
                {claims.length === 0 ? (
                  <EmptyState
                    title="No Ownership Claims Filed"
                    description="When you spot your belonging in the found list or a match, submit a claim to verify ownership."
                  />
                ) : (
                  <div className="space-y-4">
                    {claims.map((claim) => (
                      <div
                        key={claim._id}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              Claim for: {claim.foundItemId?.itemName || 'Belonging'}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Claim ID: {claim._id} • Filed on {new Date(claim.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <StatusBadge status={claim.status} />
                        </div>

                        {/* Progression Stepper */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
                            <span className="text-indigo-600 dark:text-indigo-400">1. Verification Submitted</span>
                            <span className={claim.status !== 'PENDING_REVIEW' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                              2. Admin Review
                            </span>
                            <span className={['APPROVED', 'RETURNED'].includes(claim.status) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                              3. Approved for Pickup
                            </span>
                            <span className={claim.status === 'RETURNED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                              4. Handed Over
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                claim.status === 'RETURNED'
                                  ? 'bg-emerald-500 w-full'
                                  : claim.status === 'APPROVED'
                                  ? 'bg-emerald-500 w-3/4'
                                  : claim.status === 'MORE_INFO_REQUESTED'
                                  ? 'bg-amber-500 w-1/2'
                                  : 'bg-indigo-500 w-1/3'
                              }`}
                            />
                          </div>
                        </div>

                        {claim.adminNotes && (
                          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-3.5 rounded-2xl text-xs space-y-1">
                            <p className="font-bold text-indigo-950 dark:text-indigo-200">Campus Administrator Feedback:</p>
                            <p className="text-indigo-800 dark:text-indigo-300">{claim.adminNotes}</p>
                          </div>
                        )}

                        {claim.status === 'APPROVED' && (
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">Ready for Campus Pickup!</p>
                              <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                                Please visit Campus Security Desk (Gate 1) with your student ID ({claim.claimantUserId?.studentId || 'ID'}) to retrieve your item.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        item={selectedClaimFoundItem}
        lostItemId={selectedClaimLostItemId}
        matchId={selectedClaimMatchId}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={() => {
          loadData();
          setActiveTab('claims');
        }}
      />
    </div>
  );
}
