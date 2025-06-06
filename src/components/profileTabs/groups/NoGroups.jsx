import React from "react";
import { HiOutlineUserGroup } from "react-icons/hi";

const NoGroups = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
      <div className="text-6xl text-green-400 mb-4">
        <HiOutlineUserGroup />
      </div>
      <h2 className="text-lg font-semibold">You're Not in Any Groups</h2>
      <p className="text-sm mt-2 max-w-xs">
        Join a group to connect with like-minded people and explore shared interests.
      </p>
      <button className="mt-6 px-5 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition">
        Browse Groups
      </button>
    </div>
  );
};

export default NoGroups;
