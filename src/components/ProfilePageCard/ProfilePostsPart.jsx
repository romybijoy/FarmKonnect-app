import React, { useEffect, useState } from "react";
import { AiOutlineTable, AiOutlineUser } from "react-icons/ai";
import { RiVideoLine } from "react-icons/ri";
import { BiBookmark } from "react-icons/bi";

import Post from "../posts/Post";
import Followers from "../profileTabs/followers/Followers";
import Following from "../profileTabs/following/Following";
import Groups from "../profileTabs/groups/Groups";

const ProfilePostsPart = ({ user, post }) => {
  const [activeTab, setActiveTab] = useState("Post");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    setTimeout(() => {
      switch (activeTab) {
        case "Post":
          setData([
            { id: 1, content: "Post 1" },
            { id: 2, content: "Post 2" },
          ]);
          break;
        case "Followers":
          setData([]); // simulate no followers
          break;
        case "Following":
          setData([{ id: 1, name: "User A" }]);
          break;
        case "Groups":
          setData([]); // simulate no groups
          break;
        default:
          setData([]);
      }
      setLoading(false);
    }, 500);
  }, [activeTab, user?.id]);

  const renderComponent = () => {
    switch (activeTab) {
      case "Post":
        return <Post data={post} />;
      case "Followers":
        return <Followers data={data} />;
      case "Following":
        return <Following data={data} />;
      case "Groups":
        return <Groups data={data} />;
      default:
        return null;
    }
  };

  const renderNoData = (label) => (
    <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
      <span className="text-4xl mb-2">📭</span>
      <p className="text-sm font-medium">No {label} found</p>
    </div>
  );

  const tabs = [
    { tab: "Post", icon: <AiOutlineTable /> },
    { tab: "Followers", icon: <RiVideoLine /> },
    { tab: "Following", icon: <BiBookmark /> },
    { tab: "Groups", icon: <AiOutlineUser /> },
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
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-blue-500"
            }`}
          >
            {item.icon}
            <span>{item.tab}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4 min-h-[200px]">
        {loading ? (
          <p className="text-center text-gray-500 py-6">Loading...</p>
        ) : (
          renderComponent()
        )}
      </div>
    </div>
  );
};

export default ProfilePostsPart;
