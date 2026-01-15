import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { FaSmile } from "react-icons/fa";
import Picker from "emoji-picker-react";
import ReactionPopup from "./ReactionPopup";
import EmojiPickerWrapper from "./EmojiPickerWrapper";
import { MdBlock } from "react-icons/md";

export default function MessageBubble({
  messageId,
  message,
  currentUserId,
  chatType,
  senderProfile,
  reactions = [],
  onReact,
  onImageClick,
  onDelete,
}) {
  const isSentByMe = message.senderId === currentUserId;
  const [showPicker, setShowPicker] = useState(false);
  const [showReactionsPopup, setShowReactionsPopup] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  const bubbleStyles = isSentByMe
    ? "bg-[#7CB342] text-white rounded-tr-none"
    : "bg-white text-gray-900 rounded-tl-none";

  const handleEmojiClick = (emojiData) => {
    const selectedEmoji = emojiData.emoji;
    const alreadyReacted = reactions.some(
      (r) => r.emoji === selectedEmoji && r.userId === currentUserId
    );
    onReact(message.id, alreadyReacted ? null : selectedEmoji);
    setShowPicker(false);
  };

  // 👇 Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const closeMenu = () => setShowDeleteMenu(false);
    if (showDeleteMenu) {
      document.addEventListener("click", closeMenu);
    }
    return () => document.removeEventListener("click", closeMenu);
  }, [showDeleteMenu]);

  const groupedReactions = reactions.reduce((acc, reaction) => {
    const { emoji, userId, userName, userImage } = reaction;

    if (!acc[emoji]) {
      acc[emoji] = [];
    }

    acc[emoji].push({
      userId,
      userName,
      userImage,
      isSelf: userId === currentUserId,
    });

    return acc;
  }, {});

  const reactionsWithSelf = reactions.map((reaction) => ({
    ...reaction,
    isSelf: reaction.userId === currentUserId,
  }));

  const renderCaption = () => {
    if (!message.content?.trim()) return null;

    return (
      <p
        className={`mt-1 text-sm whitespace-pre-wrap ${
          isSentByMe ? "text-white/90" : "text-gray-700"
        }`}
      >
        {message.content}
      </p>
    );
  };

  if (message.type === "deleted") {
    return (
      <div
        className={`flex ${
          isSentByMe ? "justify-end" : "justify-start"
        } mt-3 px-4`}
      >
        <div
          className={`flex items-center gap-2 max-w-[75%] px-4 py-2 rounded-xl 
          italic text-sm opacity-80
          ${
            isSentByMe
              ? "bg-[#7CB342] text-green-100"
              : "bg-white text-gray-500"
          }`}
        >
          <MdBlock
            size={14}
            className={isSentByMe ? "text-green-200" : "text-gray-400"}
          />

          <span>
            {isSentByMe
              ? "You deleted this message"
              : "This message was deleted"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isSentByMe ? "justify-end" : "justify-start"
      } mt-3 px-4 relative`}
    >
      {!isSentByMe && senderProfile && chatType === "group" && (
        <img
          src={senderProfile.image || "/profile.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover mb-1"
        />
      )}

      <div
        className={`relative max-w-[75%] px-4 py-[1%] mt-[1%] ml-1 rounded-xl shadow-sm break-words ${bubbleStyles}`}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowDeleteMenu(true);
        }}
      >
        {/* Text */}
        {message.type === "text" && (
          <p className="text-sm leading-snug whitespace-pre-wrap pr-2">
            {message.content}
          </p>
        )}

        {/* Media */}
        {message.type === "image" && message.fileUrl && (
          <div className="space-y-1 pr-8">
            <img
              src={message.fileUrl}
              alt="Sent"
              onClick={() => onImageClick(message.fileUrl)}
              className="rounded-lg max-w-[240px] max-h-[240px] object-cover"
            />
            {/* {message.content?.trim() && (
              <p className="text-sm text-white/90">{message.content}</p>
            )} */}
            {renderCaption()}
          </div>
        )}
        {message.type === "video" && message.fileUrl && (
          <div className="space-y-1 pr-8">
            <video
              src={message.fileUrl}
              controls
              className="rounded-lg max-w-[260px] max-h-[260px] object-cover"
            />
            {/* {message.content?.trim() && (
              <p className="text-sm text-white/90">{message.content}</p>
            )} */}
            {renderCaption()}
          </div>
        )}
        {message.type === "audio" && message.fileUrl && (
          <div className="pr-8">
            <audio controls>
              <source src={message.fileUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* PDF */}
        {message.type === "pdf" && message.fileUrl && (
          <>
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 mb-2 pr-8 rounded-lg border no-underline ${
                isSentByMe
                  ? "border-green-500 text-white"
                  : "border-gray-300 text-gray-800"
              }`}
            >
              <span className="text-2xl">📄</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {message.fileName || "PDF Document"}
                </span>
                <span className="text-xs opacity-80">Tap to open</span>
              </div>
            </a>
            {renderCaption()}
          </>
        )}

        {/* Excel */}
        {message.type === "excel" && message.fileUrl && (
          <>
            <a
              href={message.fileUrl}
              download
              className={`flex items-center gap-3 p-3 mb-2 pr-8 rounded-lg border no-underline ${
                isSentByMe
                  ? "border-green-500 text-white"
                  : "border-gray-300 text-gray-800"
              }`}
            >
              <span className="text-2xl">📊</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {message.fileName || "Excel File"}
                </span>
                <span className="text-xs opacity-80">Tap to download</span>
              </div>
            </a>
            {renderCaption()}
          </>
        )}

        {/* Timestamp */}
        <span
          className={`absolute bottom-1 right-2 text-[9px] ${
            isSentByMe ? "text-green-100" : "text-gray-400"
          }`}
        >
          {dayjs(message.timestamp).format("h:mm A")}
        </span>

        {/* Reactions */}
        {Object.entries(groupedReactions).length > 0 && (
          <div
            onClick={() => setShowReactionsPopup(true)}
            className="cursor-pointer text-sm mt-1"
          >
            <div className="absolute -bottom-4 left-2 bg-white border border-gray-300 rounded-full px-2 py-[1px] text-xs shadow-sm flex space-x-1 z-0">
              {Object.entries(groupedReactions).map(([emoji, count], idx) => (
                <span key={idx} className="flex items-center space-x-1">
                  <span>{emoji}</span>
                  {count > 1 && (
                    <span className="text-gray-600 text-[10px]">{count}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emoji Picker */}
      <div className="relative inline-block">
        {showPicker && (
          <EmojiPickerWrapper
            buttonRef={buttonRef}
            onEmojiSelect={(emoji) => {
              const alreadyReacted = reactions.some(
                (r) => r.emoji === emoji && r.userId === currentUserId
              );
              onReact(message.id, alreadyReacted ? null : emoji);
            }}
            onClose={() => setShowPicker(false)}
            isSentByMe={isSentByMe}
          />
        )}
        {/* Trigger */}
        <button
          ref={buttonRef}
          className="text-gray-500 ml-2 mt-4"
          onClick={() => setShowPicker((prev) => !prev)}
        >
          <FaSmile />
        </button>
      </div>
      {showReactionsPopup && (
        <ReactionPopup
          messageId={messageId}
          groupedReactions={groupedReactions}
          reactions={reactionsWithSelf}
          onClose={() => setShowReactionsPopup(false)}
          onReact={onReact}
        />
      )}

      {showDeleteMenu && (
        <div
          className={`absolute z-50 bg-white rounded-md shadow-lg p-2 text-sm top-10 ${
            isSentByMe ? "right-0" : "left-0"
          }`}
        >
          <button
            onClick={() => {
              onDelete(message.id, "DELETE_FOR_ME");
              setShowDeleteMenu(false);
            }}
            className="block w-full text-left px-3 py-1 hover:bg-gray-100"
          >
            Delete for me
          </button>

          {isSentByMe && (
            <button
              onClick={() => {
                onDelete(message.id, "DELETE_FOR_EVERYONE");
                setShowDeleteMenu(false);
              }}
              className="block w-full text-left px-3 py-1 text-red-600 hover:bg-gray-100"
            >
              Delete for everyone
            </button>
          )}
        </div>
      )}
    </div>
  );
}
