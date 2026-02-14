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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white text-black p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 min-w-[300px]">
        <p className="text-lg font-semibold text-center">
          {currentUser?.name || "Someone"} is calling you (
          {callType === "video" ? "📹 Video" : "🎧 Audio"})
        </p>

        <div className="flex gap-6">
          <button
            onClick={handleAccept}
            className="bg-[#689F38] hover:bg-[#5f8f32] text-white px-6 py-2 rounded-full shadow"
          >
            Accept
          </button>

          <button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full shadow"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
