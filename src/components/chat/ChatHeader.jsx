import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPresence } from "../../redux/slices/PresenceSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { makeSelectUserPresence } from "../../selectors/PresenceSelector";

dayjs.extend(relativeTime);

const ChatHeader = ({ selectedChat, onCall }) => {
  const dispatch = useDispatch();
  const presence = useSelector(makeSelectUserPresence(selectedChat?.id));
  const typingByEmail = useSelector((state) => state.typing.typingByEmail);
  const isTyping = selectedChat?.email && typingByEmail[selectedChat.email];

  useEffect(() => {
    if (!selectedChat?.id) return;
    dispatch(fetchPresence(selectedChat?.id));
    const interval = setInterval(
      () => dispatch(fetchPresence(selectedChat?.id)),
      10000
    );
    return () => clearInterval(interval);
  }, [dispatch, selectedChat?.id]);

  const renderStatus = () => {
    if (!presence) return null;

    if (isTyping) {
      return <span className="text-purple-500 animate-pulse">Typing...</span>;
    }

    if (presence.online) {
      return <span className="text-[#689F38] font-medium">Online</span>;
    }

    if (presence.lastSeen) {
      return (
        <span className="text-[#689F38]">
          Last seen {dayjs(presence.lastSeen).fromNow()}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src={selectedChat?.profilePicture || "/profile.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-base text-gray-900">
            {selectedChat?.username}
          </span>
          <span className="text-sm">
            {presence ? (
              renderStatus()
            ) : (
              <span className="text-gray-400">Loading...</span>
            )}
          </span>

          {typingByEmail?.[selectedChat?.id] && (
            <p className="text-sm text-gray-500">
              {typingByEmail?.[selectedChat?.id]} is typing...
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onCall("audio")}
          className="bg-[#3B82F6] hover:bg-blue-600 text-white p-2 rounded-full shadow"
          title="Start audio call"
        >
          📞
        </button>
        <button
          onClick={() => onCall("video")}
          className="bg-[#689F38] hover:bg-[#5a8c30] text-white p-2 rounded-full shadow"
          title="Start video call"
        >
          🎥
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
