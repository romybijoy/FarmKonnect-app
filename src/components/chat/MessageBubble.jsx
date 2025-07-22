import React from "react";

export default function MessageBubble({ message, currentUserId }) {
  const isSentByMe = message.senderId === currentUserId;

  const bubbleClasses = `max-w-[50%] px-3 py-2 rounded-lg shadow ${
    isSentByMe ? "bg-green-500 text-white" : "bg-gray-300 text-black"
  }`;

  return (
    <div
      className={`flex ${isSentByMe ? "justify-end" : "justify-start"} mb-2`}
    >
      <div className={bubbleClasses}>
        {/* Text */}
        {message.type === "text" && (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}

        {/* Image */}
        {message.type === "image" && message.fileUrl && (
          <img
            src={message.fileUrl}
            alt="Sent"
            className="rounded-lg max-w-[220px] max-h-[220px] object-cover"
          />
        )}

        {/* Video */}
        {message.type === "video" && message.fileUrl && (
          <video
            src={message.fileUrl}
            controls
            className="rounded-lg max-w-[220px] max-h-[220px] object-cover"
            autoPlay={false}
            muted={false}
            volume={1}
          />
        )}
        {/* audio */}
        {message.type === "audio" && (
          <audio controls src={message.fileUrl} />
        )}

        {/* Optional caption */}
        {["image", "video"].includes(message.type) &&
          message.content?.trim() && (
            <p className="mt-1 text-sm">{message.content}</p>
          )}
      </div>
    </div>
  );
}
