import React, { useEffect, useRef } from "react";
import { useWebRTC } from "../../context/WebRTCContext";
import { useWebSocket } from "../../context/WebSocketContext";
import { useParams, useLocation } from "react-router-dom";

export default function CallPage() {
  const {
    // state/actions
    startCall,
    acceptCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoMuted,
    callStatus,

    // refs
    localVideoRef,
    remoteVideoRef,
    remoteAudioRef,
    pendingRemoteStream,
    hasPlayedRemoteRef,
    remoteStreamRef,

    incomingCall,
    isCaller,
    // set role
    setIsCaller,
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

  // One-shot guards to prevent double-start/double-accept
  const hasStartedCall = useRef(false);
  const hasAcceptedCall = useRef(false);

  // Keep audio element mounted early so remoteAudioRef exists when ontrack fires
  useEffect(() => {
    if (!remoteAudioRef.current) return;
    const unlock = () => {
      remoteAudioRef.current.play().catch(() => {});
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
    return () => document.removeEventListener("click", unlock);
  }, [remoteAudioRef]);

  // Attach pending remote video if it arrived before refs mounted
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

  // Caller path (has receiverId)
  useEffect(() => {
    if (!connected) return;
    if (!receiverId) return; // Only caller has receiverId
    if (hasStartedCall.current) return;
    if (!callType) return;

    console.log("Caller: starting call");
    hasStartedCall.current = true;
    startCall(receiverId, callType);
  }, [connected, receiverId, callType]);

  // Callee: accept when an offer arrives
  useEffect(() => {
    if (!connected) return;
    if (receiverId) return; // Only callee has no receiverId
    if (hasAcceptedCall.current) return;
    if (!incomingCall) return;

    console.log("Callee: accepting call");
    hasAcceptedCall.current = true;
    const incomingType = incomingCall.signal?.callType || "audio";
    acceptCall(incomingType);
  }, [connected, incomingCall]);

  // Attach remote stream when elements become available
  useEffect(() => {
    const stream = remoteStreamRef.current;
    if (!stream) return;

    console.log("[CallPage] Attaching remote stream to elements");
    console.log(
      "[CallPage] Stream tracks:",
      stream.getTracks().map((t) => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
      }))
    );

    if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
      console.log("[CallPage] Attaching video stream");
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = 1.0;

      // Force play function to bypass autoplay restrictions
      const forcePlay = () => {
        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("[CallPage] Video play successful");
          })
          .catch((err) => {
            console.warn("Video play failed:", err?.name, err?.message);
          });
      };

      // Try to play immediately
      forcePlay();

      // Also try after a short delay
      setTimeout(forcePlay, 100);

      // Add event listeners
      remoteVideoRef.current.onloadedmetadata = () => {
        console.log("[CallPage] Video metadata loaded, dimensions:", {
          videoWidth: remoteVideoRef.current.videoWidth,
          videoHeight: remoteVideoRef.current.videoHeight,
        });
        forcePlay(); // Try again when metadata loads
      };

      remoteVideoRef.current.oncanplay = () => {
        console.log("[CallPage] Video can play");
        forcePlay(); // Try again when video can play
      };
    } else if (remoteVideoRef.current) {
      console.log("[CallPage] Video already has srcObject");
    } else {
      console.log("[CallPage] remoteVideoRef not available");
    }

    if (remoteAudioRef.current && !remoteAudioRef.current.srcObject) {
      console.log("[CallPage] Attaching audio stream");
      remoteAudioRef.current.srcObject = stream;
      remoteAudioRef.current
        .play()
        .then(() => {
          console.log("[CallPage] Audio play successful");
        })
        .catch((err) => {
          console.warn("Audio play failed:", err?.name, err?.message);
        });
    } else if (remoteAudioRef.current) {
      console.log("[CallPage] Audio already has srcObject");
    } else {
      console.log("[CallPage] remoteAudioRef not available");
    }
  }, [remoteVideoRef, remoteAudioRef]);

  useEffect(() => {
    const checkElements = () => {
      if (remoteVideoRef.current) {
        console.log("Video dimensions:", {
          videoWidth: remoteVideoRef.current.videoWidth,
          videoHeight: remoteVideoRef.current.videoHeight,
          clientWidth: remoteVideoRef.current.clientWidth,
          clientHeight: remoteVideoRef.current.clientHeight,
        });
        console.log("Video element:", {
          srcObject: !!remoteVideoRef.current.srcObject,
          paused: remoteVideoRef.current.paused,
          muted: remoteVideoRef.current.muted,
          volume: remoteVideoRef.current.volume,
          readyState: remoteVideoRef.current.readyState,
        });
      }
      if (remoteAudioRef.current) {
        console.log("Audio element:", {
          srcObject: !!remoteAudioRef.current.srcObject,
          paused: remoteAudioRef.current.paused,
          muted: remoteAudioRef.current.muted,
          volume: remoteAudioRef.current.volume,
          readyState: remoteAudioRef.current.readyState,
        });
      }
    };

    setTimeout(checkElements, 1000);

    if (remoteVideoRef.current) {
      remoteVideoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded, dimensions:", {
          videoWidth: remoteVideoRef.current.videoWidth,
          videoHeight: remoteVideoRef.current.videoHeight,
        });
      };

      remoteVideoRef.current.oncanplay = () => {
        console.log("Video can play");
      };
    }
  }, [remoteVideoRef, remoteAudioRef]);

  useEffect(() => {
  const unlockVideo = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(() => {});
    }
  };
  
  document.addEventListener("click", unlockVideo);
  return () => document.removeEventListener("click", unlockVideo);
}, []);

  console.log(
    "CallPage: receiverId =",
    receiverId,
    "isCaller =",
    isCaller,
    "incomingCall =",
    !!incomingCall
  );
  return (
    <div className="relative w-full h-screen bg-black text-white flex flex-col">
      {/* Keep audio mounted early so remoteAudioRef is available when ontrack fires */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Header */}
      <div className="absolute top-10 w-full flex justify-center items-center flex-col z-10">
        <img
          src={
            selectedChat?.profilePicture
              ? selectedChat?.profilePicture
              : selectedChat?.image || "profile.png"
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
            : callStatus === "connecting"
            ? "Connecting..."
            : ""}
        </p>
      </div>

      {/* Remote Video (main) */}
      {callType === "video" && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          muted={false}
          controls={true} // Add controls to see if video is playing
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            display: "block", // Keep it visible for testing
            // border: "5px solid red",
          }}
        />
      )}

      {/* Local Preview (small) */}
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
