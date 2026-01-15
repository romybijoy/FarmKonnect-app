import React, { useEffect } from "react";

import { useWebRTC } from "../../context/WebRTCContext";
export default function CallScreen({
  callerName,
  callerProfile,
  localVideoRef,
  localStreamRef,
  // pendingRemoteStream,
  // hasPlayedRemoteRef,
  // remoteVideoRef,
  onEndCall,
  onToggleMic,
  onToggleVideo,
  isAudioMuted,
  isVideoMuted,
}) {
  const { remoteVideoRef, pendingRemoteStream, hasPlayedRemoteRef } =
    useWebRTC();

  console.log(
    "values2221111",
    pendingRemoteStream.current,
    remoteVideoRef.current,
    hasPlayedRemoteRef.current
  );

  const attachRemoteStream = (stream) => {
    if (!remoteVideoRef.current || hasPlayedRemoteRef.current) return;

    remoteVideoRef.current.srcObject = stream;

    const tryPlay = () => {
      remoteVideoRef.current
        .play()
        .then(() => {
          console.log("Remote video playing");
          hasPlayedRemoteRef.current = true;
        })
        .catch((err) => {
          console.error("play() failed:", err.name, err.message);
        });
    };

    if (remoteVideoRef.current.readyState >= 2) {
      tryPlay();
    } else {
      remoteVideoRef.current.onloadedmetadata = tryPlay;
    }
  };

  useEffect(() => {
    if (
      remoteVideoRef.current &&
      pendingRemoteStream.current &&
      !hasPlayedRemoteRef.current
    ) {
      console.log("Attaching pending remote stream");
      attachRemoteStream(pendingRemoteStream.current);
      pendingRemoteStream.current = null;
    }
  }, [remoteVideoRef.current]);

  return (
    <div className="relative w-full h-screen bg-black text-white flex flex-col">
      {/* Top info */}
      <div className="absolute top-10 w-full flex justify-center items-center flex-col z-10">
        <img
          src={callerProfile || "/profile.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-green-500 shadow-lg"
        />
        <h2 className="mt-4 text-xl font-semibold">{callerName}</h2>
        <p className="text-gray-300">Video Call</p>
      </div>

      {/* Remote video full screen */}
      <video
        ref={remoteVideoRef}
        autoPlay
        // muted
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Small local preview */}
      <div className="absolute bottom-28 right-5 w-32 h-48 bg-black border-2 border-white rounded-lg overflow-hidden shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-8 w-full flex justify-center gap-8">
        <button
          onClick={onToggleMic}
          className="bg-gray-700 p-4 rounded-full text-2xl"
        >
          {isAudioMuted ? "🔇" : "🎙️"}
        </button>
        <button
          onClick={onToggleVideo}
          className="bg-gray-700 p-4 rounded-full text-2xl"
        >
          {isVideoMuted ? "🚫🎥" : "🎥"}
        </button>
        <button
          onClick={onEndCall}
          className="bg-red-600 p-4 rounded-full text-2xl"
        >
          🔴
        </button>
      </div>
    </div>
  );
}
