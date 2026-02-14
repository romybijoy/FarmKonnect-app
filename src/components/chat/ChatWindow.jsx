import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { appConfig } from "../../config";
import { fetchMessages, upsertMessage } from "../../redux/slices/ChatSlice";
import { useWebSocket } from "../../context/WebSocketContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useWebRTC } from "../../context/WebRTCContext";
import ChatHeader from "./ChatHeader";
import GroupChatHeader from "./GroupChatHeader";
import { formatChatDate } from "../common/DateUtils";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Firebase } from "../../firebase/config";
import { fetchUserById } from "../../redux/slices/UserSlice";
import {
  addOrUpdateReaction,
  fetchReactions,
  removeReaction,
} from "../../redux/slices/ReactionsSlice";
import MediaPreviewModal from "./MediaPreviewModal";
import ImageViewerModal from "./ImageViewerModal";

export default function ChatWindow({ selectedChat, chatType }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fetchedReactionsRef = useRef(new Set());

  // const [userProfiles, setUserProfiles] = useState({});
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const dispatch = useDispatch();
  const { startCall } = useWebRTC();
  const { privateMessages, groupMessages, loading, error } = useSelector(
    (state) => state.chat,
  );
  const messages =
    chatType === "private"
      ? privateMessages[selectedChat?.id] || []
      : groupMessages[selectedChat?.id] || [];

  const { sendMessageWS, subscribeToGroup, connected } = useWebSocket();
  const navigate = useNavigate();

  const userProfiles = useSelector((state) => state.app.profiles || {});

  const reactionsMap = useSelector((state) => state.reactions.byMessageId);

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

    const existing =
      chatType === "private"
        ? privateMessages[selectedChat.id]
        : groupMessages[selectedChat.id];

    if (!existing || existing.length === 0) {
      dispatch(
        fetchMessages({
          chatId: selectedChat.id,
          chatType,
          ip: appConfig.ip,
        }),
      );
    }

    if (chatType === "group" && connected) {
      subscribeToGroup(selectedChat.id);
    }
  }, [selectedChat?.id, chatType, connected]);

  useEffect(() => {
    if (!messages.length) return;

    messages.forEach((m) => {
      // skip optimistic messages
      if (m.optimistic) return;

      // already fetched once
      if (fetchedReactionsRef.current.has(m.id)) return;

      // reactions already in store
      if (reactionsMap[m.id]) {
        fetchedReactionsRef.current.add(m.id);
        return;
      }

      //   fetch only ONCE
      fetchedReactionsRef.current.add(m.id);
      dispatch(fetchReactions(m.id));
    });
  }, [messages.length]);



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const prevLenRef = useRef(0);

  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      scrollToBottom();
    }
    prevLenRef.current = messages.length;
  }, [messages.length]);

  const onSend = async (payload) => {
    if (!connected) {
      console.warn("WS not connected - message send blocked");
      return;
    }
    const destination = "/app/chat.sendMessage";

    const tempId = `temp-${Date.now()}`;

    // 🎤 AUDIO MESSAGE
    if (payload.type === "audio") {
      const audioUrl = await uploadToFirebase(
        `voice_notes/${Date.now()}.webm`,
        payload.audioBlob,
      );

      const optimisticMessage = {
        id: tempId,
        senderId: userData.id,
        receiverId: chatType === "private" ? selectedChat.id : null,
        groupId: chatType === "group" ? selectedChat.id : null,
        type: "audio",
        fileUrl: audioUrl,
        timestamp: new Date().toISOString(),
        optimistic: true,
      };

      //   SHOW IMMEDIATELY
      dispatch(upsertMessage(optimisticMessage));

      //   SEND TO BACKEND
      sendMessageWS(destination, {
        senderId: userData.id,
        receiverId: chatType === "private" ? selectedChat.id : null,
        groupId: chatType === "group" ? selectedChat.id : null,
        type: optimisticMessage.type,
        content: optimisticMessage.content,
        fileUrl: optimisticMessage.fileUrl,
        fileName: optimisticMessage.fileName,
      });
      return;
    }

    // 📝 TEXT MESSAGE
    const optimisticMessage = {
      id: tempId,
      senderId: userData.id,
      receiverId: chatType === "private" ? selectedChat.id : null,
      groupId: chatType === "group" ? selectedChat.id : null,
      type: "text",
      content: payload.content,
      timestamp: new Date().toISOString(),
      optimistic: true,
    };

    //   SHOW IMMEDIATELY
    dispatch(upsertMessage(optimisticMessage));

    //   SEND TO BACKEND
    sendMessageWS(destination, {
      senderId: userData.id,
      receiverId: chatType === "private" ? selectedChat.id : null,
      groupId: chatType === "group" ? selectedChat.id : null,
      type: "text",
      content: payload.content,
    });
  };

  const uploadToFirebase = async (path, file) => {
    const storageRef = ref(Firebase.storage(), path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSendFile = async () => {
    if (!connected) return;

    const tempId = `temp-${Date.now()}`;

    const fileType = selectedFile.type.startsWith("image")
      ? "image"
      : selectedFile.type.startsWith("video")
        ? "video"
        : selectedFile.type === "application/pdf"
          ? "pdf"
          : "excel";

    const url = await uploadToFirebase(
      `chat_uploads/${Date.now()}_${selectedFile.name}`,
      selectedFile,
    );

    // optimistic UI
    dispatch(
      upsertMessage({
        id: tempId,
        senderId: userData.id,
        receiverId: chatType === "private" ? selectedChat.id : null,
        groupId: chatType === "group" ? selectedChat.id : null,
        type: fileType,
        fileUrl: url,
        content: caption,
        fileName: selectedFile.name,
        timestamp: new Date().toISOString(),
        optimistic: true,
      }),
    );

    // backend payload
    sendMessageWS("/app/chat.sendMessage", {
      senderId: userData.id,
      receiverId: chatType === "private" ? selectedChat.id : null,
      groupId: chatType === "group" ? selectedChat.id : null,
      type: fileType,
      fileUrl: url,
      content: caption,
      fileName: selectedFile.name,
    });

    setShowPreview(false);
    setSelectedFile(null);
    setCaption("");
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedFile(null);
    setCaption("");
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

  const handleDeleteMessage = (messageId, deleteType) => {
    console.log("DELETE CLICKED:", messageId, deleteType);

    if (!connected) {
      console.warn("WS not connected — delete blocked");
      return;
    }
    sendMessageWS("/app/chat.deleteMessage", {
      messageId,
      userId: userData.id,
      deleteType, // DELETE_FOR_ME | DELETE_FOR_EVERYONE
    });
  };

  const visibleMessages = messages.filter(
    (m) =>
      !m.deletedBy || !m.deletedBy.split(",").includes(userData.id.toString()),
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg relative shadow overflow-hidden">
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

        {visibleMessages.map((message, index) => {
          const profile = userProfiles[message.senderId];

          const showDate =
            index === 0 ||
            !dayjs(message.timestamp).isSame(
              visibleMessages[index - 1].timestamp,
              "day",
            );

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
                onImageClick={(url) => setPreviewImage(url)}
                onDelete={handleDeleteMessage}
              />
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <MessageInput
          onSend={onSend}
          selectedChat={selectedChat?.id}
          chatType={chatType}
          onFileSelect={(file) => {
            setSelectedFile(file);
            setShowPreview(true);
          }}
          caption={caption}
          setCaption={setCaption}
        />
      </div>

      {showPreview && selectedFile && (
        <MediaPreviewModal
          file={selectedFile}
          caption={caption}
          setCaption={setCaption}
          onClose={handleClosePreview}
          onSend={handleSendFile}
        />
      )}

      {previewImage && (
        <ImageViewerModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
