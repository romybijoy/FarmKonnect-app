// VideoCallPage.jsx
import React, { useEffect, useRef } from "react";
import CallScreen from "./CallScreen";
import { useWebRTC } from "../../context/WebRTCContext";
import { useWebSocket } from "../../context/WebSocketContext";
import IncomingCallPopup from "./IncomingCallPopup";
import { useParams, useLocation, useNavigate } from "react-router-dom";
export default function VideoCallPage() {
  const {
    isCaller,
    setIsCaller,
    calling,
    incoming,
    callFrom,
    localVideoRef,
    localStreamRef,
    remoteVideoRef,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoMuted,
    setAudioMuted,
    setVideoMuted,
    startCall,
  } = useWebRTC();

  const { receiverId } = useParams();
  const { connected } = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedChat = location.state?.selectedChat || location.state?.user;

  const hasStartedCall = useRef(false);

  // useEffect(() => {
  //   if (!receiverId || !connected) return;

  //   const currentUserId = localStorage.getItem("userId"); // Or from context
  //   const isCaller = currentUserId !== receiverId;

  //   if (!isCaller) return;

  //   const initCall = async () => {
  //     await new Promise((resolve) => setTimeout(resolve, 200));
  //     await startCall(receiverId, "video");
  //   };

  //   initCall();
  // }, [receiverId, connected]);

  useEffect(() => {
    if (!receiverId || hasStartedCall.current || !connected) return;

    const currentUserId = localStorage.getItem("userId");
    const caller = currentUserId !== receiverId;

    setIsCaller(caller);

    if (!caller) return;

    const waitForVideoRef = async () => {
      const maxWait = 2000;
      const interval = 100;
      let waited = 0;

      while (!localVideoRef.current && waited < maxWait) {
        console.log("⏳ Waiting for localVideoRef to mount...");
        await new Promise((resolve) => setTimeout(resolve, interval));
        waited += interval;
      }

      if (!localVideoRef.current) {
        console.warn("⚠️ localVideoRef still not ready after 2s");
      } else {
        console.log("✅ localVideoRef is ready:", localVideoRef.current);
      }
    };

    const initCall = async () => {
      console.log("📞 Initiating call to", receiverId);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await waitForVideoRef();
      await startCall(receiverId, "video");
      hasStartedCall.current = true;
    };

    initCall();
  }, [receiverId, startCall, connected]);

  // Optional: redirect if call ends
  useEffect(() => {
    if (!calling && !incoming) {
      // navigate("/"); // Uncomment if you want to redirect when call ends
    }
  }, [calling, incoming]);

  console.log("📺 [UI] Calling:", calling);
  return (
    <>
      <CallScreen
        callerName={selectedChat.username}
        callerProfile={selectedChat.profilePicture || "/profile.png"}
        localVideoRef={localVideoRef}
        localStreamRef={localStreamRef}
        remoteVideoRef={remoteVideoRef}
        onEndCall={endCall}
        onToggleMic={toggleAudio}
        onToggleVideo={toggleVideo}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
      />
    </>
  );
}
