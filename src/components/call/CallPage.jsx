import React, { useEffect, useRef } from "react";
import { useWebRTC } from "../../context/WebRTCContext";
import { useSignal } from "../../context/SignalContext"; // 👈 Import SignalContext
import { useWebSocket } from "../../context/WebSocketContext";
import { useParams, useLocation } from "react-router-dom";

export default function CallPage() {
  const {
    isCaller,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoMuted,
    localVideoRef,
    remoteVideoRef,
    pendingRemoteStream,
    localStreamRef,
    hasPlayedRemoteRef,
    incomingCall,
    setIncomingCall,
    remoteAudioRef,
  } = useWebRTC();

  const { setSignalSender, setSignalHandler } = useSignal(); // ✅ SignalContext
  const { receiverId } = useParams();
  const { connected } = useWebSocket();
  const location = useLocation();
  const selectedChat = location.state?.selectedChat || location.state?.user;
  const callType = location.state?.callType;
  const hasStartedCall = useRef(false);

  // ✅ Attach remote stream once available
  useEffect(() => {
    if (
      remoteVideoRef.current &&
      pendingRemoteStream.current &&
      !hasPlayedRemoteRef.current
    ) {
      remoteVideoRef.current.srcObject = pendingRemoteStream.current;

      const tryPlay = () => {
        remoteVideoRef.current
          .play()
          .then(() => {
            hasPlayedRemoteRef.current = true;
            pendingRemoteStream.current = null;
          })
          .catch((err) => console.error("Remote video play failed:", err));
      };

      if (remoteVideoRef.current.readyState >= 2) {
        tryPlay();
      } else {
        remoteVideoRef.current.onloadedmetadata = tryPlay;
      }
    }
  }, [remoteVideoRef, pendingRemoteStream, hasPlayedRemoteRef]);

  useEffect(() => {
    const playIfReady = (videoRef) => {
      if (!videoRef?.current || !videoRef.current.srcObject) return;

      const video = videoRef.current;

      const tryPlay = () => {
        video.play().catch((err) => console.error("Playback failed:", err));
      };

      if (video.readyState >= 3) {
        tryPlay();
      } else {
        video.oncanplay = tryPlay;
      }
    };

    if (callType === "video") {
      playIfReady(localVideoRef);
      playIfReady(remoteVideoRef);
    }

    if (remoteAudioRef.current?.srcObject) {
      remoteAudioRef.current.play().catch(console.error);
    }
  }, [callType]);

  useEffect(() => {
    if (!receiverId || hasStartedCall.current || !connected || !callType)
      return;

    const waitForVideoRef = async () => {
      const maxWait = 2000;
      const interval = 100;
      let waited = 0;
      while (!localVideoRef.current && waited < maxWait) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        waited += interval;
      }
    };

    const initCall = async () => {
      if (callType === "video") {
        await waitForVideoRef();
      }

      await startCall(receiverId, callType);
      hasStartedCall.current = true;
    };

    initCall();
  }, [receiverId, startCall, connected, callType, localVideoRef]);

  useEffect(() => {
    const unlockAudio = () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.play().catch(() => {});
      }
      document.removeEventListener("click", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black text-white flex flex-col">
      {/* User Info */}
      <div className="absolute top-10 w-full flex justify-center items-center flex-col z-10">
        <img
          src={selectedChat?.profilePicture || "profile.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-green-500 shadow-lg"
        />
        <h2 className="mt-4 text-xl font-semibold">{selectedChat?.username}</h2>
        <p className="text-gray-300">
          {callType === "audio" ? "Audio Call" : "Video Call"}
        </p>
      </div>

      {/* Remote Video */}
      {callType === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          // style={{
          //   width: "300px",
          //   height: "200px",
          //   border: "2px solid red",
          //   backgroundColor: "black",
          // }}
        />
      )}

      {/* Local Preview */}
      {callType === "video" && (
        <div className="absolute bottom-28 right-5 w-32 h-48 bg-black border-2 border-white rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 w-full flex justify-center gap-8">
        <button
          onClick={toggleAudio}
          className="bg-gray-700 p-4 rounded-full text-2xl"
        >
          {isAudioMuted ? "🔇" : "🎙️"}
        </button>

        {callType === "video" && (
          <button
            onClick={toggleVideo}
            className="bg-gray-700 p-4 rounded-full text-2xl"
          >
            {isVideoMuted ? "🚫🎥" : "🎥"}
          </button>
        )}

        <audio ref={remoteAudioRef} autoPlay playsInline muted={false} />
        <button
          onClick={endCall}
          className="bg-red-600 p-4 rounded-full text-2xl"
        >
          🔴
        </button>
      </div>
    </div>
  );
}
