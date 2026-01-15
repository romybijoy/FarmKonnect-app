import React, { useEffect, useRef, useState } from "react";

export default function ReactionPopup({
  messageId,
  groupedReactions,
  reactions,
  onClose,
  onRemove,
  onReact,
}) {
  const popupRef = useRef(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const allReactions = reactions;
  const reactionTabs = Object.keys(groupedReactions);
  const getReactionsByEmoji = (emoji) => groupedReactions[emoji] || [];

  const displayedReactions =
    activeTab === "All" ? allReactions : getReactionsByEmoji(activeTab);

  return (
    <div
      ref={popupRef}
      className="absolute bg-white shadow-lg rounded-xl p-4 z-50 w-72 border border-gray-200 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Tabs */}
      <div className="flex space-x-2 border-b pb-2 mb-2 overflow-x-auto">
        <Tab
          label="All"
          count={allReactions.length}
          isActive={activeTab === "All"}
          onClick={() => setActiveTab("All")}
        />
        {reactionTabs.map((emoji) => (
          <Tab
            key={emoji}
            label={emoji}
            count={getReactionsByEmoji(emoji).length}
            isActive={activeTab === emoji}
            onClick={() => setActiveTab(emoji)}
          />
        ))}
      </div>

      {/* Reactions List */}
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
        {displayedReactions.length > 0 ? (
          displayedReactions.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm group"
            >
              <div className="flex items-center space-x-2">
                <img
                  src={r.userImage || "/profile.png"}
                  alt={r.userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  {r.isSelf ? (
                    <>
                      <span>You</span>
                      <br />
                      <button onClick={() => onReact(messageId, r.emoji)}>
                        Tap to remove
                      </button>
                    </>
                  ) : (
                    <span>{r.userName}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-xl">{r.emoji}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-sm text-center py-4">
            No reactions
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Tab component
const Tab = ({ label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded font-medium whitespace-nowrap text-sm transition-colors duration-200 ${
      isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
    }`}
    aria-pressed={isActive}
  >
    {label} {count}
  </button>
);
