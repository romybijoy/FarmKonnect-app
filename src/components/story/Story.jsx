import React, { useEffect, useState } from "react";
import { showStory } from "../../redux/slices/StorySlice";
import { useDispatch, useSelector } from "react-redux";
import CreateStoryModal from "./CreateStoryModal";
import { NavLink } from "react-router-dom";

function Story({ onSelect }) {
  const dispatch = useDispatch();
  const { stories } = useSelector((state) => state.story);

  const userId = useSelector((state) => state.auth?.userInfo?.userId);

  const handleAddStory = () => {
    <CreateStoryModal />;

    // TODO: Replace this with a real modal or navigation to uploader
  };

  useEffect(() => {
    if (userId) {
      dispatch(showStory(userId));
    }
  }, [userId]);

  return (
    <div className="flex space-x-4 overflow-x-auto p-2 border rounded-lg bg-white shadow mt-5">
      <NavLink to="/addStory" className="link-clean">
        <div className="flex flex-col items-center cursor-pointer group">
          {/* Animated Ring */}
          <div className="relative w-16 h-16 rounded-full animate-story-ring">
            {/* Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-[#689F38]" />

            {/* Inner Button */}
            <button className="absolute inset-1 rounded-full bg-[#689F38] flex items-center justify-center hover:bg-[#5a8c30] transition">
              <img
                src="https://cdn-icons-png.flaticon.com/512/748/748113.png"
                alt="Add Story"
                className="w-6 h-6"
              />
            </button>
          </div>

          <span className="text-xs mt-1 text-black text-center group-hover:opacity-80">
            Your Story
          </span>
        </div>
      </NavLink>
      {stories.map((story) => (
        <div
          key={story.userId}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => onSelect(story)}
        >
          <div className="w-16 h-16 rounded-full p-1 border-2 border-pink-500">
            <img
              src={story.profilePic || "/profile.png"}
              alt="story"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="text-xs mt-1 text-center">{story.userName}</span>
        </div>
      ))}
    </div>
  );
}

export default Story;
