import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPresence } from "../../redux/slices/PresenceSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { makeSelectUserPresence } from "../../selectors/PresenceSelector";
dayjs.extend(relativeTime);

// const selectUserPresence = useSelector(makeSelectUserPresence(email));

const ChatHeader = ({ email, username }) => {
  const dispatch = useDispatch();

  const presence = useSelector(makeSelectUserPresence(email));

  useEffect(() => {
    dispatch(fetchPresence(email));
    const interval = setInterval(() => dispatch(fetchPresence(email)), 10000);
    return () => clearInterval(interval);
  }, [dispatch, email]);
console.log(presence)
  const renderStatus = () => {
    if (!presence) return null;

    if (presence.online) {
      return <span className="text-green-600">Online</span>;
    }

    if (presence.lastSeen) {
      return (
        <span className="text-gray-500">
          Last seen {dayjs(presence.lastSeen).fromNow()}
        </span>
      );
    }

    return null;
  };

  if (!presence) return <span className="text-gray-400">Loading...</span>;

  return (
    <div className="flex flex-col px-4 py-2 bg-white">
      <span className="font-semibold text-lg">{username}</span>
      <span className="text-sm">{renderStatus()}</span>
    </div>
  );
};

export default ChatHeader;
