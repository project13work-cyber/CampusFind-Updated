import React from 'react';

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 shadow-sm overflow-hidden"
        >
          {/* Image Skeleton */}
          <div className="w-full h-48 rounded-2xl skeleton-shimmer" />

          {/* Content Skeleton */}
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <div className="w-16 h-5 rounded-md skeleton-shimmer" />
              <div className="w-12 h-5 rounded-md skeleton-shimmer" />
            </div>
            <div className="w-3/4 h-5 rounded-lg skeleton-shimmer" />
            <div className="w-full h-3 rounded skeleton-shimmer" />
            <div className="w-2/3 h-3 rounded skeleton-shimmer" />
          </div>

          {/* Footer Skeleton */}
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <div className="w-24 h-4 rounded skeleton-shimmer" />
            <div className="w-20 h-7 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}
