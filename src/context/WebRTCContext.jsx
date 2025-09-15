import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSignal } from "./SignalContext";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "./WebSocketContext";

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const hasPlayedRemoteRef = useRef(false);
  const pc = useRef(null);
  const remoteIdRef = useRef(null);
  const offerRef = useRef(null);
  const pendingRemoteStream = useRef(null);
  const { setSignalHandler, sendSignalSender, setSignalSender } = useSignal();
  const { sendMessageWS } = useWebSocket();
  const [calling, setCalling] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [callFrom, setCallFrom] = useState(null);
  const [isAudioMuted, setAudioMuted] = useState(false);
  const [isVideoMuted, setVideoMuted] = useState(false);
  const [isCaller, setIsCaller] = useState(false);
  const [callType, setCallType] = useState("audio");
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const userId = userData?.id;

  let pendingCandidates = [];

  const flushPendingCandidates = async () => {
    for (const candidate of pendingCandidates) {
      try {
        await pc.current.addIceCandidate(candidate);
        console.log("✅ Flushed pending ICE candidate");
      } catch (err) {
        console.error("❌ Failed to flush ICE:", err);
      }
    }
    pendingCandidates = [];
  };

  const handleSignal = useCallback(async ({ senderId, signal }) => {
    if (!signal) {
      console.warn("[WebRTC] Received empty signal");
      return;
    }

    switch (signal.type) {
      case "offer":
        if (pc.current && pc.current.signalingState === "have-remote-offer") {
          console.warn("[WebRTC] Already received offer, skipping.");
          return;
        }
        remoteIdRef.current = senderId;
        offerRef.current = signal;

        setCallFrom(senderId);
        // setCallType(signal.callType || "audio");
        setIncomingCall({ senderId, signal });
        setIncoming(true); // ✅ shows popup
        break;

      case "answer":
        if (!pc.current || pc.current.signalingState !== "have-local-offer")
          return;
        // setCallType(signal.callType || "audio");
        await pc.current.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
        );
        await flushPendingCandidates();
        break;

      case "ice":
        if (
          !pc.current?.remoteDescription ||
          pc.current.signalingState === "have-local-offer"
        ) {
          pendingCandidates.push(signal.candidate);
          return;
        }

        if (signal.candidate?.candidate) {
          const iceCandidate = new RTCIceCandidate(signal.candidate);
          await pc.current.addIceCandidate(iceCandidate);
        }
        break;

      case "reject":
        offerRef.current = null;
        remoteIdRef.current = null;
        setCalling(false);
        break;

      default:
        console.warn("Unknown signal type:", signal.type);
    }
  }, []);

  // ✅ Define once at the top of your component (or useCallback)
  const signalSenderFn = useCallback(
    (receiverId, signal) => {
      sendMessageWS("/app/call/signal", {
        ...signal,
        senderId: userId,
        receiverId,
      });
    },
    [userId]
  );

  useEffect(() => {
    setSignalHandler(handleSignal); // Set handler to receive incoming signals
    setSignalSender(signalSenderFn); // Set sender function to send signals out
  }, [handleSignal, signalSenderFn, setSignalHandler, setSignalSender]);

  //   pc.current = new RTCPeerConnection({
  //     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  //   });

  //   pc.current.ontrack = (event) => {
  //     const stream = event.streams[0];

  //     if (type === "video") {
  //       // Video call: attach stream to <video> element
  //       if (remoteVideoRef.current) {
  //         remoteVideoRef.current.srcObject = stream;
  //       } else {
  //         // Retry after short delay (DOM might not be ready)
  //         setTimeout(() => {
  //           if (remoteVideoRef.current) {
  //             remoteVideoRef.current.srcObject = stream;
  //           } else {
  //             console.warn("remoteVideoRef still null after delay");
  //           }
  //         }, 100);
  //       }
  //     } else {
  //       // Audio call: play using <audio> or handle separately
  //       remoteStreamRef.current = stream;
  //       const audioElement = new Audio();
  //       audioElement.srcObject = stream;
  //       audioElement.autoplay = true;
  //       audioElement.play().catch((err) =>
  //         console.error("Audio playback failed", err)
  //       );
  //     }

  //     console.log("[ontrack] Remote stream received:", stream);
  //   };

  //   pc.current.onicecandidate = (event) => {
  //     if (event.candidate && remoteIdRef.current) {
  //       sendSignalSender(remoteIdRef.current, {
  //         type: "ice",
  //         candidate: event.candidate,
  //         callType: callType, // make sure this is already set
  //       });
  //     }
  //   };
  // };

  const createPeerConnection = (type) => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // pc.current.ontrack = (event) => {
    //   console.log("🔥 ontrack fired. Streams:", event.streams);
    //   const stream = event.streams[0];
    //   console.log("[ontrack] Remote stream received:", stream);

    //   // Assign to ref
    //   remoteStreamRef.current = stream;

    //   // ✅ Attach to video element
    //   if (remoteVideoRef.current) {
    //     remoteVideoRef.current.srcObject = stream;
    //     setTimeout(() => {
    //       remoteVideoRef.current
    //         .play()
    //         .then(() => console.log("✅ Remote video playing"))
    //         .catch((err) =>
    //           console.error(
    //             "❌ Remote video play failed:",
    //             err.name,
    //             err.message
    //           )
    //         );
    //     }, 100);
    //   } else {
    //     console.warn("⚠️ remoteVideoRef not available yet");
    //     pendingRemoteStream.current = stream;
    //   }

    //   const [remoteAudioTrack] = event.streams[0].getAudioTracks();
    //   // ✅ Attach audio stream
    //   if (remoteAudioRef.current && remoteAudioTrack) {
    //     const audioStream = new MediaStream([remoteAudioTrack]);
    //     remoteAudioRef.current.srcObject = audioStream;

    //     if (!remoteAudioTrack.enabled || remoteAudioTrack.muted) {
    //       console.warn("Remote audio track is muted or disabled.");
    //     }
    //     setTimeout(() => {
    //       remoteAudioRef.current
    //         .play()
    //         .then(() => console.log("🔊 Remote audio playing"))
    //         .catch((err) =>
    //           console.error(
    //             "❌ Remote audio play failed:",
    //             err.name,
    //             err.message
    //           )
    //         );
    //     }, 100);
    //   } else {
    //     console.warn("⚠️ remoteAudioRef not available");
    //   }
    // };

    pc.current.ontrack = (event) => {
      console.log("🔥 [ontrack] Fired. Streams received:", event.streams);

      const stream = event.streams[0];
      if (!stream) {
        console.error("❌ [ontrack] No stream received");
        return;
      }

      console.log("🎥 [ontrack] Remote stream received:", stream);
      remoteStreamRef.current = stream;

      // Attach remote video if callType is video
      if (remoteVideoRef.current && callType === "video") {
        remoteVideoRef.current.srcObject = stream;

        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current
            .play()
            .then(() => console.log("✅ Remote video playing"))
            .catch((err) =>
              console.error(
                "❌ Remote video play failed:",
                err.name,
                err.message
              )
            );
        };
      } else if (!remoteVideoRef.current && callType === "video") {
        console.warn("⚠️ remoteVideoRef not available yet");
        pendingRemoteStream.current = stream;
      }

      const audioEl = remoteAudioRef.current;

      if (stream && audioEl) {
        audioEl.pause();
        audioEl.srcObject = null;
        audioEl.srcObject = stream;

        const handleStats = () => {
          pc.current
            .getStats()
            .then((stats) => {
              console.log("dfffffff.............",);
              stats.forEach((report) => {
                if (report.type === "inbound-rtp" && report.kind === "audio") {
                  console.log("📊 Bytes received:", report.bytesReceived);
                  console.log("📶 Packets lost:", report.packetsLost);
                }
              });
            })
            .catch((err) => console.error("Stats error:", err));
        };

        const tryPlay = () => {
          audioEl
            .play()
            .then(() => {
              console.log("✅ Remote audio playing");
              setTimeout(handleStats, 1000); // Delay stats slightly post-playback
            })
            .catch((err) => {
              console.warn("🚫 remote audio play failed:", err);
            });
        };

        // Wait until the browser says the stream is playable
        audioEl.addEventListener("canplay", tryPlay, { once: true });
      }

      // 🎧 Handle remote audio
      const remoteAudioTracks = stream.getAudioTracks();
      if (remoteAudioTracks.length === 0) {
        console.warn("⚠️ No remote audio tracks found");
      } else {
        const remoteAudioTrack = remoteAudioTracks[0];
        const audioStream = new MediaStream([remoteAudioTrack]);

        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = audioStream;

          console.log(
            `🔎 Remote audio track - enabled: ${remoteAudioTrack.enabled}, muted: ${remoteAudioTrack.muted}`
          );

          // Force unmute (in case it's muted)
          remoteAudioTrack.enabled = true;

          remoteAudioRef.current.onloadedmetadata = () => {
            remoteAudioRef.current
              .play()
              .then(() => console.log("🔊 Remote audio playing"))
              .catch((err) =>
                console.error(
                  "❌ Remote audio play failed:",
                  err.name,
                  err.message
                )
              );
          };
        } else {
          console.warn("⚠️ remoteAudioRef not available");
        }
      }
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate && remoteIdRef.current) {
        sendSignalSender(remoteIdRef.current, {
          type: "ice",
          candidate: event.candidate,
          callType: type,
        });
      }
    };

    pc.current.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", pc.current.iceConnectionState);
      if (
        ["disconnected", "failed", "closed"].includes(
          pc.current.iceConnectionState
        )
      ) {
        console.warn(
          "ICE connection state is bad:",
          pc.current.iceConnectionState
        );
        endCall();
      }
    };

    return pc.current;
  };

  const startCall = async (targetId, type) => {
    console.log("Target and type: ", targetId, type);
    setIsCaller(true);
    setCallType(type);
    setCalling(true);

    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    pc.current = createPeerConnection(type);

    if (!pc.current) {
      console.error("❌ Peer connection was not initialized.");
      return;
    }

    // Stop previous local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    const constraints =
      type === "audio"
        ? { audio: true, video: false }
        : { audio: true, video: true };

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error("🚫 Failed to get user media:", error);
      return;
    }

    localStreamRef.current = stream;

    // ✅ Log and ensure audio is enabled
    stream.getAudioTracks().forEach((track) => {
      console.log("🎤 Local audio track:", {
        id: track.id,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
      });
      // Force enable just in case
      track.enabled = true;
    });

    // ✅ Attach local video if it's a video call
    if (localVideoRef.current && type === "video") {
      localVideoRef.current.srcObject = stream;
      setTimeout(() => {
        localVideoRef.current
          .play()
          .then(() => console.log("✅ Local video playing"))
          .catch((err) =>
            console.error("❌ Video play failed after metadata loaded:", err)
          );
      }, 100);
    }

    // ✅ Add all tracks to peer connection
    stream.getTracks().forEach((track) => {
      console.log("➕ Adding track:", track.kind);
      pc.current.addTrack(track, stream);
    });

    remoteIdRef.current = targetId;

    console.log("👥 Sending offer to:", remoteIdRef.current);

    try {
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);

      console.log("✅ Sending offer signal:", {
        type: "offer",
        sdp: offer.sdp,
        callType: type,
        senderId: userId,
      });

      sendSignalSender(targetId, {
        type: "offer",
        sdp: offer.sdp,
        callType: type,
        senderId: userId,
      });
    } catch (error) {
      console.error("🚫 Error creating or setting offer:", error);
    }
  };

  const acceptCall = async (type) => {
    setCallType(type);
    const offer = offerRef.current;
    if (!offer || !remoteIdRef.current) return;

    console.log("calltype ", type);
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    pc.current = createPeerConnection(type);

    if (!pc.current) {
      console.error("Peer connection not initialized.");
      return;
    }

    // Clean up old tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    console.log(
      "🛠 Before setRemoteDescription. PC state:",
      pc.current.signalingState
    );
    await pc.current.setRemoteDescription(
      new RTCSessionDescription({ type: "offer", sdp: offer.sdp })
    );

    console.log(
      "✅ Remote description set. Signaling state:",
      pc.current.signalingState
    );

    const constraints =
      type === "audio"
        ? { audio: true, video: false }
        : { audio: true, video: true };

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
    } catch (err) {
      console.error("🚫 getUserMedia error:", err);
      alert("Please allow camera/microphone access in your browser.");
      return;
    }

    stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

    if (localVideoRef.current && type === "video") {
      localVideoRef.current.srcObject = stream;
      try {
        await localVideoRef.current.play();
      } catch (err) {
        console.error("🚫 localVideo play failed:", err);
      }
    }

    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);

    sendSignalSender(remoteIdRef.current, {
      type: "answer",
      sdp: answer.sdp,
      callType: type,
    });

    setIncoming(false);
    setCalling(true);
  };

  const rejectCall = () => {
    offerRef.current = null;
    setIncoming(false);
    setCallFrom(null);

    if (remoteIdRef.current) {
      sendSignalSender(remoteIdRef.current, { type: "reject" });
    }
    remoteIdRef.current = null;
  };

  function stopMediaStream(stream) {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (e) {
        console.warn("Track stop error:", e);
      }
    });
  }

  const endCall = () => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop(); // Stop camera/mic
      });
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      remoteStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    stopMediaStream(localStreamRef.current);
    stopMediaStream(remoteStreamRef.current);
    remoteIdRef.current = null;
    remoteStreamRef.current = null;
    offerRef.current = null;
    setCalling(false);
    setIncoming(false);
    offerRef.current = null;
    navigate("/chat");
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setAudioMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setVideoMuted(!track.enabled);
      });
    }
  };

  return (
    <WebRTCContext.Provider
      value={{
        isCaller,
        calling,
        incoming,
        callFrom,
        localStreamRef,
        remoteStreamRef,
        localVideoRef,
        remoteAudioRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo,
        isAudioMuted,
        isVideoMuted,
        callType,
        pendingRemoteStream,
        hasPlayedRemoteRef,
        incomingCall,
        setIncomingCall,
        setIsCaller,
      }}
    >
      {children}

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: 300, height: 200 }}
      />
      <video
        ref={localVideoRef}
        autoPlay
        muted
        style={{ width: 150, height: 100 }}
      />
      <audio ref={remoteAudioRef} autoPlay playsInline muted={false} />
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
