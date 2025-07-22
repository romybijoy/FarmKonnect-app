import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import React, { useState } from "react";
import VideoCallScreen from "../call/CallScreen";
import { useWebRTC } from "../../context/WebRTCContext";

export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState("private");
  const { calling } = useWebRTC();

  const handleChatsLoaded = (chats) => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
      setChatType("private");
    }
  };

  if (calling) return <VideoCallScreen />;
console.log(selectedChat, chatType)
  return (
    <div className="flex h-screen">
      {/* ChatSidebar fixed within content section, not full page sidebar */}
      <div className="w-72 border-r border-gray-200 bg-white shadow-md">
        <ChatSidebar
          onSelectChat={(chat, type) => {
            setSelectedChat(chat);
            setChatType(type);
          }}
          onChatsLoaded={handleChatsLoaded}
        />
      </div>

      {/* ChatWindow scrollable */}
      <div className="flex-1 overflow-y-auto">
        {selectedChat ? (
          <ChatWindow selectedChat={selectedChat} chatType={chatType} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading chat...
          </div>
        )}
      </div>
    </div>
  );
}
