import React, { useState } from "react";

import { sendChatMessage } from "../../redux/slices/ChatSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
export default function MessageInput({ onSend, selectedChat, chatType }) {
  const [text, setText] = useState("");
  const dispatch = useDispatch();
const userData = JSON.parse(localStorage.getItem("myInfo"));

  const handleSend = async () => {
    if (!text.trim()) return;

     const message = {
      content: text,
      receiverId: chatType === "private" ? selectedChat : null,
      senderId: userData.id,
      groupId: chatType === "group" ? selectedChat : null,
    };


      try {
    const saved = await dispatch(sendChatMessage(message)).unwrap(); // Save to DB via thunk
    onSend(saved); // Send over WebSocket in ChatWindow
    setText("");
  } catch (error) {
    console.error("Failed to send message", error);
  }
  };

  return (
    <div className="p-4 border-t flex">
      <input
        className="flex-1 border rounded-xl px-4 py-2 mr-2"
        placeholder="Type your message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-xl">Send</button>
    </div>
  );
}
