// import React, { useEffect, useRef, useState } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
// import {
//   connectWebSocket,
//   sendMessageWS,
//   disconnectWebSocket
// } from "../../service/WebsocketService";
// import { useSearchParams } from "react-router-dom";

// const VideoCallPage = () => {
//   const [incoming, setIncoming] = useState(null);
//   const [inCall, setInCall] = useState(false);

//   const localVid = useRef(), remoteVid = useRef();
//   const peer = useRef(), stomp = useRef();
//   const me = JSON.parse(localStorage.getItem("myInfo"));

//   const [params] = useSearchParams();
// const call = {
//   type: params.get("type"),
//   to: params.get("to"),
// };

//   useEffect(() => {
//      if (me && me.id) {
//       connectWebSocket(me.id, null, handleSignal)
//     .then(() => {
//       console.log("WebSocket fully connected");

//       if (call && call.to) {
//         sendSignal({ type: "call", from: me.id, to: call.to });
//       }
//     });
//   }
//   return () => disconnectWebSocket();
//   }, [me.id]);

//   // ✅ Only send signaling after connection established
//   useEffect(() => {
//     sendSignal({ type: "call", from: me.id, to: call.to });
//   }, [call]);
// const sendSignal = (msg) => {
//     sendMessageWS("/app/signal", msg);
//   };

//   const handleSignal = async (m) => {
//     switch (m.type) {
//       case "call":
//         setIncoming(m);
//         break;
//       case "accept":
//         await setupPeer(m.sdp, true);
//         break;
//       case "reject":
//         alert("Call was rejected");
//         break;
//       case "offer":
//       case "answer":
//       case "candidate":
//         await handleWebRTC(m);
//         break;
//       default:
//         break;
//     }
//   };

//   const acceptCall = async () => {
//     setIncoming(null);
//     await setupPeer(incoming.sdp, false);
//     send({ type: "accept", from: me.id, to: incoming.from });
//     setInCall(true);
//   };

//   const rejectCall = () => {
//     send({ type: "reject", from: me.id, to: incoming.from });
//     setIncoming(null);
//   };

//   const setupPeer = async (remoteSDP, initiator) => {
//     const s = await navigator.mediaDevices.getUserMedia({
//       video: call.type === "video", audio: true
//     });
//     localVid.current.srcObject = s;

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
//     });

//     pc.onicecandidate = e => {
//       if (e.candidate) {
//         send({ type: "candidate", candidate: e.candidate, from: me.id, to: call.to });
//       }
//     };

//     pc.ontrack = e => {
//       remoteVid.current.srcObject = e.streams[0];
//     };

//     s.getTracks().forEach(t => pc.addTrack(t, s));
//     peer.current = pc;

//     if (initiator) {
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       send({ type: "offer", sdp: offer, from: me.id, to: call.to });
//     } else {
//       await pc.setRemoteDescription(new RTCSessionDescription(remoteSDP));
//       const ans = await pc.createAnswer();
//       await pc.setLocalDescription(ans);
//       send({ type: "answer", sdp: ans, from: me.id, to: call.to });
//     }
//     setInCall(true);
//   };

//   const handleWebRTC = async (m) => {
//     if (!peer.current) return;

//     if (m.type === "offer" || m.type === "answer") {
//       await peer.current.setRemoteDescription(new RTCSessionDescription(m.sdp));
//     } else if (m.type === "candidate") {
//       await peer.current.addIceCandidate(new RTCIceCandidate(m.candidate));
//     }
//   };

//   return (
//     <div>
//       {incoming && (
//         <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
//           <div className="bg-white p-4 rounded">
//             <p>Incoming {incoming.sdp ? "Video" : "Audio"} call from {incoming.from}</p>
//             <button onClick={acceptCall}>Accept</button>
//             <button onClick={rejectCall}>Reject</button>
//           </div>
//         </div>
//       )}
//       {inCall && (
//         <div className="flex gap-4">
//           <video ref={localVid} autoPlay muted className="w-80 h-60 bg-black" />
//           <video ref={remoteVid} autoPlay className="w-80 h-60 bg-black" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoCallPage;

// import React, { useEffect, useRef, useState } from "react";
// import { useWebSocket } from "../../context/WebSocketContext";
// import { useSearchParams } from "react-router-dom";

// const VideoCallPage = () => {
//   const [incoming, setIncoming] = useState(null);
//   const [inCall, setInCall] = useState(false);
//   const [params] = useSearchParams();

//   const [me, setMe] = useState(JSON.parse(localStorage.getItem("myInfo")));

//   const localVid = useRef();
//   const remoteVid = useRef();
//   const peer = useRef();
//   const unsubscribeSignal = useRef();

//   const { connectWebSocket, disconnectWebSocket, sendMessageWS, subscribeToSignal } = useWebSocket();

//   console.log(me)
//   const call = {
//     type: params.get("type"), // "video" or "audio"
//     to: params.get("to"),
//   };

//   // 1️⃣ Connect WebSocket and subscribe to signaling
//   useEffect(() => {
//     if (!me || !me.id) return;

//     connectWebSocket(me.id).then(() => {
//       unsubscribeSignal.current = subscribeToSignal(me.id, handleSignal);

//       // Auto initiate call if "to" param exists
//       if (call.to) {
//         sendSignal({ type: "call", from: me.id, to: call.to });
//       }
//     });

//     return () => {
//       if (unsubscribeSignal.current) unsubscribeSignal.current();
//       disconnectWebSocket();
//     };
//   }, [me?.id]);

//   // 2️⃣ Send signal wrapper
//   const sendSignal = (msg) => {
//     sendMessageWS("/app/signal", msg);
//   };

//   // 3️⃣ Handle incoming signals
//   const handleSignal = async (msg) => {
//     console.log("Received signal: ", msg);
//     switch (msg.type) {
//       case "call":
//         setIncoming(msg);
//         break;
//       case "accept":
//         await setupPeer(msg.sdp, true);
//         break;
//       case "reject":
//         alert("Call was rejected");
//         break;
//       case "offer":
//       case "answer":
//       case "candidate":
//         await handleWebRTC(msg);
//         break;
//       default:
//         console.warn("Unknown signal type: ", msg.type);
//     }
//   };

//   // 4️⃣ Accept / Reject UI
//   const acceptCall = async () => {
//     setIncoming(null);
//     await setupPeer(null, false);
//     sendSignal({ type: "accept", from: me.id, to: incoming.from });
//     setInCall(true);
//   };

//   const rejectCall = () => {
//     sendSignal({ type: "reject", from: me.id, to: incoming.from });
//     setIncoming(null);
//   };

//   // 5️⃣ Setup WebRTC peer connection
//   const setupPeer = async (remoteSDP, initiator) => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: call.type === "video",
//       audio: true,
//     });

//     localVid.current.srcObject = stream;

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     pc.onicecandidate = (e) => {
//       if (e.candidate) {
//         sendSignal({
//           type: "candidate",
//           candidate: e.candidate,
//           from: me.id,
//           to: call.to || incoming?.from,
//         });
//       }
//     };

//     pc.ontrack = (e) => {
//       remoteVid.current.srcObject = e.streams[0];
//     };

//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//     peer.current = pc;

//     if (initiator) {
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       sendSignal({ type: "offer", sdp: offer, from: me.id, to: call.to });
//     } else if (remoteSDP) {
//       await pc.setRemoteDescription(new RTCSessionDescription(remoteSDP));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       sendSignal({ type: "answer", sdp: answer, from: me.id, to: incoming.from });
//     }

//     setInCall(true);
//   };

//   // 6️⃣ Handle offer, answer, candidate
//   const handleWebRTC = async (msg) => {
//     if (!peer.current) return;

//     if (msg.type === "offer" || msg.type === "answer") {
//       await peer.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
//     } else if (msg.type === "candidate") {
//       await peer.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
//     }
//   };

//   return (
//     <div>
//       {incoming && (
//         <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
//           <div className="bg-white p-4 rounded">
//             <p>Incoming {incoming.sdp ? "Video" : "Audio"} call from {incoming.from}</p>
//             <button onClick={acceptCall}>Accept</button>
//             <button onClick={rejectCall}>Reject</button>
//           </div>
//         </div>
//       )}

//       {inCall && (
//         <div className="flex gap-4">
//           <video ref={localVid} autoPlay muted className="w-80 h-60 bg-black" />
//           <video ref={remoteVid} autoPlay className="w-80 h-60 bg-black" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoCallPage;

// import React, { useEffect, useState, useRef } from "react";
// import { useSearchParams } from "react-router-dom";
// import { useWebSocket } from "../../context/WebSocketContext";

// const VideoCallPage = () => {
//   const [params] = useSearchParams();
//   const { connectWebSocket, subscribeToSignal, sendSignal } = useWebSocket();

//   const localVideoRef = useRef();
//   const remoteVideoRef = useRef();
//   const peerConnection = useRef();
//   const [incomingCall, setIncomingCall] = useState(null);
//   const [inCall, setInCall] = useState(false);
//   const [user, setUser] = useState(null);

//   const targetId = params.get("to");
//   const callType = params.get("type");

//   useEffect(() => {
//     const userInfo = JSON.parse(localStorage.getItem("myInfo"));
//     setUser(userInfo);
//   }, []);

//   useEffect(() => {
//     if (!user) return;

//     connectWebSocket(user.id).then(() => {
//       console.log("Connected to WebSocket");

//       const subscription = subscribeToSignal(user.id, handleSignal);
//       return () => subscription.unsubscribe();
//     });
//   }, [user]);

//   const handleSignal = async (signal) => {
//     const { type, from, data } = signal;

//     switch (type) {
//       case "CALL_OFFER":
//         setIncomingCall({ from });
//         break;

//       case "CALL_ACCEPTED":
//         await startWebRTC(true, from);
//         break;

//       case "WEBRTC_OFFER":
//         await receiveOffer(data, from);
//         break;

//       case "WEBRTC_ANSWER":
//         await receiveAnswer(data);
//         break;

//       case "ICE_CANDIDATE":
//         await addIceCandidate(data);
//         break;

//       default:
//         break;
//     }
//   };

//   const startCall = () => {
//     sendSignal({ type: "CALL_OFFER", from: user.id, to: targetId });
//   };

//   const acceptCall = async () => {
//     sendSignal({ type: "CALL_ACCEPTED", from: user.id, to: incomingCall.from });
//     setIncomingCall(null);
//     await startWebRTC(false, incomingCall.from);
//   };

//   const startWebRTC = async (initiator, remoteUserId) => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: callType === "video",
//       audio: true,
//     });

//     localVideoRef.current.srcObject = stream;

//     peerConnection.current = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

//     peerConnection.current.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     peerConnection.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         sendSignal({
//           type: "ICE_CANDIDATE",
//           from: user.id,
//           to: initiator ? targetId : remoteUserId,
//           data: event.candidate,
//         });
//       }
//     };

//     if (initiator) {
//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);
//       sendSignal({
//         type: "WEBRTC_OFFER",
//         from: user.id,
//         to: targetId,
//         data: offer,
//       });
//     }
//   };

//   const receiveOffer = async (offer, from) => {
//     await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await peerConnection.current.createAnswer();
//     await peerConnection.current.setLocalDescription(answer);

//     sendSignal({
//       type: "WEBRTC_ANSWER",
//       from: user.id,
//       to: from,
//       data: answer,
//     });

//     setInCall(true);
//   };

//   const receiveAnswer = async (answer) => {
//     await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//     setInCall(true);
//   };

//   const addIceCandidate = async (candidate) => {
//     await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//   };

//   return (
//     <div className="p-5">
//       <h2>{callType === "video" ? "Video Call" : "Audio Call"}</h2>

//       {incomingCall && (
//         <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
//           <div className="bg-white p-5 rounded">
//             <p>Incoming call from {incomingCall.from}</p>
//             <button className="mr-4" onClick={acceptCall}>Accept</button>
//             <button onClick={() => setIncomingCall(null)}>Reject</button>
//           </div>
//         </div>
//       )}

//       {!inCall && !incomingCall && (
//         <button onClick={startCall}>Start Call</button>
//       )}

//       <div className="flex mt-5 gap-10">
//         <video ref={localVideoRef} autoPlay muted className="w-80 h-60 bg-black" />
//         <video ref={remoteVideoRef} autoPlay className="w-80 h-60 bg-black" />
//       </div>
//     </div>
//   );
// };

// export default VideoCallPage;

import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../context/WebSocketContext";
import { useSearchParams } from "react-router-dom";

const VideoCallPage = () => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);
  const stream = useRef(null);

  const { connectWebSocket, sendMessageWS, subscribeToSignal } = useWebSocket();
  const [params] = useSearchParams();

  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [connected, setConnected] = useState(false);

  const me = JSON.parse(localStorage.getItem("myInfo"));
  const callType = params.get("type"); // audio or video
  const targetUser = params.get("to");

  // WebSocket Connection
  useEffect(() => {
    if (!me?.id) return;
    connectWebSocket(me.id).then(() => {
      console.log("WebSocket connected");
      setConnected(true);
    });
  }, [me?.id]);

  // WebSocket Subscription to signaling topic
  useEffect(() => {
    if (!connected) return;
    subscribeToSignal(me.id, handleSignaling);
  }, [connected]);

  // Initiate call if caller
  useEffect(() => {
    if (connected && targetUser) {
      sendSignal({
        type: "call",
        from: me.id,
        to: targetUser,
        callType: callType,
      });
    }
  }, [connected, targetUser]);

  // Send signal via WebSocket
  const sendSignal = (msg) => {
    sendMessageWS("/app/signal", msg);
  };

  // Handle incoming signaling messages
  const handleSignaling = async (msg) => {
    console.log("Received signal:", msg);
    switch (msg.type) {
      case "call":
        setIncomingCall(msg);
        break;
      case "accept":
        await createPeer(true);
        break;
      case "reject":
        alert("Call rejected");
        break;
      case "offer":
        await handleOffer(msg);
        break;
      case "answer":
        await handleAnswer(msg);
        break;
      case "candidate":
        await handleCandidate(msg);
        break;
      default:
        break;
    }
  };

  const acceptCall = async () => {
    setIncomingCall(null);
    sendSignal({ type: "accept", from: me.id, to: incomingCall.from });
  };

  const rejectCall = () => {
    sendSignal({ type: "reject", from: me.id, to: incomingCall.from });
    setIncomingCall(null);
  };

  // WebRTC setup
  const createPeer = async (isCaller) => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      localVideo.current.srcObject = stream.current;

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream.current);
      });

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal({
            type: "candidate",
            candidate: event.candidate,
            from: me.id,
            to: targetUser || incomingCall?.from,
          });
        }
      };

      peerConnection.current.ontrack = (event) => {
        remoteVideo.current.srcObject = event.streams[0];
      };

      if (isCaller) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        sendSignal({
          type: "offer",
          sdp: offer,
          from: me.id,
          to: targetUser,
        });
      }
      setInCall(true);
    } catch (err) {
      console.error("Media error", err);
      alert("Failed to access camera/mic");
    }
  };

  const handleOffer = async (msg) => {
    await createPeer(false);
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(msg.sdp)
    );
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    sendSignal({
      type: "answer",
      sdp: answer,
      from: me.id,
      to: msg.from,
    });
  };

  const handleAnswer = async (msg) => {
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(msg.sdp)
    );
  };

  const handleCandidate = async (msg) => {
    await peerConnection.current.addIceCandidate(
      new RTCIceCandidate(msg.candidate)
    );
  };

  return (
    <div>
      {incomingCall && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70">
          <div className="bg-white p-6 rounded-lg">
            <p>
              Incoming {incomingCall.callType} call from user{" "}
              {incomingCall.from}
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={acceptCall}
                className="bg-green-500 px-4 py-2 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 px-4 py-2 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      {inCall && (
        <div className="flex gap-6 justify-center mt-10">
          <div>
            <h2>Local</h2>
            <video
              ref={localVideo}
              autoPlay
              muted
              className="w-80 h-60 bg-black rounded-lg"
            />
          </div>
          <div>
            <h2>Remote</h2>
            <video
              ref={remoteVideo}
              autoPlay
              className="w-80 h-60 bg-black rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;
