import React, { useState } from "react";
import { AiOutlineTable } from "react-icons/ai";
import { BiBookmark } from "react-icons/bi";
import { RiUserFollowLine, RiUserAddLine } from "react-icons/ri";
import { BiRevision } from "react-icons/bi";
import { useSelector } from "react-redux";

import Followers from "../profileTabs/followers/Followers";
import Following from "../profileTabs/following/Following";
import SavedPosts from "../posts/SavedPosts";
import PostsList from "../posts/PostsList";
import UserAppealsPage from "./UserAppealsPage";

const ProfilePostsPart = ({ user, post }) => {
  const [activeTab, setActiveTab] = useState("Post");

  const loggedInUserId = useSelector(
    (state) => state.auth?.userInfo?.userId
  );

  const isOwnProfile = loggedInUserId === user?.id;

  const renderComponent = () => {
    switch (activeTab) {
      case "Post":
        return <PostsList posts={post} isFeed={false} />;

      case "Followers":
        return (
          <Followers
            profileUserId={user.id ? user.id : user.userId}
            viewerId={loggedInUserId}
          />
        );

      case "Following":
        return (
          <Following
            profileUserId={user.id ? user.id : user.userId}
            viewerId={loggedInUserId}
          />
        );

      case "Saved Posts":
        return isOwnProfile ? (
          <SavedPosts userId={loggedInUserId} />
        ) : (
          <NoAccess />
        );

        case "Appeals":
        return isOwnProfile ? (
          <UserAppealsPage userId={loggedInUserId} />
        ) : (
          <NoAccess />
        );

      default:
        return null;
    }
  };

  const tabs = [
    { tab: "Post", icon: <AiOutlineTable /> },
    { tab: "Followers", icon: <RiUserFollowLine /> },
    { tab: "Following", icon: <RiUserAddLine /> },
    ...(isOwnProfile
      ? [{ tab: "Saved Posts", icon: <BiBookmark /> }]
      : []),
      ...(isOwnProfile
      ? [{ tab: "Appeals", icon: <BiRevision /> }]
      : [])
  ];

  return (
    <div className="p-4 w-full">
      {/* Tabs */}
      <div className="flex flex-wrap gap-6 border-t border-gray-200 py-3">
        {tabs.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex items-center gap-2 text-sm md:text-base px-3 py-1 border-b-2 transition-all duration-300 ${
              activeTab === item.tab
                ? "border-[#689F38] text-[#689F38] font-semibold"
                : "border-transparent text-gray-500 hover:text-[#689F38]"
            }`}
          >
            {item.icon}
            <span>{item.tab}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4 min-h-[200px]">{renderComponent()}</div>
    </div>
  );
};

const NoAccess = () => (
  <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
    <span className="text-4xl mb-2">🔒</span>
    <p className="text-sm font-medium">Private content</p>
  </div>
);

export default ProfilePostsPart;
