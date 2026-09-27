import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Shield,
  Fingerprint
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    // Frontend validation: Gmail only
    if (!normalizedEmail.endsWith('@gmail.com')) {
      setError('Enter a valid college or registered email address ending with @gmail.com.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      setLoading(true);
      await login(normalizedEmail, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Email or password is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Left Column: SaaS Branding & 3D Visual (Desktop Only) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden hidden lg:flex border-r border-indigo-500/10">
          {/* Background Glows */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10 space-y-2">
            <Logo textClass="text-2xl text-white" badgeClass="text-cyan-300" />
            <p className="text-xs text-slate-300 mt-2 font-normal leading-relaxed">
              Official Digital Lost & Found Portal for college campus students and security administration.
            </p>
          </div>

          {/* Middle Feature Highlights */}
          <div className="relative z-10 space-y-3.5 my-8">
            <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/10 dark:bg-slate-800/40 p-3.5 rounded-2xl backdrop-blur-xl border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Campus Security Handover desk verified network</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/10 dark:bg-slate-800/40 p-3.5 rounded-2xl backdrop-blur-xl border border-white/10">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Automated 7-factor similarity matching</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-200 bg-white/10 dark:bg-slate-800/40 p-3.5 rounded-2xl backdrop-blur-xl border border-white/10">
              <Fingerprint className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Confidential private identifier protection</span>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 text-[11px] text-slate-400 border-t border-white/10 pt-4">
            <span>© 2026 CampusFind • Secure College Authentication</span>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            {/* Header */}
            <div className="mb-6 lg:mb-8 text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-4">
                <Logo />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Sign in to continue to CampusFind and manage your reports
              </p>
            </div>

            {/* Quick-Fill Demo Credentials Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 mb-6">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>One-Click Demo Credentials:</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('student@gmail.com', 'Campus@123')}
                  className="p-2.5 rounded-xl text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs text-xs transition-all cursor-pointer group"
                >
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Student Aarav</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">student@gmail.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@gmail.com', 'Admin@123')}
                  className="p-2.5 rounded-xl text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs text-xs transition-all cursor-pointer group"
                >
                  <p className="font-bold text-amber-800 dark:text-amber-400 group-hover:text-amber-600">Security Admin</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">admin@gmail.com</p>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-2xl mb-6 flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  College Email (@gmail.com)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full pl-10 pr-3.5 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                variant="primary"
                size="md"
                className="w-full mt-2"
                iconRight={ArrowRight}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>

          {/* Bottom Prompt */}
          <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
