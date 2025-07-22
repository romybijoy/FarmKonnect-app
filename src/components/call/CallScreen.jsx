import React, { useEffect } from "react";

export default function CallScreen({
  callerName,
  callerProfile,
  localVideoRef,
  localStreamRef,
  pendingRemoteStream,
  remoteVideoRef,
  onEndCall,
  onToggleMic,
  onToggleVideo,
  isAudioMuted,
  isVideoMuted,
}) {
  // useEffect(() => {
  //   console.log("🎬 localVideoRef:", localVideo);
  //   console.log("🎥 localStreamRef:", localStreamRef);

  //   if (localVideo.current && localStreamRef.current) {
  //     localVideo.current.srcObject = localStreamRef.current;
  //     localVideo.current
  //       .play()
  //       .then(() => console.log("✅ Local video playing"))
  //       .catch((err) => console.error("❌ Video play failed:", err));
  //   }
  // }, [localStreamRef]);
  // useEffect(() => {
    
  //   if (remoteVideoRef.current && pendingRemoteStream) {
  //     console.log("🎯 Attaching pending remote stream after mount" + pendingRemoteStream.current);
  //     remoteVideoRef.current.srcObject = pendingRemoteStream.current;
  //     remoteVideoRef.current
  //       .play()
  //       .then(() => console.log("✅ Remote video playing (delayed)"))
  //       .catch((err) =>
  //         console.error(
  //           "❌ Delayed remote video play failed:",
  //           err.name,
  //           err.message
  //         )
  //       );
  //     pendingRemoteStream.current = null;
  //   }
  // }, [remoteVideoRef.current]);

  useEffect(() => {
  const tryAttachRemoteStream = () => {
    if (remoteVideoRef.current && pendingRemoteStream.current) {
      console.log("🎯 Delayed: attaching pending remote stream");

      remoteVideoRef.current.srcObject = pendingRemoteStream.current;

      remoteVideoRef.current
        .play()
        .then(() => console.log("✅ Remote video now playing"))
        .catch((err) =>
          console.error("❌ Delayed remote video play failed:", err.name, err.message)
        );

      // Clear it so it doesn't attach again
      pendingRemoteStream.current = null;
    }
  };

  // Try immediately
  tryAttachRemoteStream();

  // Retry a few times in case ref comes late (dirty but effective)
  const interval = setInterval(tryAttachRemoteStream, 300);
  setTimeout(() => clearInterval(interval), 2000); // stop retrying after 2s

  return () => clearInterval(interval);
}, []);

  // useEffect(() => {
  //   console.log("✅ remoteVideoRef mounted:", remoteVideoRef.current);
  // }, []);
  return (
    <div className="relative w-full h-screen bg-black text-white flex flex-col">
      {/* Top info */}
      <div className="absolute top-10 w-full flex justify-center items-center flex-col z-10">
        <img
          src={callerProfile || "profile.png"}
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
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Small local preview */}
      <div className="absolute bottom-28 right-5 w-32 h-48 bg-black border-2 border-white rounded-lg overflow-hidden shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted={false}
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
