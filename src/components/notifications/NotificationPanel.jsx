import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationHeader from "./NotificationHeader";
import { fetchNotifications, markAsRead } from "../../redux/slices/NotificationSlice";
import NotificationItem from "./NotificationItem";

const NotificationPanel = () => {
  const dispatch = useDispatch();
  const { notifications, loading, actionLoading } = useSelector(
    (state) => state.notifications
  );

  const userId = JSON.parse(localStorage.getItem("myInfo"))?.id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications({ id: userId }));
    }
  }, [dispatch, userId]);

  const handleRead = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead({ id: notification.id }));
    }
  };
  return (
    <div className="p-4 pt-5 bg-white shadow rounded-lg w-full min-h-[300px]">
      <div className="border-b pb-2 mb-2">
        <NotificationHeader userId={userId} />
      </div>

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
        <ul className="m-2 space-y-2 divide-gray-200 m-2">
          {notifications.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} onClick={() => handleRead(notif)} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPanel;
