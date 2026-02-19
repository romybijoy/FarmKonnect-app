import React from "react";
import moment from "moment";

const NotificationItem = ({ notification, onClick }) => {
  const { senderName, message, timestamp, read, senderProfilePic } =
    notification;

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-1 pt-3 mt-2 border-1 border-gray-200 rounded-lg cursor-pointer
    ${read ? "bg-white" : "bg-[#DFF5E1]"} hover:bg-gray-50`}
    >
      <div className="flex items-start gap-3">
        <img
          src={senderProfilePic || "/profile.png"}
          alt={senderName}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="text-sm text-gray-800 m-0 my-1 mt-0">
            <span className="font-semibold">{senderName}</span>{" "}
            <span>{message.replace(senderName, "")}</span>
          </p>
          <p className="text-xs text-gray-400 mt-[2px]">
            {moment(timestamp).fromNow()}
          </p>
        </div>
      </div>

      {!read && <span className="w-2 h-2 bg-[#689F38] rounded-full mt-1" />}
    </div>
  );
};

export default NotificationItem;
