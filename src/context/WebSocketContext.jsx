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
      connectWebSocket(userId);
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
