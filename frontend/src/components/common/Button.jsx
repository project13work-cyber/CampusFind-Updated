import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'accent'
  size = 'md', // 'sm', 'md', 'lg'
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5 min-h-[34px]',
    md: 'px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl gap-2 min-h-[42px]',
    lg: 'px-6 py-3.5 text-sm sm:text-base font-bold rounded-2xl gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 border border-indigo-500/20',
    accent:
      'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/25 hover:shadow-lg hover:shadow-cyan-600/35 hover:-translate-y-0.5 active:translate-y-0 border border-cyan-500/20',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80 hover:-translate-y-0.5 active:translate-y-0 shadow-sm',
    outline:
      'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 hover:-translate-y-0.5 active:translate-y-0 shadow-sm',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35 hover:-translate-y-0.5 active:translate-y-0 border border-rose-500/20',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 border border-emerald-500/20',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.primary} ${
        isDisabled ? 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none pointer-events-none' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  );
}
