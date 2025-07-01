import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Stomp } from "@stomp/stompjs";
import store from "../redux/store";
import { useSelector } from "react-redux";
import { addMessage, addGroupMessage } from "../redux/slices/ChatSlice";
import {
  getSignalHandler,
  setSignalSender,
} from "../components/call/SignalService";

// 1️⃣ Create Context
const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const stompClient = useRef(null);
  const subscriptions = useRef(new Map());
  const [connected, setConnected] = useState(false);
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const userId = userData?.id;
  console.log(userId);
  useEffect(() => {
    if (userId) {
      connectWebSocket(userId).then(() => {
        // Set the signal sender only after WebSocket is connected
        console.log("[WebSocket] Subscribing to /topic/call/" + userId);
        setSignalSender((receiverId, signal) => {
          sendMessageWS("/app/call/signal", {
            ...signal,
            callerId: userId,
            receiverId,
            targetId: receiverId, // for ICE
          });
        });
      });
    }
  }, [userId]);

  const connectWebSocket = (userId) => {
    return new Promise((resolve, reject) => {
      if (stompClient.current && stompClient.current.connected) {
        console.log("Already connected");
        resolve();
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        reject("Missing token");
        return;
      }

      const socket = new SockJS(`http://localhost:4052/chat-ws?token=${token}`);
      stompClient.current = Stomp.over(() => socket);
      stompClient.current.debug = () => {};

      stompClient.current.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log("WebSocket connected");
          setConnected(true);

          // Subscribe to private messages:
          const privateSub = stompClient.current.subscribe(
            `/topic/private/${userId}`,
            (msg) => {
              const message = JSON.parse(msg.body);
              store.dispatch(addMessage({ message, currentUserId: userId }));
              console.log("Private message received:", message);
            }
          );
          subscriptions.current.set(`private-${userId}`, privateSub);

          const callSub = stompClient.current.subscribe(
            `/topic/call/${userId}`,
            (msg) => {
              const data = JSON.parse(msg.body); // <- this is flat
              console.log("[WebSocket] Received call signal:", data);

              const handler = getSignalHandler();
              if (handler) {
                handler({
                  senderId: data.callerId, // <- required by WebRTCContext
                  signal: {
                    type: data.type,
                    sdp: data.sdp || null,
                    candidate: data.candidate || null,
                    sdpMid: data.sdpMid || null,
                    sdpMLineIndex: data.sdpMLineIndex || null,
                    callType: data.callType || null,
                  },
                });
              } else {
                console.warn("[WebSocket] No signal handler found");
              }
            }
          );

          subscriptions.current.set(`call-${userId}`, callSub);

          resolve();
        },
        (error) => {
          console.error("WebSocket connection error:", error);
          setConnected(false);
          reject(error);
        }
      );
    });
  };

  const disconnectWebSocket = () => {
    if (stompClient.current) {
      subscriptions.current.forEach((sub) => sub.unsubscribe());
      subscriptions.current.clear();

      stompClient.current.disconnect(() => {
        console.log("WebSocket disconnected");
        setConnected(false);
      });
    }
  };

  const sendMessageWS = (destination, message) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(destination, {}, JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  const subscribeToGroup = (groupId) => {
    if (!stompClient.current || !stompClient.current.connected) {
      console.warn("WebSocket not connected: cannot subscribe to group.");
      return;
    }

    const groupSub = stompClient.current.subscribe(
      `/topic/group/${groupId}`,
      (msg) => {
        const message = JSON.parse(msg.body);
        store.dispatch(addGroupMessage(message));
        console.log("Group message received:", message);
      }
    );

    subscriptions.current.set(`group-${groupId}`, groupSub);
  };

  // Clean up
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        connectWebSocket,
        disconnectWebSocket,
        sendMessageWS,
        subscribeToGroup,
        connected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
