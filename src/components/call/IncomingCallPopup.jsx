import React, { useEffect } from "react";
import { useWebRTC } from "../../context/WebRTCContext";
import { fetchUserById } from "../../redux/slices/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function IncomingCallPopup() {
  const { incomingCall, acceptCall, rejectCall, setIsCaller } = useWebRTC();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.app);

  const callerId = incomingCall?.senderId;
  const callType = incomingCall.signal?.callType;

  useEffect(() => {
    console.log("first", callerId);
    if (callerId) {
      dispatch(fetchUserById(callerId));
    }
  }, [dispatch, callerId]);

  if (!incomingCall) return null;

  const handleAccept = async () => {
    setIsCaller(false);
    // await acceptCall(callType); // callType can be 'audio' or 'video'
    navigate(`/call`, {
      state: { user: currentUser, callType: callType },
    });
  };

  const handleReject = () => {
    rejectCall(callerId);
  };
  console.log("ddsds", currentUser);
  return (
    <div className="fixed top-10 right-10 bg-white text-black p-6 rounded shadow-lg flex flex-col items-center gap-4 z-50">
      <p className="text-lg font-semibold">
        {currentUser?.name || "Someone"} is calling you (
        {callType === "video" ? "📹 Video" : "🎧 Audio"})
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleAccept}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
