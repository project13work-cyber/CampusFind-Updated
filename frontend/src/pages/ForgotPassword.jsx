import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@gmail.com')) {
      setError('Please provide a valid Gmail address ending with @gmail.com.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.forgotPassword({ email: normalizedEmail });
      setMessage(res.message || 'Password reset instructions generated.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err) {
      setError(err.message || 'Failed to process password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/60 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-9 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-premium">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Logo showText={false} iconSize="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Reset Password</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter your registered Gmail address to receive a secure recovery token
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
            {resetToken && (
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all select-all shadow-xs">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-bold uppercase mb-1">Generated Reset Token:</p>
                {resetToken}
                <div className="mt-3 text-right">
                  <Link
                    to={`/reset-password?token=${resetToken}`}
                    className="inline-block px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-sans font-bold shadow-xs transition-colors"
                  >
                    Set New Password →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Registered Gmail Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            variant="primary"
            size="md"
            className="w-full mt-2"
            iconRight={ArrowRight}
          >
            Request Password Reset
          </Button>
        </form>

        <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link to="/login" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
