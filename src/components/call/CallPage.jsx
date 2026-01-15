import React, { useEffect, useRef } from "react";
import { useWebRTC } from "../../context/WebRTCContext";
import { useWebSocket } from "../../context/WebSocketContext";
import { useParams, useLocation } from "react-router-dom";

export default function CallPage() {
  const {
    startCall,
    acceptCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoMuted,
    callStatus,
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef,
    incomingCall,
  } = useWebRTC();

  const { receiverId } = useParams();
  const { connected } = useWebSocket();
  const location = useLocation();
  // If we navigate to this page with a receiverId param, we’re the caller.
  const isCallerRoute = !!receiverId;

  // callType preference: route -> incoming offer -> default audio
  const callType =
    location.state?.callType || incomingCall?.signal?.callType || "audio";

  const selectedChat = location.state?.selectedChat || location.state?.user;

  const hasStartedCall = useRef(false);
  const hasAcceptedCall = useRef(false);

  // Simple caller flow
  useEffect(() => {
    if (!connected) return;
    if (!receiverId) return;
    if (hasStartedCall.current) return;
    if (!callType) return;

    console.log("Caller: starting call");
    hasStartedCall.current = true;
    startCall(receiverId, callType);
  }, [connected, receiverId, callType]);

  // Simple callee flow
  useEffect(() => {
    if (!connected) return;
    if (receiverId) return; // so caller skips this
    if (hasAcceptedCall.current) return;
    if (!incomingCall) return;

    console.log("Callee: accepting call");
    hasAcceptedCall.current = true;
    const incomingType = incomingCall.signal?.callType || "audio";
    acceptCall(incomingType);
  }, [connected, receiverId, incomingCall]);

  // Unlock autoplay on click
  useEffect(() => {
    const unlock = () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.play().catch(() => {});
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.play().catch(() => {});
      }
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
    return () => document.removeEventListener("click", unlock);
  }, [remoteAudioRef, remoteVideoRef]);

  return (
    <div className="relative w-full h-screen bg-black text-white flex flex-col">
      {/* Remote audio always mounted */}
      <audio ref={remoteAudioRef} autoPlay />
      {/* Header */}
      <div className="absolute top-10 w-full flex justify-center items-center flex-col z-10">
        <img
          src={
            selectedChat?.profilePicture
              ? selectedChat?.profilePicture
              : selectedChat?.image || "/profile.png"
          }
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-green-500 shadow-lg"
        />
        <h2 className="mt-4 text-xl font-semibold">
          {selectedChat?.username ? selectedChat?.username : selectedChat?.name}
        </h2>
        <p className="text-gray-300">
          {callType === "audio" ? "Audio Call" : "Video Call"}
        </p>
        <p className="text-gray-200">
          {callStatus === "calling"
            ? "Calling..."
            : callStatus === "ringing"
            ? "Incoming call..."
            : callStatus === "connected"
            ? "Connected"
            : // : callStatus === "connecting"
              // ? "Connecting..."
              ""}
        </p>
      </div>
      {/* Remote video */}
      {callType === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover"
        />
      )}

      {/* Local preview */}
      {callType === "video" && (
        <div className="absolute bottom-28 right-5 w-32 h-48 bg-black border-2 border-white rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
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
