import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import CampusMap from '../components/map/CampusMap';
import ClaimModal from '../components/claims/ClaimModal';
import Button from '../components/common/Button';
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Lock,
  Handshake,
  Loader2,
  FileCheck2,
  Sparkles,
  Info
} from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const itemType = searchParams.get('type') || 'lost'; // 'lost' or 'found'
  const isLost = itemType.toLowerCase() === 'lost';

  const [item, setItem] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = isLost ? await api.getLostById(id) : await api.getFoundById(id);
        if (res.success && res.item) {
          setItem(res.item);
        } else {
          setError('Item record not found.');
        }
      } catch (err) {
        setError(err.message || 'Error loading item details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, isLost]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Retrieving item record...</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium">
          <p className="text-rose-600 dark:text-rose-400 font-bold text-sm mb-2">{error || 'Item not found'}</p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog Search</span>
          </Link>
        </div>
      </div>
    );
  }

  const defaultImage = isLost
    ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80';

  const imageList = item.images && item.images.length > 0 ? item.images : [defaultImage];
  const itemDate = item.lostDate || item.foundDate;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Previous View</span>
          </button>

          <span
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
              isLost
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50'
            }`}
          >
            {isLost ? 'Lost Item Report' : 'Found Item Record'}
          </span>
        </div>

        {/* Main Details 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery & Custody */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-3xl bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-premium relative group">
              <img
                src={imageList[activeImage]}
                alt={item.itemName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
              <div className="absolute top-3.5 left-3.5">
                <StatusBadge status={item.status} className="shadow-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm" />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {imageList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImage === idx
                        ? 'border-indigo-600 shadow-md scale-105'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Custody Info Card for Found Items */}
            {!isLost && (
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl space-y-2.5 border border-slate-800 shadow-premium">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Physical Storage & Custody</span>
                </div>
                <p className="text-sm font-bold">{item.currentLocation || 'Campus Security Office'}</p>
                {item.storageRefNumber && (
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/15 flex items-center justify-between text-xs backdrop-blur-md">
                    <span className="text-slate-300">Storage Ref Number:</span>
                    <span className="font-mono font-bold text-cyan-300">{item.storageRefNumber}</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Physical collection is authorized through verified ownership claims at Campus Gate 1.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-6">
              {/* Category & Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/40">
                  <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  {item.category}
                </span>
                {item.brand && (
                  <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
                    Brand: {item.brand}
                  </span>
                )}
                {item.model && (
                  <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
                    Model: {item.model}
                  </span>
                )}
                {item.color && (
                  <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
                    Color: {item.color}
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {item.itemName}
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Report ID: {item._id}
                </p>
              </div>

              {/* Description */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Public Description
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {item.description || 'No detailed public description provided.'}
                </p>
              </div>

              {/* Incident Details Grid */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">{isLost ? 'Date Lost' : 'Date Found'}</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>{itemDate ? new Date(itemDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Approximate Time</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{item.approxTime || item.foundTime || item.timeRange || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Campus Spot</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{item.locationName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Identified Zone</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <span>{item.zone || 'General Area'}</span>
                  </div>
                </div>
              </div>

              {item.exactSpot && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <span className="text-slate-400 font-bold block mb-0.5">Spot Description Note:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">"{item.exactSpot}"</p>
                </div>
              )}

              {/* Sensitive Details View (Only for Author or Admin) */}
              {item.privateIdentifier && (
                <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Confidential Private Identifier (Visible only to you & Admin):</span>
                  </div>
                  <p className="text-xs text-amber-950 dark:text-amber-200 font-mono bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-300/80 dark:border-amber-700/80">
                    {item.privateIdentifier}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-wrap gap-3">
                {!isLost && item.status !== 'RETURNED' && (
                  <Button
                    onClick={() => {
                      if (!isAuthenticated) navigate('/login');
                      else setClaimModalOpen(true);
                    }}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    icon={Handshake}
                  >
                    Claim Ownership of This Item
                  </Button>
                )}

                {isLost && (
                  <Link
                    to="/report-found"
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Report You Found This Item</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Map Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Campus Location Floor Plan Pin: {item.locationName}
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              Coordinates: ({item.mapCoordinates?.x || 320}, {item.mapCoordinates?.y || 380})
            </span>
          </div>

          <CampusMap
            coordinates={item.mapCoordinates || { x: 320, y: 380 }}
            readOnly={true}
            selectedZone={item.zone}
          />
        </div>
      </div>

      {/* Claim Verification Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        item={item}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={() => {
          navigate('/my-reports');
        }}
      />
    </div>
  );
}
