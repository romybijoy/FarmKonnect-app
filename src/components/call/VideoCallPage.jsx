// VideoCallPage.jsx
import React, {useEffect} from "react";
import CallScreen from "./CallScreen";
import { useWebRTC } from "../../context/WebRTCContext";
import { useWebSocket } from "../../context/WebSocketContext";
import IncomingCallPopup from "./IncomingCallPopup";
import { useParams } from "react-router-dom";
export default function VideoCallPage() {
  const {
    calling,
    incoming,
    callFrom,
    localVideo,
    remoteVideo,
    endCall,
    isAudioMuted,
    isVideoMuted,
    setAudioMuted,
    setVideoMuted,
    startCall
  } = useWebRTC();
 
const { receiverId } = useParams();
const { connected } = useWebSocket();

useEffect(() => {
  if (!receiverId || !connected) return;

  const currentUserId = localStorage.getItem("userId"); // Or from context
  const isCaller = currentUserId !== receiverId;

  if (!isCaller) return; 

  const initCall = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    await startCall(receiverId, "video");
  };

  initCall();
}, [receiverId, connected]);

console.log("📺 [UI] Calling:", calling, "Incoming:", incoming);
  return (
    <>
      {incoming && !calling && <IncomingCallPopup callerName={callFrom} callType="video" />}

      {calling && (
        <CallScreen
          callerName={callFrom || "You"}
          callerProfile="/profile.jpg"
          localStreamRef={localVideo}
          remoteStreamRef={remoteVideo}
          onEndCall={endCall}
          onToggleMic={() => setAudioMuted((prev) => !prev)}
          onToggleVideo={() => setVideoMuted((prev) => !prev)}
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
        />
      )}
    </>
  );
}
