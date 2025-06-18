import React from "react";

export default function MessageBubble({ message, currentUserId }) {
  const isSentByMe = message.senderId === currentUserId;

  return (
    <div className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[60%] px-4 py-2 rounded-lg shadow 
          ${isSentByMe ? "bg-green-500 text-white" : "bg-gray-300 text-black"}`}
      >
        {message.content}
      </div>
    </div>
  );
}

