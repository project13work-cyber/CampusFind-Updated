import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from '../components/map/CampusMap';
import api from '../api/client';
import Button from '../components/common/Button';
import confetti from 'canvas-confetti';
import {
  Compass,
  Upload,
  X,
  MapPin,
  Calendar,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  ShieldCheck,
  Building,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Fingerprint,
  Info
} from 'lucide-react';

const CATEGORIES = [
  { name: 'ID Card', icon: '🪪' },
  { name: 'Wallet', icon: '👛' },
  { name: 'Mobile Phone', icon: '📱' },
  { name: 'Laptop', icon: '💻' },
  { name: 'Laptop Bag', icon: '💼' },
  { name: 'Backpack', icon: '🎒' },
  { name: 'Keys', icon: '🔑' },
  { name: 'Earphones', icon: '🎧' },
  { name: 'Headphones', icon: '🎧' },
  { name: 'Watch', icon: '⌚' },
  { name: 'Books', icon: '📚' },
  { name: 'Calculator', icon: '🔢' },
  { name: 'Water Bottle', icon: '🍶' },
  { name: 'Documents', icon: '📄' },
  { name: 'Clothing', icon: '👕' },
  { name: 'Other', icon: '📦' }
];

const CURRENT_LOCATIONS = [
  'With me',
  'Submitted to Security Office',
  'Submitted to College Office',
  'Other'
];

export default function ReportFound() {
  const navigate = useNavigate();

  // Wizard Step (1: Category, 2: Specs & Custody, 3: Discovery Location & Map, 4: Photos & Confidential ID, 5: Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Earphones');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');

  // Photos
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // When
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [foundTime, setFoundTime] = useState('11:00 AM');

  // Exact Location
  const [locationName, setLocationName] = useState('College Canteen');
  const [zone, setZone] = useState('Dining Tables 1 - 3 (North Wing)');
  const [mapCoordinates, setMapCoordinates] = useState({ x: 310, y: 160 });
  const [exactSpot, setExactSpot] = useState('Table 2 near window');

  // Custody
  const [currentLocation, setCurrentLocation] = useState('Submitted to Security Office');
  const [storageRefNumber, setStorageRefNumber] = useState('');

  // Private Identifier
  const [privateIdentifier, setPrivateIdentifier] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageSelect = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!itemName.trim() || !category || !foundDate || !locationName) {
      setError('Please fill in all required fields (Item Name, Category, Date, and Campus Location).');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('itemName', itemName.trim());
      formData.append('category', category);
      formData.append('brand', brand.trim());
      formData.append('model', model.trim());
      formData.append('color', color.trim());
      formData.append('description', description.trim());
      formData.append('foundDate', foundDate);
      formData.append('foundTime', foundTime.trim());
      formData.append('locationName', locationName);
      formData.append('zone', zone);
      formData.append('mapCoordinates', JSON.stringify(mapCoordinates));
      formData.append('exactSpot', exactSpot.trim());
      formData.append('currentLocation', currentLocation);
      formData.append('storageRefNumber', storageRefNumber.trim());
      formData.append('privateIdentifier', privateIdentifier.trim());

      images.forEach((img) => {
        formData.append('images', img);
      });

      const res = await api.createFound(formData);
      if (res.success) {
        setSuccess(true);
        try {
          confetti({
            particleCount: 110,
            spread: 75,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        setTimeout(() => {
          navigate('/my-reports');
        }, 1800);
      }
    } catch (err) {
      setError(err.message || 'Failed to report found item. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title Header */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/40 text-xs font-extrabold mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Good Samaritan • Found Belonging Report</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Report a Found Belonging
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thank you for helping return items to fellow students. Pinpoint where you discovered it to expedite automatic recovery.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { num: 1, label: 'Category' },
            { num: 2, label: 'Details & Custody' },
            { num: 3, label: 'Discovery Spot' },
            { num: 4, label: 'Photos & Security' },
            { num: 5, label: 'Review' }
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentStep === s.num
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : currentStep > s.num
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === s.num
                    ? 'bg-white text-emerald-700 font-black'
                    : currentStep > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-4 rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs p-5 rounded-2xl flex items-center gap-3 font-semibold shadow-md">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-extrabold">Found Item Report Filed Successfully!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Automated similarity matching running in background. Claimants will be verified securely.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: CATEGORY SELECTION */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Step 1 — Select Found Item Category
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Categorizing helps match instantly against lost reports submitted by students
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">1 / 5</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      setCurrentStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group ${
                      category === cat.name
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-md shadow-emerald-500/10 scale-105'
                        : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1'
                    }`}
                  >
                    <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="success"
                  size="md"
                  iconRight={ArrowRight}
                >
                  Continue to Details
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS & CUSTODY */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Step 2 — Item Specifications & Current Custody
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Category selected: <strong className="text-emerald-600 dark:text-emerald-400">{category}</strong>
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">2 / 5</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Item Name / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Boat Wireless Neckband, Casio fx-991EX Calculator, Blue Milton Flask"
                    className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Item Color
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Black, Silver, Navy Blue"
                    className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand (if visible)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Boat, Apple, Dell, Casio"
                    className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Model / Variant
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Rockerz 255 Pro"
                    className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Public Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide general visual description (avoid writing down sensitive private contents)..."
                    className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Custody Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Item Custody Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Where is the item right now? <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={currentLocation}
                      onChange={(e) => setCurrentLocation(e.target.value)}
                      className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {CURRENT_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Storage Reference Number (If at Security Desk)
                    </label>
                    <input
                      type="text"
                      value={storageRefNumber}
                      onChange={(e) => setStorageRefNumber(e.target.value)}
                      placeholder="e.g. SEC-2026-0042"
                      className="w-full px-3.5 py-3 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="secondary"
                  size="md"
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  variant="success"
                  size="md"
                  iconRight={ArrowRight}
                >
                  Continue to Discovery Spot
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: DISCOVERY SPOT & MAP */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Step 3 — When & Where was it Found?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pinpointing the discovery spot allows immediate spatial matching against lost reports
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">3 / 5</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Date Found <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="date"
                      required
                      value={foundDate}
                      onChange={(e) => setFoundDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Approximate Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={foundTime}
                      onChange={(e) => setFoundTime(e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Campus Spot / Building <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="College Canteen">College Canteen (Ground Floor)</option>
                    <option value="Central Library">Central Library (1st Floor)</option>
                    <option value="Computer Center">Computer Center (Tech Block 2)</option>
                    <option value="Main Auditorium">Main Auditorium & Plaza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Specific Spot Description
                  </label>
                  <input
                    type="text"
                    value={exactSpot}
                    onChange={(e) => setExactSpot(e.target.value)}
                    placeholder="e.g. Table 2 near the window, left on chair"
                    className="w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Interactive Campus Map Component */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Click or drag the red pin to mark exact spot where you found the item:
                </label>
                <CampusMap
                  coordinates={mapCoordinates}
                  onChange={(newCoords) => setMapCoordinates(newCoords)}
                  selectedZone={zone}
                  onZoneChange={(newZone) => setZone(newZone)}
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="secondary"
                  size="md"
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  variant="success"
                  size="md"
                  iconRight={ArrowRight}
                >
                  Continue to Photos & Security
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PHOTOS & CONFIDENTIAL IDENTIFIER */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Step 4 — Photos & Private Identifying Feature
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload photos and note confidential details for administrator verification
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">4 / 5</span>
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Photos of Found Item
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-emerald-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click or drag photos of found item</span>
                  <span className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WEBP (Max 5MB each)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group shadow-xs">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white shadow-sm opacity-90 hover:opacity-100 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confidential Identifier Box */}
              <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 dark:text-amber-300">
                  <Fingerprint className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Private Identifying Feature (Confidential — Hidden from Public Catalog)</span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  Note any distinguishing detail observed (e.g. replaced red silicone ear tip, student ID name inside, serial number). This is revealed strictly to administrators to evaluate claimants.
                </p>
                <textarea
                  rows={3}
                  value={privateIdentifier}
                  onChange={(e) => setPrivateIdentifier(e.target.value)}
                  placeholder="e.g. Has a replaced red silicone tip on left earbud; contains ID card of Sarah Thomas..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-amber-300 dark:border-amber-700/80 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  onClick={() => setCurrentStep(3)}
                  variant="secondary"
                  size="md"
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(5)}
                  variant="success"
                  size="md"
                  iconRight={ArrowRight}
                >
                  Proceed to Review
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & FINAL SUBMIT */}
          {currentStep === 5 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-premium space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Step 5 — Summary Review & Final Submission
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Inspect your found report before publishing it to the campus recovery network
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">5 / 5</span>
              </div>

              {/* Review summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Item Name & Category</span>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{itemName || 'Not specified'}</p>
                  <p className="text-slate-600 dark:text-slate-300">{category} • {color || 'Color unspecified'} • {brand || 'Brand unspecified'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Discovery Location & Time</span>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{locationName}</p>
                  <p className="text-slate-600 dark:text-slate-300">{zone} • {foundDate} ({foundTime})</p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 space-y-1.5">
                  <span className="text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[10px] block">Custody Location</span>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{currentLocation}</p>
                  {storageRefNumber && (
                    <p className="font-mono text-emerald-700 dark:text-emerald-300 text-xs">Security Ref: {storageRefNumber}</p>
                  )}
                </div>
              </div>

              {privateIdentifier && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs">
                  <span className="text-amber-800 dark:text-amber-400 font-bold uppercase text-[10px] block mb-1">Encrypted Secret Identifier:</span>
                  <p className="font-mono text-amber-950 dark:text-amber-200">"{privateIdentifier}"</p>
                </div>
              )}

              {/* Final Submit Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold">Ready to file your Found Report?</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Thank you for keeping our college campus safe and honest.
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    variant="secondary"
                    size="md"
                  >
                    Edit
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    variant="success"
                    size="md"
                    className="flex-1 sm:flex-initial"
                    iconRight={ArrowRight}
                  >
                    {loading ? 'Submitting report...' : 'Submit Found Report'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
