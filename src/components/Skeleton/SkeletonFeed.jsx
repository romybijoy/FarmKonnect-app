export default function SkeletonFeed() {
  return (
    <div className="space-y-6 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 bg-white rounded-xl shadow animate-pulse">
          {/* Profile row */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-300" />
            <div className="flex-1">
              <div className="w-32 h-4 bg-gray-300 rounded mb-2" />
              <div className="w-20 h-3 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Post image block */}
          <div className="w-full h-64 bg-gray-300 rounded-lg mt-4" />

          {/* Text lines */}
          <div className="w-3/4 h-3 bg-gray-300 rounded mt-4" />
          <div className="w-1/2 h-3 bg-gray-200 rounded mt-2" />
        </div>
      ))}
    </div>
  );
}
