import React, { useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { appConfig } from "../../config";
import {
  fetchMessages,
  receiveChatMessage,
  addMessage,
  addGroupMessage,
} from "../../redux/slices/ChatSlice";
import { useWebSocket } from '../../context/WebSocketContext';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ChatWindow({ selectedChat, chatType }) {
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.chat);
  const { sendMessageWS, subscribeToGroup } = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedChat) return;

    // fetch chat messages for the selected chat
    dispatch(fetchMessages({ chatId: selectedChat, chatType, ip: appConfig.ip }));

    // subscribe to group channel if it's group chat
    if (chatType === "group") {
      subscribeToGroup(selectedChat);
    }

  }, [selectedChat, chatType, dispatch, subscribeToGroup]);

  const onSend = (savedMessage) => {
    const destination =
      chatType === "private"
        ? `/app/private/${selectedChat}`
        : `/app/group/${selectedChat}`;

    sendMessageWS(destination, savedMessage);

    // Optimistic Redux update
    if (chatType === "private") {
      dispatch(addMessage(savedMessage));
    } else {
      dispatch(addGroupMessage(savedMessage));
    }
  };

  //call handler
  const handleCall = (type) => {
    if (!selectedChat) {
      alert("Please select a chat first.");
      return;
    }
    navigate(`/call?type=${type}&to=${selectedChat}`);
  };

  return (
    <div className="flex flex-col flex-1 bg-white rounded-lg shadow-inner">
      {chatType === "private" && selectedChat && (
        <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-300">
          <div className="font-semibold text-gray-800">
            {selectedChat}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCall("audio")}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
              title="Audio Call"
            >
              🎧
            </button>
            <button
              onClick={() => handleCall("video")}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              title="Video Call"
            >
              🎥
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 px-6 py-4 overflow-y-auto bg-gray-100">
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
          <MessageBubble key={msg.id} message={msg} currentUserId={userData.id} />
        ))}
      </div>

      <div className="border-t border-gray-300 bg-white px-4 py-3">
        <MessageInput
          onSend={onSend}
          selectedChat={selectedChat}
          chatType={chatType}
        />
      </div>
    </div>
  );
}
