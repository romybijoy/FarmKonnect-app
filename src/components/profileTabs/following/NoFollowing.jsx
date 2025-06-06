import React from "react";
import { BiUserX } from "react-icons/bi";

const NoFollowing = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
      <div className="text-6xl text-blue-400 mb-4">
        <BiUserX />
      </div>
      <h2 className="text-lg font-semibold">No Following Found</h2>
      <p className="text-sm mt-2 max-w-sm">
        You're not following anyone yet. Start exploring and follow users to see their updates here.
      </p>
      <button className="mt-6 px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
        Discover People
      </button>
    </div>
  );
};

export default NoFollowing;
