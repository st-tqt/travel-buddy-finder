import React from 'react';

export default function Skeleton({ variant = 'text', lines = 1 }) {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  if (variant === 'card') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
        <div className="h-48 bg-gray-200 animate-pulse"></div>
        <div className="p-6 space-y-4 flex-grow">
          <div className="h-6 bg-gray-200 animate-pulse w-3/4 rounded"></div>
          <div className="h-4 bg-gray-200 animate-pulse w-1/2 rounded"></div>
          <div className="h-4 bg-gray-200 animate-pulse w-5/6 rounded"></div>
          <div className="h-10 bg-gray-200 animate-pulse w-full rounded-lg mt-auto"></div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3 p-4">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center p-3 border rounded bg-white">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-xl shadow flex items-center gap-6 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="h-40 bg-gray-200 animate-pulse rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div key={i} className={`${baseClass} h-4 w-full`}></div>
      ))}
    </div>
  );
}
