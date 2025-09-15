import { useDispatch } from "react-redux";
import { markAllAsRead } from "../../redux/slices/NotificationSlice";

const NotificationHeader = ({ userId }) => {
  const dispatch = useDispatch();

  const handleMarkAll = () => {
    dispatch(markAllAsRead(userId));
  };

  return (
    <div className="flex justify-between items-center mb-4 px-4">
      <h2 className="text-xl font-semibold">Notifications</h2>
      {/* <button
        onClick={handleMarkAll}
        className="text-sm text-blue-600 hover:underline"
      >
        Mark All as Read
      </button> */}
    </div>
  );
};

export default NotificationHeader;

