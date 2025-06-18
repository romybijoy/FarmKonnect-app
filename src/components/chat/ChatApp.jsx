import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import React, { useState } from "react";

export default function ChatApp() {
  const [selectedChat, setSelectedChat] = useState(null); // userId or groupId
  const [chatType, setChatType] = useState("private"); // "private" or "group"

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
