import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
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
import { formatChatDate } from "../common/DateUtils";

import { fetchUserById } from "../../redux/slices/UserSlice";
import { addOrUpdateReaction, fetchReactions, removeReaction } from "../../redux/slices/ReactionsSlice";

export default function ChatWindow({ selectedChat, chatType }) {
  // const [userProfiles, setUserProfiles] = useState({});
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const dispatch = useDispatch();
  const { startCall } = useWebRTC();
  const { privateMessages, groupMessages, loading, error } = useSelector(
    (state) => state.chat
  );
  const messages =
    chatType === "private"
      ? privateMessages[selectedChat?.id] || []
      : groupMessages[selectedChat?.id] || [];

  const { sendMessageWS, subscribeToGroup, connected } = useWebSocket();
  const navigate = useNavigate();

  const userProfiles = useSelector((state) => state.app.profiles || {});

  const reactionsMap = useSelector(state => state.reactions.byMessageId);

  useEffect(() => {
    const uniqueSenderIds = [...new Set(messages.map((msg) => msg.senderId))];

    uniqueSenderIds.forEach((id) => {
      if (!userProfiles[id]) {
        dispatch(fetchUserById(id));
      }
    });
  }, [messages, dispatch, userProfiles]);

  useEffect(() => {
    if (!selectedChat) return;

    dispatch(
      fetchMessages({ chatId: selectedChat?.id, chatType, ip: appConfig.ip })
    );

    if (chatType === "group" && connected) {
      subscribeToGroup(selectedChat?.id);
    }
  }, [selectedChat?.id, chatType, dispatch, connected, subscribeToGroup]);

   useEffect(() => {
    messages.forEach((message) => {
      dispatch(fetchReactions(message.id));
    });
  }, [messages, dispatch]);

  const onSend = (message) => {
    if (!connected) {
      console.warn("WebSocket is not connected. Please wait...");
      return;
    }

    const destination = "/app/chat.sendMessage";
    sendMessageWS(destination, message);

    if (chatType === "private") {
      // dispatch(addMessage({ message, currentUserId: userData.id }));
    } else {
      dispatch(addGroupMessage({ chatId: selectedChat?.id, message }));
    }
  };

  const handleCall = (type) => {
    navigate(`/call/${selectedChat.id}`, {
      state: {
        selectedChat,
        callType: type,
      },
    });
  };

  const handleReact = (messageId, emoji) => {
    const userId = userData.id;

    const existingReactions = reactionsMap[messageId] || [];
    const myReaction = existingReactions.find((r) => r.userId === userId);

    if (myReaction?.emoji === emoji) {
      dispatch(removeReaction({ messageId, userId }));
    } else {
      dispatch(addOrUpdateReaction({ messageId, userId, emoji }));
    }
  };
  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow overflow-hidden">
      {/* Header */}
      {chatType === "private" && selectedChat && (
        <ChatHeader selectedChat={selectedChat} onCall={handleCall} />
      )}

      {chatType === "group" && selectedChat && (
        <GroupChatHeader groupInfo={selectedChat} />
      )}

      {/* Messages */}
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

        {messages.map((message, index) => {
          const profile = userProfiles[message.senderId];

          const showDate =
            index === 0 ||
            !dayjs(message.timestamp).isSame(
              messages[index - 1].timestamp,
              "day"
            );

          const isSameSender =
            index > 0 && messages[index - 1].senderId === message.senderId;

          return (
            <div className="mt-3" key={message.id}>
              {showDate && (
                <div className="flex justify-center my-2">
                  <span className="text-xs text-gray-500 bg-white px-3 py-2 rounded-full shadow">
                    {formatChatDate(message.timestamp)}
                  </span>
                </div>
              )}

              <MessageBubble
                messageId={message.id}
                message={message}
                currentUserId={userData.id}
                chatType={chatType}
                senderProfile={profile}
                onReact={handleReact}
                reactions={reactionsMap[message.id] || []} 
              />
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
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
