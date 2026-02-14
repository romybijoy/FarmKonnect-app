import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import React, { useEffect, useState } from "react";
import VideoCallScreen from "../call/CallScreen";
import { useWebRTC } from "../../context/WebRTCContext";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState("private");
  const { calling } = useWebRTC();
  const location = useLocation();
  const activeConversationId = location.state?.activeConversationId;
  const conversations = useSelector((state) => state.chat.conversations || []);

  const handleChatsLoaded = (chats) => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
      setChatType("private");
    }
  };

useEffect(() => {
    if (activeConversationId && conversations.length > 0) {
      const conversation = conversations.find(
        (c) => c.id === activeConversationId
      );

      if (conversation) {
        setSelectedChat(conversation);
        setChatType(conversation.isGroup ? "group" : "private");
      }
    }
  }, [activeConversationId, conversations]);


  // if (calling) return <VideoCallScreen />;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 shadow-md">
        <ChatSidebar
          selectedChat={selectedChat}
          chatType={chatType}
          onSelectChat={(chat, type) => {
            setSelectedChat(chat);
            setChatType(type);
          }}
          onChatsLoaded={handleChatsLoaded}
        />
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedChat ? (
          <ChatWindow selectedChat={selectedChat} chatType={chatType} />
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500 text-lg">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
