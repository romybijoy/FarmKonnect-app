import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  getSignalSender,
  setSignalHandler,
  setSignalSender,
} from "../components/call/SignalService";

import { useNavigate } from "react-router-dom";

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pc = useRef(null);
  const remoteIdRef = useRef(null);
  const navigate = useNavigate();

  const [calling, setCalling] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [callFrom, setCallFrom] = useState(null);
  const [isAudioMuted, setAudioMuted] = useState(false);
  const [isVideoMuted, setVideoMuted] = useState(false);

  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const userId = userData?.id;

  const signalSenderRef = useRef(null);

  const waitForSignalSender = async () => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const sender = getSignalSender();
      if (sender) {
        console.log("✅ Signal sender is ready");
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
};

  useEffect(() => {
    // Handle incoming messages
    setSignalHandler(handleSignal);

    // WebRTC calls this to send signal via WebSocket
    setSignalSender((receiverId, signal) => {
      console.log("[WebRTC] 📤 Sending signal to:", receiverId, signal);
      if (signalSenderRef.current) {
        signalSenderRef.current(receiverId, signal);
      } else {
        console.warn("Signal sender not yet ready.");
      }
    });
  }, []);

  const sendSignal = (receiverId, signal) => {
    console.log("[WebRTC] Sending signal to:", receiverId, signal);

    const sender = getSignalSender();

    if (!sender) {
      console.error("No signal sender registered in SignalService!");
      return;
    }

    sender(receiverId, signal);
  };

  const createPeerConnection = () => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(remoteIdRef.current, {
          type: "ice",
          candidate: event.candidate,
        });
      }
    };

    pc.current.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      } else {
        console.warn("remoteVideo ref is null");
      }

      console.log("🎥 [WebRTC] Remote video stream received");
    };
  };

  const startCall = async (receiverId, callType) => {
    console.log("📷 [WebRTC] Local video stream set");
    console.log("🔔 Calling:", receiverId);
    console.log("🚦 signalSenderRef.current:", signalSenderRef.current);
    await waitForSignalSender(); // Wait until signal sender is ready
    remoteIdRef.current = receiverId;
    setCalling(true);
    createPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    });

    localVideo.current.srcObject = stream;
    stream.getTracks().forEach((track) => {
      pc.current.addTrack(track, stream);
    });

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    sendSignal(receiverId, { type: "offer", sdp: offer.sdp, callType });
  };

  const waitForVideoRefs = async () => {
  return new Promise((resolve) => {
    const check = () => {
      if (localVideo.current && remoteVideo.current) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
};


 const handleSignal = async ({ senderId, signal }) => {
  if (!signal) {
    console.warn("[WebRTC] Received empty signal");
    return;
  }

  remoteIdRef.current = senderId;
  console.log("📶 [WebRTC] Received signal:", signal, "from:", senderId);

  await waitForVideoRefs();

  switch (signal.type) {
    case "offer":
      setIncoming(true);              // Show incoming call popup
      setCallFrom(senderId);         // Save caller
      offerRef.current = signal;     // Save offer for later (in acceptCall)
      break;

    case "answer":
      await pc.current.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
      );
      break;

    case "ice":
      if (signal.candidate) {
        await pc.current.addIceCandidate(signal.candidate);
      }
      break;
  }
};

const acceptCall = async (callType = "video") => {
  const signal = offerRef.current;
  if (!signal) return;

  createPeerConnection();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: callType === "video",
    audio: true,
  });

  localVideo.current.srcObject = stream;
  stream.getTracks().forEach((track) => {
    pc.current.addTrack(track, stream);
  });

  await pc.current.setRemoteDescription(
    new RTCSessionDescription({ type: "offer", sdp: signal.sdp })
  );

  const answer = await pc.current.createAnswer();
  await pc.current.setLocalDescription(answer);

  sendSignal(remoteIdRef.current, {
    type: "answer",
    sdp: answer.sdp,
  });

  setIncoming(false);  // Hide popup
  setCalling(true);    // Show call screen
};

const rejectCall = () => {
  offerRef.current = null;
  setIncoming(false);
  setCallFrom(null);
  remoteIdRef.current = null;
  // Optionally: send a reject signal
};

  const endCall = () => {
    if (pc.current) {
      pc.current?.close();
      pc.current = null;
    }
    // Stop local stream tracks
    if (localVideo.current?.srcObject) {
      localVideo.current.srcObject.getTracks().forEach((track) => track.stop());
      localVideo.current.srcObject = null;
    }

    // Clear remote stream too
    if (remoteVideo.current?.srcObject) {
      remoteVideo.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteVideo.current.srcObject = null;
    }

    setCalling(false);
    setIncoming(false);
    setCallFrom(null);
    remoteIdRef.current = null;
    navigate("/chat");
  };

  return (
    <WebRTCContext.Provider
      value={{
        calling,
        incoming,
        callFrom,
        localVideo,
        remoteVideo,
        isAudioMuted,
        isVideoMuted,
        setAudioMuted,
        setVideoMuted,
        startCall,
        endCall,
        acceptCall,
        rejectCall
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
