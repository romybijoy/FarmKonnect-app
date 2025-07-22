import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
// import {
//   getSignalSender,
//   setSignalHandler,
//   setSignalSender,
// } from "../components/call/SignalService";

import { useSignal } from "./SignalContext";

import { useNavigate } from "react-router-dom";

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pc = useRef(null);
  const remoteIdRef = useRef(null);
  const navigate = useNavigate();
  const offerRef = useRef(null);
  const pendingRemoteStream = useRef(null);
  const { setSignalHandler, sendSignalSender, setSignalSender } = useSignal();
  const [calling, setCalling] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [callFrom, setCallFrom] = useState(null);
  const [isAudioMuted, setAudioMuted] = useState(false);
  const [isVideoMuted, setVideoMuted] = useState(false);
  const [isCaller, setIsCaller] = useState(false);
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const userId = userData?.id;

  const signalSenderRef = useRef(null);
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

        console.log("[WebRTC] Processing incoming offer");
        remoteIdRef.current = senderId;
        offerRef.current = signal;
        setCallFrom(senderId);
        setIncoming(true);
        break;

      case "answer":
        if (!pc.current || pc.current.signalingState !== "have-local-offer") {
          console.warn(
            "[WebRTC] Ignoring answer: not in expected state, current state:",
            pc.current?.signalingState
          );
          return;
        }
        try {
          await pc.current.setRemoteDescription(
            new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
          );
          console.log("[WebRTC] Answer set as remote description");

          // ✅ Flush ICE
          await flushPendingCandidates();
        } catch (err) {
          console.error("❌ Error setting remote description for answer:", err);
        }
        break;

      case "ice":
        if (
          !pc.current ||
          !pc.current.remoteDescription ||
          pc.current.remoteDescription.type === null
        ) {
          console.warn(
            "🌐 Queuing ICE candidate: remote description not set yet"
          );
          pendingCandidates.push(signal.candidate);
          return;
        }

        if (signal.candidate && signal.candidate.candidate) {
          const iceCandidate = new RTCIceCandidate({
            candidate: signal.candidate.candidate,
            sdpMid: signal.candidate.sdpMid,
            sdpMLineIndex: signal.candidate.sdpMLineIndex,
          });
          try {
            await pc.current.addIceCandidate(iceCandidate);
            console.log("✅ ICE candidate added");
          } catch (err) {
            console.error("❌ Failed to add ICE candidate:", err);
          }
        }
        break;

      case "reject":
        console.warn("📴 Call was rejected by remote");
        offerRef.current = null;
        remoteIdRef.current = null;
        setCalling(false);
        break;

      default:
        console.warn("⚠️ Unknown signal type received:", signal.type);
    }
  }, []);

  const signalSenderFn = useCallback((receiverId, signal) => {
    console.log("[WebRTC] 📤 Sending signal to:", receiverId, signal);
    // Your actual signaling logic here
  }, []);

  // useEffect(() => {
  //   // Handle incoming messages
  //   setSignalHandler(handleSignal);

  //   // WebRTC calls this to send signal via WebSocket
  //   setSignalSender((receiverId, signal) => {
  //     console.log("[WebRTC] 📤 Sending signal to:", receiverId, signal);
  //     // if (signalSenderRef.current) {
  //     //   signalSenderRef.current(receiverId, signal);
  //     // } else {
  //     //   console.warn("Signal sender not yet ready.");
  //     // }
  //   });
  // }, [handleSignal, setSignalHandler, setSignalSender]);

  useEffect(() => {
    setSignalHandler(handleSignal);
    setSignalSender(signalSenderFn);
  }, [handleSignal, setSignalHandler, setSignalSender, signalSenderFn]);

  const sendSignal = (receiverId, signal) => {
    if (!receiverId) {
      console.warn("❌ [WebRTC] Cannot send signal: receiverId is null");
      return;
    }

    if (!sendSignalSender) {
      console.error("[WebRTC] Signal sender not available!");
      return;
    }
    console.log("[WebRTC] Sending signal to:", receiverId, signal);
    sendSignalSender(receiverId, signal);
  };

  const createPeerConnection = () => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.onsignalingstatechange = () => {
      console.log("🔁 Signaling state changed:", pc.current.signalingState);
    };

    pc.current.ontrack = (event) => {
      const stream = event.streams[0];
      console.log("📡 [Receiver] Received remote track", stream);

      if (remoteVideoRef.current) {
        console.log("🎯 Attaching remote stream immediately");
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current
          .play()
          .then(() => console.log("✅ Remote video playing"))
          .catch((err) =>
            console.error("❌ Remote video play failed:", err.name, err.message)
          );
      } else {
        console.warn("⏳ remoteVideoRef not ready, storing stream temporarily");
        pendingRemoteStream.current = stream;
      }
    };

    // ❄️ ICE Candidate handling
    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
        if (remoteIdRef.current) {
          sendSignal(remoteIdRef.current, {
            type: "ice",
            candidate: { candidate, sdpMid, sdpMLineIndex },
          });
          console.log("❄️ Sent ICE candidate:", event.candidate);
        } else {
          pendingCandidates.push(event.candidate); // wait until remoteId is known
        }
      }
    };

    pc.current.onconnectionstatechange = () => {
      console.log("🔄 Connection state:", pc.current.connectionState);
    };
  };

  const startCall = async (targetId, callType = "video") => {
    setIsCaller(true);

    if (!pc.current) createPeerConnection();

    // 🔇 Stop any old local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    try {
      // 🎥 Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("🎤 Local audio tracks:", stream.getAudioTracks());
      localStreamRef.current = stream;
      console.log("🎥 Acquired local stream:", stream);

      // ⏳ Wait for video element to mount
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (localVideoRef.current) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      // 🎬 Attach stream to local video element
      if (localVideoRef.current) {
        // localVideoRef.current.muted = true;
        localVideoRef.current.srcObject = stream;

        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current
            .play()
            .then(() => console.log("✅ Local video playing"))
            .catch((err) =>
              console.error("❌ Video play failed after metadata loaded:", err)
            );
        };
      }
      // ➕ Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log("➕ Adding track:", track.kind);

        pc.current.addTrack(track, stream);
      });

      remoteIdRef.current = targetId;

      // 📡 Create and set local offer
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      console.log(
        "📡 Signaling state after setLocalDescription:",
        pc.current.signalingState
      );

      // 🚀 Send offer via signaling
      if (!sendSignal) {
        console.error("❌ Signal sender not ready");
        return;
      }

      sendSignal(targetId, {
        type: "offer",
        sdp: offer.sdp,
        callType,
      });

      // ❄️ Send any pending ICE candidates
      pendingCandidates.forEach((candidate) => {
        sendSignal(remoteIdRef.current, {
          type: "ice",
          candidate,
        });
      });
      pendingCandidates = [];

      // 📞 Mark call as active
      setCalling(true);
    } catch (err) {
      console.error("❌ Failed to start call:", err);
    }
  };

  const waitForVideoRefs = () => {
    return new Promise((resolve, reject) => {
      const maxWait = 2000; // max wait time 2 seconds
      const interval = 50;
      let waited = 0;

      const check = () => {
        if (localStreamRef.current && remoteStreamRef.current) {
          return resolve();
        }

        waited += interval;
        if (waited >= maxWait) {
          console.warn("[WebRTC] Video refs not ready after 2s");
          return resolve(); // fallback to continue anyway
        }

        setTimeout(check, interval);
      };

      check();
    });
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

  const acceptCall = async () => {
    const offer = offerRef.current;
    if (!offer || !offer.sdp || !remoteIdRef.current) return;

    if (!pc.current) createPeerConnection();

    try {
      // Step 1: Set remote description from stored offer
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: offer.sdp })
      );
      console.log("[WebRTC] Offer set as remote description");

      // ✅ Step 2: Flush any queued ICE candidates now that remote desc is set
      for (const candidate of pendingCandidates) {
        try {
          await pc.current.addIceCandidate(candidate);
          console.log("✅ Added queued ICE candidate (after offer)");
        } catch (err) {
          console.error("❌ Failed to add queued ICE:", err);
        }
      }
      pendingCandidates = [];

      // Step 3: Get media and add tracks
      const stream = await navigator.mediaDevices.getUserMedia({
        video: offer.callType === "video",
        audio: true,
      });
      localStreamRef.current = stream;
      console.log(
        "🎥 Assigned local stream in acceptCall:",
        localStreamRef.current
      );

      if (localVideoRef.current) {
        localVideoRef.current.muted = true;
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

      // Step 4: Create and send answer
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      sendSignal(remoteIdRef.current, {
        type: "answer",
        sdp: answer.sdp,
      });

      setIncoming(false);
      setCalling(true);
    } catch (err) {
      console.error("❌ Error during acceptCall:", err);
    }
  };

  const rejectCall = () => {
    // Clear state
    offerRef.current = null;
    setIncoming(false);
    setCallFrom(null);

    // Notify the caller (optional but recommended)
    if (remoteIdRef.current) {
      sendSignal(remoteIdRef.current, {
        type: "reject",
      });
    }

    remoteIdRef.current = null;
  };

  const endCall = () => {
    // 1. Close the connection
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    // 2. Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // 3. Detach and pause local video
    if (localVideoRef.current) {
      localVideoRef.current.pause();
      localVideoRef.current.srcObject = null;
    }

    // 4. Detach and pause remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.pause();
      remoteVideoRef.current.srcObject = null;
    }

    // 5. Reset state
    setCalling(false);
    setIncoming(false);
    offerRef.current = null;

    // 6. (Optional) Navigate away
    navigate("/chat");
  };

  return (
    <WebRTCContext.Provider
      value={{
        isCaller,
        setIsCaller,
        calling,
        incoming,
        callFrom,
        localStreamRef,
        remoteVideoRef,
        localVideoRef,
        pendingRemoteStream,
        isAudioMuted,
        isVideoMuted,
        toggleAudio,
        toggleVideo,
        setAudioMuted,
        setVideoMuted,
        startCall,
        endCall,
        acceptCall,
        rejectCall,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
