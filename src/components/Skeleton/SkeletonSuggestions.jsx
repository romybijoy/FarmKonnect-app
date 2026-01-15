// SkeletonSuggestions.jsx
import React from "react";

export default function SkeletonSuggestions() {
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow rounded-xl mt-5">
      <div className="flex items-center justify-between mb-4">
        <div className="w-32 h-4 bg-gray-300 rounded animate-pulse" />
        <div className="w-10 h-3 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div>
                <div className="w-24 h-3 bg-gray-300 rounded mb-2" />
                <div className="w-16 h-2 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="w-16 h-7 rounded-full bg-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
