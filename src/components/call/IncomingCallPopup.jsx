
import React from "react";
import { useWebRTC } from "../../context/WebRTCContext";

export default function IncomingCallPopup({ callerName = "User", callType = "video" }) {
  const { acceptCall, rejectCall } = useWebRTC(); // ✅ use accept/reject here

  return (
    <div className="absolute top-10 right-10 bg-white text-black p-6 rounded shadow-lg flex flex-col items-center gap-4 z-50">
      <p>{callerName} is calling ({callType})</p>
      <div className="flex gap-4">
        {/* ✅ Call acceptCall when user clicks Accept */}
        <button onClick={() => acceptCall(callType)} className="bg-green-500 text-white px-4 py-2 rounded">
          Accept
        </button>

        {/* ✅ Call rejectCall when user clicks Reject */}
        <button onClick={rejectCall} className="bg-red-500 text-white px-4 py-2 rounded">
          Reject
        </button>
      </div>
    </div>
  );
}
