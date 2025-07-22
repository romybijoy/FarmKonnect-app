import React from "react";
import moment from "moment";

const NotificationItem = ({ notification }) => {
  const {
    senderName,
    message,
    timestamp,
    read,
    senderProfilePic,
  } = notification;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 ${
        !read ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={senderProfilePic}
          alt={senderName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">{senderName}</span>{" "}
            <span>{message.replace(senderName, "")}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {moment(timestamp).fromNow()}
          </p>
        </div>
      </div>

      {!read && (
        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
      )}
    </div>
  );
};

export default NotificationItem;
