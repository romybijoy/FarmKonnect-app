import React from "react";
import { PiUsersThreeLight } from "react-icons/pi"; // Lightweight user group icon

const NoFollowers = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
      <div className="text-6xl text-pink-400 mb-4">
        <PiUsersThreeLight />
      </div>
      <h2 className="text-lg font-semibold">No Followers Yet</h2>
      <p className="text-sm mt-2 max-w-xs">
        You haven't gained any followers yet. Share your posts and engage with others to grow your network.
      </p>
      <button className="mt-6 px-5 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition">
        Share Something
      </button>
    </div>
  );
};

export default NoFollowers;
