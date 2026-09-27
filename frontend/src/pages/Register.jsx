import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import {
  User,
  Mail,
  CreditCard,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Fingerprint
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  // Password rules evaluation
  const pass = formData.password;
  const checks = {
    length: pass.length >= 8,
    upper: /[A-Z]/.test(pass),
    lower: /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
  };
  const passedCount = Object.values(checks).filter(Boolean).length;
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = formData.email.trim().toLowerCase();

    // Frontend strict Gmail validation
    if (!normalizedEmail.endsWith('@gmail.com')) {
      setError('Enter a valid college email address ending with @gmail.com.');
      return;
    }

    if (!formData.password) {
      setError('Password is required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passedCount < 4) {
      setError('Please choose a stronger password satisfying security requirements.');
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        email: normalizedEmail
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Left Column: Visual & Trust Pillars (Desktop Only) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden hidden lg:flex border-r border-indigo-500/10">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <Logo textClass="text-2xl text-white" badgeClass="text-cyan-300" />
            <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
              Join the student network to instantly locate, track, and recover your lost college belongings.
            </p>
          </div>

          <div className="relative z-10 space-y-3.5 my-8">
            <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-800/40 backdrop-blur-xl border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Student Directory</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Connects registered student roll numbers with college security desks.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-800/40 backdrop-blur-xl border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <Fingerprint className="w-4 h-4" />
                <span>Zero Public Exposure</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Your phone and secret private identifiers are shielded from the public feed.
              </p>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 border-t border-white/10 pt-4">
            <span>© 2026 CampusFind • Fast College Registration</span>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            <div className="mb-6 text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-4">
                <Logo />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create your CampusFind account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Register with your college Gmail address to begin
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-2xl mb-5 flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Legal Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Aarav Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Gmail Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  College Email (@gmail.com) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Student ID & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID / Roll No <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="2024CS014"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm uppercase font-mono rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 00001"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    {passwordsMatch && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Match
                      </span>
                    )}
                    {passwordsMismatch && (
                      <span className="text-[11px] text-rose-500 font-bold flex items-center gap-0.5">
                        <X className="w-3 h-3" /> Mismatch
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                        passwordsMismatch
                          ? 'border-rose-400 focus:ring-rose-500'
                          : passwordsMatch
                          ? 'border-emerald-400 focus:ring-emerald-500'
                          : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Live Password Strength Meter */}
              {formData.password && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Password Strength:</span>
                    <span
                      className={
                        passedCount >= 4
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : passedCount >= 3
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }
                    >
                      {passedCount >= 4 ? 'Strong' : passedCount >= 3 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passedCount >= 4
                          ? 'bg-emerald-500 w-full'
                          : passedCount >= 3
                          ? 'bg-amber-500 w-3/5'
                          : 'bg-rose-500 w-1/4'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className={`flex items-center gap-1 ${checks.length ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                      <Check className={`w-3 h-3 ${checks.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} /> 8+ Characters
                    </span>
                    <span className={`flex items-center gap-1 ${checks.upper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                      <Check className={`w-3 h-3 ${checks.upper ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} /> Uppercase
                    </span>
                    <span className={`flex items-center gap-1 ${checks.lower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                      <Check className={`w-3 h-3 ${checks.lower ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} /> Lowercase
                    </span>
                    <span className={`flex items-center gap-1 ${checks.number ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                      <Check className={`w-3 h-3 ${checks.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} /> Number (0-9)
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                loading={loading}
                variant="primary"
                size="md"
                className="w-full mt-2"
                iconRight={ArrowRight}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </div>

          <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
