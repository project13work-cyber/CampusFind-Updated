import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ItemCard from '../components/items/ItemCard';
import ClaimModal from '../components/claims/ClaimModal';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import {
  Search as SearchIcon,
  Filter,
  Tag,
  MapPin,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  Loader2,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

const CATEGORIES = [
  'All', 'ID Card', 'Wallet', 'Mobile Phone', 'Laptop', 'Laptop Bag', 'Backpack',
  'Keys', 'Earphones', 'Headphones', 'Watch', 'Books', 'Calculator',
  'Water Bottle', 'Documents', 'Clothing', 'Other'
];

const LOCATIONS = [
  'All', 'College Canteen', 'Central Library', 'Computer Center', 'Main Auditorium'
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [color, setColor] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Claim modal state
  const [selectedClaimItem, setSelectedClaimItem] = useState(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (type !== 'all') params.append('type', type);
      if (category !== 'All') params.append('category', category);
      if (location !== 'All') params.append('location', location);
      if (color.trim()) params.append('color', color.trim());
      params.append('sortBy', sortBy);

      const res = await api.search(params.toString());
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [type, category, location, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSearchResults();
  };

  const handleReset = () => {
    setQuery('');
    setType('all');
    setCategory('All');
    setLocation('All');
    setColor('');
    setSortBy('recent');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40 text-xs font-extrabold">
            <SearchIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Search & Discovery Engine</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Campus Lost & Found Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Search by item name, category, campus spot, or fine-tune with specific color and status filters
            </p>
          </div>

          {/* Large Hero Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2.5 max-w-4xl">
            <div className="relative flex-1">
              <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by keyword, e.g. 'WildHorn wallet', 'Boat neckband', 'Casio calculator'..."
                className="w-full pl-12 pr-4 py-3.5 text-xs sm:text-sm rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filter Toolbar Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-5">
          {/* Top Bar: Report Type Pills & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {/* Type Selector (All / Lost / Found) */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setType('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'all'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Reports
              </button>
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'lost'
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Lost Items
              </button>
              <button
                type="button"
                onClick={() => setType('found')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'found'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Found Items
              </button>
            </div>

            {/* Sorting & Reset Action */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="date">Incident Date</option>
                  <option value="name">Item Name (A-Z)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleReset}
                title="Reset All Filters"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Filters: Category, Location, Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Campus Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Color Filter
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Black, Blue, Silver"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Results Count Bar */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Found <span className="font-extrabold text-slate-900 dark:text-white">{items.length}</span> campus belongings in database
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard count={6} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No Matching Items Found"
            description="We couldn't find any belongings matching your exact keyword and filter parameters. Try clearing some filters."
            actionText="Reset All Filters"
            onActionClick={handleReset}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                type={item.reportType}
                onClaimClick={(it) => {
                  setSelectedClaimItem(it);
                  setClaimModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        item={selectedClaimItem}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={() => fetchSearchResults()}
      />
    </div>
  );
}
