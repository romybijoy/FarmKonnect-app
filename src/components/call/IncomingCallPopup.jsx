import React, { useEffect } from "react";
import { useWebRTC } from "../../context/WebRTCContext";

import { fetchUserById } from "../../redux/slices/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function IncomingCallPopup({
  callerName = "User",
  callType = "video",
}) {
  const { acceptCall, rejectCall, setIsCaller } = useWebRTC(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();
   const { user } = useSelector((state) => state.app);
  useEffect(() => {
    dispatch(fetchUserById(callerName));
  }, [dispatch]);

  const handleAccept = () => {
    setIsCaller(false);
    acceptCall(callType); // Step 1: Set up media and signaling
    navigate(`/call/video/${callerName}`, {
      state: { user },
    }); // Step 2: Navigate to call screen
  };

  return (
    <div className="absolute top-10 right-10 bg-white text-black p-6 rounded shadow-lg flex flex-col items-center gap-4 z-50">
      <p>
        {user?.name} is calling ({callType})
      </p>
      <div className="flex gap-4">
        {/* ✅ Call acceptCall when user clicks Accept */}
        <button
          onClick={handleAccept}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Accept
        </button>

        {/* ✅ Call rejectCall when user clicks Reject */}
        <button
          onClick={rejectCall}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
