// components/notifications/NotificationPanel.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NotificationHeader from "./NotificationHeader";
import { fetchNotifications } from "../../redux/slices/NotificationSlice";
import NotificationItem from "./NotificationItem";

const NotificationPanel = () => {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector(
    (state) => state.notifications
  );

  const userData = JSON.parse(localStorage.getItem("myInfo"));
  useEffect(() => {
    if (userData) {
     
      dispatch(fetchNotifications({id: userData.id}));
    }
  }, [dispatch, userData]);

  return (
    <div className="p-4 bg-white shadow rounded-md max-w-md mx-auto">
      <NotificationHeader userId={userData.id} />

      {loading && <p>Loading...</p>}

      <ul className="divide-y">
        {notifications.map((notif) => (
         <NotificationItem key={notif._id} notification={notif} />
        ))}
      </ul>
    </div>
  );
};

export default NotificationPanel;
