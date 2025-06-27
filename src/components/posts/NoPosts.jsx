import React from "react";
import { MdOutlinePostAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const NoPosts = () => {
const navigate = useNavigate();
   const handleNavigation = () => {
    navigate("/addPost"); // Navigate to the "creat post" page
  };
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
      <div className="text-6xl text-indigo-400 mb-4">
        <MdOutlinePostAdd />
      </div>
      <h2 className="text-lg font-semibold">No Posts Yet</h2>
      <p className="text-sm mt-2 max-w-xs">
        You haven’t shared anything yet. Create your first post to start the conversation!
      </p>
      <button className="mt-6 px-5 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition" onClick={handleNavigation}>
        Create Post
      </button>
    </div>
  );
};

export default NoPosts;
