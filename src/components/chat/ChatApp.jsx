import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import React, { useState } from "react";
import VideoCallScreen from "../call/CallScreen";
import { useWebRTC } from "../../context/WebRTCContext";

export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState(null); // user
  const [chatType, setChatType] = useState("private"); // "private" or "group"

  const { calling, ...rest } = useWebRTC();

  if (calling) return <VideoCallScreen />;

  return (
   

    <div className="flex h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 shadow-md flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <ChatSidebar
            onSelectChat={(chat, type) => {
              setSelectedChat(chat);
              setChatType(type);
            }}
          />
        </div>
      </aside>

      {/* Chat Window */}
      <section className="flex-1 flex flex-col bg-gray-50">
        <ChatWindow selectedChat={selectedChat} chatType={chatType} />
      </section>
    </div>
  );
}
