import { PlusCircle, Users } from "lucide-react";

const EmptyFeed = ({
  onCreatePost,
  onFindPeople,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {/* Icon */}
      <div className="mb-4 text-[#689F38]">
        <PlusCircle size={48} />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Welcome to FarmKonnect 🌱
      </h2>

      {/* Description */}
      <p className="text-gray-600 max-w-md mb-6">
        Your feed is empty because you’re just getting started.
        Follow farmers and groups to see updates, or share your first post
        to introduce yourself.
      </p>

      {/* Actions */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={onFindPeople}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          <Users size={18} />
          Follow People
        </button>

        <button
          onClick={onCreatePost}
          className="px-6 py-2.5 rounded-full bg-[#689F38] text-white hover:opacity-90 transition"
        >
          Create Your First Post
        </button>
      </div>

      {/* Tip */}
      <p className="mt-6 text-sm text-gray-400">
        Tip: Following 3–5 people will start filling your feed.
      </p>
    </div>
  );
};

export default EmptyFeed;
