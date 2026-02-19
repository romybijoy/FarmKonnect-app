import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationHeader from "./NotificationHeader";
import {
  fetchNotifications,
  markAsRead,
} from "../../redux/slices/NotificationSlice";
import NotificationItem from "./NotificationItem";

const NotificationPanel = () => {
  const dispatch = useDispatch();
  const { notifications, loading, actionLoading } = useSelector(
    (state) => state.notifications,
  );

  const userId = JSON.parse(localStorage.getItem("myInfo"))?.id;

  useEffect(() => {
    if (userId && notifications.length === 0) {
      dispatch(fetchNotifications({ id: userId }));
    }
  }, [dispatch, userId]);

  const handleRead = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead({ id: notification.id }));
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full min-h-[400px]">
      <div className="px-4 py-3 pb-3 border-b border-gray-100">
        <NotificationHeader userId={userId} />
      </div>

      <div className="px-4 py-3">
        {loading && (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            No notifications yet
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <ul className="m-2 space-y-1 divide-gray-200 m-2">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onClick={() => handleRead(notif)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
