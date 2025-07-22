import React, { useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { appConfig } from "../../config";
import {
  fetchMessages,
  addMessage,
  addGroupMessage,
} from "../../redux/slices/ChatSlice";
import { useWebSocket } from "../../context/WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useWebRTC } from "../../context/WebRTCContext";
import ChatHeader from "./ChatHeader";
import GroupChatHeader from "./GroupChatHeader";

export default function ChatWindow({ selectedChat, chatType }) {
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  console.log(selectedChat);
  const dispatch = useDispatch();
  const { startCall } = useWebRTC();
  const { privateMessages, groupMessages, loading, error } = useSelector(
    (state) => state.chat
  );
  // Get correct message list based on chat type
  const messages =
    chatType === "private"
      ? privateMessages[selectedChat?.id] || []
      : groupMessages[selectedChat?.id] || [];

  const { sendMessageWS, subscribeToGroup, connected } = useWebSocket();
  const navigate = useNavigate();

  // Fetch messages and subscribe (only subscribe to group channel)
  useEffect(() => {
    if (!selectedChat) return;

    dispatch(
      fetchMessages({ chatId: selectedChat?.id, chatType, ip: appConfig.ip })
    );

    if (chatType === "group" && connected) {
      subscribeToGroup(selectedChat?.id);
    }
  }, [selectedChat?.id, chatType, dispatch, connected, subscribeToGroup]);

  const onSend = (message) => {
    if (!connected) {
      console.warn("WebSocket is not connected. Please wait...");
      return;
    }

    const destination = "/app/chat.sendMessage";
    sendMessageWS(destination, message); // WebSocket call

    // Optimistic UI update
    if (chatType === "private") {
      // dispatch(addMessage({ message,currentUserId: userData.id}));
    } else {
      dispatch(addGroupMessage({ chatId: selectedChat?.id, message }));
    }
  };

  const handleCall = (type) => {
    if (!selectedChat?.id) {
      alert("Please select a chat first.");
      return;
    }
    navigate(`/call?type=${type}&to=${selectedChat?.id}`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-inner">
      {/* Header */}
      {chatType === "private" && selectedChat && (
        <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-300">
          <div className="flex items-center gap-3">
            <img
              src={selectedChat?.profilePicture || "profile.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <ChatHeader
              email={selectedChat?.email}
              username={selectedChat?.username}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate(`/call/video/${selectedChat?.id}`, {
                  state: { selectedChat },
                })
              }
              className="p-2 bg-blue-500 rounded text-white"
            >
              🎥
            </button>
          </div>
        </div>
      )}

      {chatType === "group" && selectedChat && (
        <GroupChatHeader groupInfo={selectedChat} />
      )}

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-100">
        {loading && (
          <div className="text-center text-sm text-gray-500">
            Loading messages...
          </div>
        )}
        {error && (
          <div className="text-center text-sm text-red-500">
            Error: {error.message}
          </div>
        )}
        {!loading && messages?.length === 0 && (
          <div className="text-center text-gray-400 italic mt-10">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages?.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUserId={userData.id}
          />
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-300 px-4 py-3">
        <MessageInput
          onSend={onSend}
          selectedChat={selectedChat?.id}
          chatType={chatType}
          disabled={!connected}
        />
      </div>
    </div>
  );
}
