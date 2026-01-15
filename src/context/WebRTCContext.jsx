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
  const hasStartedRef = useRef(false);
  const pc = useRef(null);
  const remoteIdRef = useRef(null);
  const offerRef = useRef(null);
  const pendingRemoteStream = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const remoteMediaStreamRef = useRef(null);
  const activePeerIdRef = useRef(null);
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
  const [callStatus, setCallStatus] = useState("connecting");
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const userId = userData?.id;

  const flushPendingCandidates = async () => {
    const list = pendingCandidatesRef.current;
    if (!pc.current || !pc.current.remoteDescription) return;
    for (const candidate of list) {
      try {
        -(await pc.current.addIceCandidate(candidate));
        +(await pc.current.addIceCandidate(new RTCIceCandidate(candidate)));
        console.log("Flushed pending ICE candidate");
      } catch (err) {
        console.error("Failed to flush ICE:", err);
      }
    }
    pendingCandidatesRef.current = [];
  };

  const handleSignal = useCallback(async ({ senderId, signal }) => {
    if (!signal) {
      console.warn("[WebRTC] Received empty signal");
      return;
    }

    switch (signal.type) {
      case "offer": {
        if (pc.current && pc.current.signalingState === "have-remote-offer") {
          console.warn("[WebRTC] Already received offer, skipping.");
          return;
        }
        remoteIdRef.current = senderId;
        offerRef.current = signal;

        setCallFrom(senderId);
        setIncomingCall({ senderId, signal });
        setIncoming(true);
        setCallStatus("ringing");
        break;
      }
      case "answer": {
        if (!pc.current) {
          console.warn("[WebRTC] Got answer but no pc.current");
          return;
        }

        console.log(
          "[WebRTC] Answer handler. signalingState:",
          pc.current.signalingState,
          "localDescription:",
          pc.current.localDescription?.type,
          "remoteDescription:",
          pc.current.remoteDescription?.type
        );

        if (pc.current.signalingState !== "have-local-offer") {
          console.warn(
            "[WebRTC] Ignoring answer because signalingState is",
            pc.current.signalingState,
            "expected have-local-offer"
          );
          return;
        }

        try {
          await pc.current.setRemoteDescription(
            new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
          );
          console.log("[WebRTC] Remote answer applied");
        } catch (err) {
          console.error("[WebRTC] Error setting remote answer:", err);
          return;
        }

        await flushPendingCandidates();
        setCallStatus("connecting");
        break;
      }

      case "ice": {
        if (!signal.candidate?.candidate) return;

        if (
          !pc.current?.remoteDescription ||
          pc.current.signalingState === "have-local-offer"
        ) {
          // Buffer until remote description is set
          pendingCandidatesRef.current = [
            ...pendingCandidatesRef.current,
            signal.candidate,
          ];
          return;
        }

        try {
          const iceCandidate = new RTCIceCandidate(signal.candidate);
          await pc.current.addIceCandidate(iceCandidate);
        } catch (e) {
          console.warn("addIceCandidate failed:", e);
        }
        break;
      }
      case "end": {
        console.log("[WebRTC] Remote peer ended the call");
        // end locally, but DO NOT notify again (avoid loop)
        endCall(false);
        break;
      }
      case "reject": {
        offerRef.current = null;
        remoteIdRef.current = null;
        setCalling(false);
        break;
      }
      default:
        console.warn("Unknown signal type:", signal.type);
    }
  }, []);

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
    setSignalHandler(handleSignal);
    setSignalSender(signalSenderFn);
  }, [handleSignal, signalSenderFn, setSignalHandler, setSignalSender]);

  useEffect(() => {
    if (callStatus === "connected") {
      console.log("[WebRTC] callStatus=connected, retry attachRemoteMedia");
      attachRemoteMedia();
    }
  }, [callStatus]);

  // // Attach remote AUDIO if the element appears after ontrack
  // useEffect(() => {
  //   const stream = remoteStreamRef.current;
  //   const audioEl = remoteAudioRef.current;
  //   if (!audioEl || !stream) return;
  //   if (audioEl.srcObject !== stream) {
  //     audioEl.srcObject = stream;
  //   }
  //   audioEl.volume = 1.0;
  //   audioEl.play?.().catch(() => {});
  // }, [remoteAudioRef]);

  // // Attach remote VIDEO if the element appears after ontrack
  // useEffect(() => {
  //   const stream = remoteStreamRef.current;
  //   const videoEl = remoteVideoRef.current;
  //   console.log("first", videoEl);
  //   if (!videoEl || !stream) return;
  //   if (videoEl.srcObject !== stream) {
  //     videoEl.srcObject = stream;
  //   }
  //   videoEl.play?.().catch(() => {});
  // }, [remoteVideoRef]);

  const attachRemoteMedia = () => {
    const stream = remoteStreamRef.current;
    if (!stream) {
      console.log("[attachRemoteMedia] No remote stream yet");
      return;
    }

    // Attach video
    if (remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject !== stream) {
        console.log("[attachRemoteMedia] Attaching stream to remoteVideoEl");
        remoteVideoRef.current.srcObject = stream;
      }
      remoteVideoRef.current.muted = false;
      const p = remoteVideoRef.current.play?.();
      p &&
        p.catch((err) => {
          console.warn(
            "[attachRemoteMedia] Video play failed:",
            err?.name,
            err?.message
          );
        });
    } else {
      console.log("[attachRemoteMedia] remoteVideoRef NOT ready yet");
    }

    // Attach audio
    if (remoteAudioRef.current) {
      if (remoteAudioRef.current.srcObject !== stream) {
        console.log("[attachRemoteMedia] Attaching stream to remoteAudioEl");
        remoteAudioRef.current.srcObject = stream;
      }
      remoteAudioRef.current.volume = 1.0;
      const ap = remoteAudioRef.current.play?.();
      ap &&
        ap.catch((err) => {
          console.warn(
            "[attachRemoteMedia] Audio play failed:",
            err?.name,
            err?.message
          );
        });
    } else {
      console.log("[attachRemoteMedia] remoteAudioRef NOT ready yet");
    }
  };

  const createPeerConnection = (type) => {
    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Strongly consider adding TURN in production:
        // { urls: "turn:your.turn.server:3478", username: "user", credential: "pass" },
      ],
    });

    if (!remoteMediaStreamRef.current) {
      remoteMediaStreamRef.current = new MediaStream();
    }
    // // Stabilize m-lines
    // pc.current.addTransceiver("audio", { direction: "sendrecv" });
    // pc.current.addTransceiver("video", { direction: "sendrecv" });

    pc.current.ontrack = (event) => {
      console.log("[ontrack] Fired. Streams received:", event.streams);
      console.log("[ontrack] Track kind:", event.track?.kind);
      console.log("[ontrack] Track enabled:", event.track?.enabled);
      console.log("[ontrack] Track readyState:", event.track?.readyState);

      const track = event.track;

      // Track lifecycle diagnostics
      track.onunmute = () =>
        console.log("[remote track]", track.kind, "UNMUTE");
      track.onmute = () => console.log("[remote track]", track.kind, "MUTE");
      track.onended = () => console.log("[remote track]", track.kind, "ENDED");
      console.log("[ontrack] Track received:", {
        kind: track?.kind,
        enabled: track?.enabled,
        readyState: track?.readyState,
        muted: track?.muted,
        settings: track?.getSettings(),
      });

      console.log(
        "[ontrack] kind:",
        track?.kind,
        "streams:",
        event.streams?.length
      );

      if (!track) {
        console.warn("[ontrack] No track received");
        return;
      }

      // Explicitly unmute the track
      if (track.kind === "video") {
        track.enabled = true;
        console.log("Video track muted:", track.muted);
        // track.muted = false; unable to unmuted due to browser policies
      }

      // Ensure we have a single remote MediaStream and add/replace tracks
      const remoteStream = remoteMediaStreamRef.current || new MediaStream();
      if (!remoteMediaStreamRef.current) {
        remoteMediaStreamRef.current = remoteStream;
      }

      // Remove any existing track of same kind, then add the new one
      remoteStream
        .getTracks()
        .filter((t) => t.kind === track.kind)
        .forEach((t) => remoteStream.removeTrack(t));
      remoteStream.addTrack(track);

      // Expose for later effects
      remoteStreamRef.current = remoteStream;

      console.log(
        "[ontrack] Remote stream now has tracks:",
        remoteStream.getTracks().map((t) => t.kind)
      );

      remoteStreamRef.current = remoteStream;
      attachRemoteMedia();

      // Attach AUDIO if element exists; otherwise fallback
      if (track.kind === "audio" && remoteAudioRef.current) {
        if (remoteAudioRef.current.srcObject !== remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
        remoteAudioRef.current.volume = 1.0;
        remoteAudioRef.current.play?.().catch(() => {});
      } else {
        // Buffer: let CallPage attach when the <audio> mounts
        remoteStreamRef.current = remoteStream;
      }

      // Attach VIDEO if element exists (do NOT gate by callType)
      if (track.kind === "video" && remoteVideoRef.current) {
        if (remoteVideoRef.current.srcObject !== remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        const p = remoteVideoRef.current.play?.();
        p &&
          p.catch((err) => {
            if (err?.name !== "AbortError") {
              console.warn(
                "Remote video play failed:",
                err?.name,
                err?.message
              );
            }
          });
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
      const state = pc.current?.iceConnectionState;
      console.log("ICE Connection State:", state);

      if (state === "checking") {
        setCallStatus("connecting");
      } else if (state === "connected" || state === "completed") {
        setCallStatus("connected");
      } else if (state === "disconnected" || state === "failed") {
        setCallStatus("disconnected");
      } else if (state === "closed") {
        setCallStatus("ended");
      }
    };

    return pc.current;
  };

  const startCall = async (targetId, type) => {
    console.log("Sender: Starting call with type:", type);
    if (hasStartedRef.current && isCaller) {
      console.warn("[startCall] already started; ignoring");
      return;
    }
    // Optional: block if a PC is already negotiating
    if (pc.current && pc.current.signalingState !== "stable") {
      console.warn("[startCall] PC not stable; ignoring");
      return;
    }

    // If we're already in a call with someone else, end it first
    if (activePeerIdRef.current && activePeerIdRef.current !== targetId) {
      console.warn(
        "[startCall] ending previous call with",
        activePeerIdRef.current
      );
      endCall();
    }

    hasStartedRef.current = true;
    activePeerIdRef.current = targetId;

    console.log("Target and type:", targetId, type);
    setIsCaller(true);
    setCallType(type);
    setCalling(true);

    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    pc.current = createPeerConnection(type);
    if (!pc.current) return;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    const constraints =
      type === "audio" ? { audio: true } : { audio: true, video: true };
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(
        "Sender: Local stream tracks:",
        stream.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted,
          settings: t.getSettings(),
        }))
      );
    } catch (err) {
      console.error("getUserMedia failed:", err);
      hasStartedRef.current = false; // allow retry if getUserMedia failed
      activePeerIdRef.current = null;
      return;
    }

    localStreamRef.current = stream;

    if (localVideoRef.current && type === "video") {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      localVideoRef.current.onloadedmetadata = () => {
        localVideoRef.current.play().catch(() => {});
      };
    }

    stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

    console.log(
      "Sender: Added tracks to PC:",
      pc.current.getSenders().map((sender) => ({
        track: sender.track?.kind,
        enabled: sender.track?.enabled,
        settings: sender.track?.getSettings(),
      }))
    );
    remoteIdRef.current = targetId;

    try {
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);

      sendSignalSender(targetId, {
        type: "offer",
        sdp: offer.sdp,
        callType: type,
        senderId: userId,
      });

      setCallStatus("calling");
    } catch (err) {
      console.error("Error creating offer:", err);
      hasStartedRef.current = false; // allow retry on failure
      activePeerIdRef.current = null;
    }
  };

  // (SRD -> flush ICE -> getUserMedia -> addTrack -> answer)
  const acceptCall = async (type) => {
    console.log("Accepting call of type:", type);
    setIsCaller(false);

    const offer = offerRef.current;
    if (!offer || !remoteIdRef.current) return;

    const typeFromOffer = offer?.callType || type || "audio";
    setCallType(typeFromOffer);

    // Reset any existing PC
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    // Create fresh PC
    pc.current = createPeerConnection(typeFromOffer);
    if (!pc.current) return;

    try {
      // 1) Apply remote offer FIRST
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: offer.sdp })
      );

      // 2) Flush any buffered ICE candidates (they now have a remote description to bind to)
      await flushPendingCandidates();

      // 3) Get local media (match call type)
      const constraints =
        typeFromOffer === "audio"
          ? { audio: true }
          : { audio: true, video: true };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.error("getUserMedia error:", err);
        return;
      }
      localStreamRef.current = stream;

      // Show local preview if video call
      if (localVideoRef.current && typeFromOffer === "video") {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play().catch(() => {});
        };
      }

      // 4) Add local tracks AFTER SRD (keeps m-lines aligned)
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

      // 5) Create and set answer
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      // 6) Signal answer back
      sendSignalSender(remoteIdRef.current, {
        type: "answer",
        sdp: answer.sdp,
        callType: typeFromOffer,
      });

      // UI state
      setIncoming(false);
      setCalling(true);

      // Mark session started for guards
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        activePeerIdRef.current = remoteIdRef.current;
      }
    } catch (err) {
      console.error("acceptCall failed:", err);
    }
  };

  const rejectCall = () => {
    hasStartedRef.current = false;
    activePeerIdRef.current = null;
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

  const endCall = (notifyRemote = true) => {
    console.log("[WebRTC] endCall invoked");
    hasStartedRef.current = false;
    activePeerIdRef.current = null;

    // 👉 Tell the other peer that this call is over
    if (notifyRemote && remoteIdRef.current) {
      try {
        sendSignalSender(remoteIdRef.current, { type: "end" });
      } catch (e) {
        console.warn("[WebRTC] Failed to send end signal", e);
      }
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
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
    offerRef.current = null;
    setCalling(false);
    setIncoming(false);
    setCallStatus("ended");
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

  // Attach any pending remote stream once refs become available
  // useEffect(() => {
  //   const attachIfReady = () => {
  //     const stream = pendingRemoteStream.current || remoteStreamRef.current;
  //     if (!stream) return;

  //     if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
  //       remoteVideoRef.current.srcObject = stream;
  //       remoteVideoRef.current.onloadedmetadata = () => {
  //         remoteVideoRef.current
  //           .play()
  //           .catch((err) =>
  //             console.warn("Remote video play failed:", err?.name, err?.message)
  //           );
  //       };
  //       pendingRemoteStream.current = null;
  //     }

  //     if (remoteAudioRef.current && !remoteAudioRef.current.srcObject) {
  //       const audioEl = remoteAudioRef.current;
  //       audioEl.srcObject = stream;
  //       audioEl.volume = 1.0;
  //       audioEl.onloadedmetadata = () => {
  //         audioEl
  //           .play()
  //           .catch((err) =>
  //             console.warn("Remote audio play failed:", err?.name, err?.message)
  //           );
  //       };
  //     }
  //   };

  //   attachIfReady();
  //   const t1 = setTimeout(attachIfReady, 100);
  //   const t2 = setTimeout(attachIfReady, 500);

  //   return () => {
  //     clearTimeout(t1);
  //     clearTimeout(t2);
  //   };
  // }, [remoteVideoRef, remoteAudioRef]);

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
        callStatus,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
