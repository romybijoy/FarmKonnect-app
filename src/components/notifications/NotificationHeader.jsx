import { useDispatch, useSelector } from "react-redux";
import { BsCheck2All } from "react-icons/bs";
import {
  markAllAsRead,
  selectUnreadCount,
} from "../../redux/slices/NotificationSlice";

const NotificationHeader = ({ userId }) => {
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);

  return (
     <div className="flex justify-between items-center px-4 py-3 m-0 my-0">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Notifications
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {unreadCount > 0
            ? `${unreadCount} unread notification${
                unreadCount !== 1 ? "s" : ""
              }`
            : "You're all caught up 🎉"}
        </p>
      </div>

      <button
        onClick={() => unreadCount > 0 && dispatch(markAllAsRead(userId))}
        disabled={unreadCount === 0}
        className={`flex items-center justify-center h-9 w-9 rounded-full transition
          ${
            unreadCount > 0
              ? "bg-[#689F38] text-white hover:bg-[#5a8c30]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        title="Mark all as read"
      >
        <BsCheck2All className="text-2xl" />
      </button>
    </div>
  );
};

export default NotificationHeader;
