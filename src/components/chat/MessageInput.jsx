import React, { useState } from "react";

import { sendChatMessage } from "../../redux/slices/ChatSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
export default function MessageInput({
  onSend,
  selectedChat,
  chatType,
  disabled,
}) {
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

    onSend(message);
    setText("");
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
      <button
        disabled={disabled}
        onClick={handleSend}
        className="bg-blue-500 text-white px-4 py-2 rounded-xl"
      >
        Send
      </button>
    </div>
  );
}
