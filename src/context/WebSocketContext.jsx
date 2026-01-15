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
import {
  upsertConversationFromMessage,
  getGroupById,
  upsertMessage,
  setCurrentUserId,
} from "../redux/slices/ChatSlice";
import { useSignal } from "./SignalContext";
import { setTypingStatus } from "../redux/slices/TypingSlice";

// Create Context
const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const stompClient = useRef(null);
  const subscriptions = useRef(new Map());
  const [connected, setConnected] = useState(false);
  const pendingQueue = useRef([]);
  const dispatch = store.dispatch;
  const userData = JSON.parse(localStorage.getItem("myInfo"));
  const userId = userData?.id;
  const currentUserId = userId;

  useEffect(() => {
    if (userData?.id) {
      dispatch(setCurrentUserId(userData.id));
    }
  }, [userData?.id]);

  // we can still read users via selector if other parts use it, but we won't
  // depend on it for reconnects

  const { setSignalSender, handleSignalSender } = useSignal();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Before login: no token → skip WebSocket connection
    if (!userId || !token) {
      console.log("[WebSocket] Skipping connect: no user or token");
      return;
    }

    connectWebSocket(userId)
      .then(() => {
        // Set the signal sender only after WebSocket is connected
        console.log("[WebSocket] Connected — setting signal sender for calls");
        setSignalSender((receiverId, signal) => {
          sendMessageWS("/app/call/signal", {
            ...signal,
            callerId: userId,
            receiverId,
            targetId: receiverId, // for ICE
          });
        });
      })
      .catch((err) => {
        console.error("[WebSocket] Connection failed:", err);
      });

    // cleanup only on unmount handled by separate effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const connectWebSocket = (userId) => {
    return new Promise((resolve, reject) => {
      if (stompClient.current && stompClient.current.connected) {
        console.log("[WebSocket] Already connected");
        resolve();
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        reject("Missing token");
        return;
      }

      const socket = new SockJS(import.meta.env.VITE_CHAT_WS);
      stompClient.current = Stomp.over(() => socket);
      stompClient.current.debug = () => {};

      stompClient.current.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log("[WebSocket] connected");
          setConnected(true);

          // PERSONAL QUEUE (messages sent to this user — delete/edit/update)
          const personalMsgSub = stompClient.current.subscribe(
            "/user/queue/messages",
            (msg) => {
              const message = JSON.parse(msg.body);
              console.log("[WebSocket] Personal queue update:", message);

              // UPSERT so UI updates immediately
              store.dispatch(upsertMessage(message));
            }
          );

          subscriptions.current.set(`user-messages-${userId}`, personalMsgSub);

          // DELETE (delete-for-me & delete-for-everyone personal updates)
          const deleteSub = stompClient.current.subscribe(
            "/user/queue/delete",
            (msg) => {
              const message = JSON.parse(msg.body);
              console.log("[WebSocket] Delete update received:", message);

              // 🔥 UPSERT so UI updates immediately
              store.dispatch(upsertMessage(message));
            }
          );

          subscriptions.current.set(`delete-${userId}`, deleteSub);

          // CALL SIGNALS
          const callSub = stompClient.current.subscribe(
            `/topic/call/${userId}`,
            (msg) => {
              const data = JSON.parse(msg.body);
              console.log("[WebSocket] Received call signal:", data);

              // Ignore our own signals (echo)
              if (data.callerId === userId) {
                console.log("[WebSocket] Ignoring self call signal");
                return;
              }

              if (handleSignalSender) {
                handleSignalSender({
                  senderId: data.callerId,
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

          // NOTIFICATIONS
          const notificationSub = stompClient.current.subscribe(
            `/user/queue/notifications`,
            (msg) => {
              const notification = JSON.parse(msg.body);
              console.log("[WebSocket] Notification received:", notification);

              store.dispatch({
                type: "notification/addNotification",
                payload: notification,
              });
            }
          );
          subscriptions.current.set(`notification-${userId}`, notificationSub);

          // TYPING (private)
          const typingPrivateSub = stompClient.current.subscribe(
            `/user/queue/typing`,
            (msg) => {
              const typingPayload = JSON.parse(msg.body);
              store.dispatch(setTypingStatus(typingPayload));
            }
          );
          subscriptions.current.set(
            `typing-private-${userId}`,
            typingPrivateSub
          );

          console.log(
            "[WebSocket] Flushing pending queue:",
            pendingQueue.current.length
          );

          pendingQueue.current.forEach(({ destination, message }) => {
            stompClient.current.send(destination, {}, JSON.stringify(message));
          });

          pendingQueue.current = [];

          resolve();
        },
        (error) => {
          console.error("[WebSocket] connection error:", error);
          setConnected(false);
          reject(error);
        }
      );
    });
  };

  const disconnectWebSocket = () => {
    if (stompClient.current) {
      subscriptions.current.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch (e) {
          // ignore
        }
      });
      subscriptions.current.clear();

      try {
        stompClient.current.disconnect(() => {
          console.log("[WebSocket] disconnected");
          setConnected(false);
        });
      } catch (e) {
        console.warn("[WebSocket] disconnect error", e);
        setConnected(false);
      }
    }
  };

  const sendMessageWS = (destination, message) => {
    console.log("[WS SEND]", destination, message);
    if (!stompClient.current) {
      console.warn("[WebSocket] client not ready, queuing message");
      pendingQueue.current.push({ destination, message });
      return;
    }

    if (!stompClient.current.connected) {
      console.warn("[WebSocket] not connected, queuing message");
      pendingQueue.current.push({ destination, message });
      return;
    }

    stompClient.current.send(destination, {}, JSON.stringify(message));
  };

  const sendTypingStatus = ({ email, isTyping, receiverId, groupId }) => {
    const payload = { email, isTyping };
    if (receiverId) payload.receiverId = receiverId;
    else if (groupId) payload.groupId = groupId;

    sendMessageWS("/app/typing", payload);
  };

  const subscribeToGroup = (groupId) => {
    if (!stompClient.current || !stompClient.current.connected) {
      console.warn("[WebSocket] not connected: cannot subscribe to group.");
      return;
    }

    const groupSub = stompClient.current.subscribe(
      `/topic/group/${groupId}`,
      async (msg) => {
        try {
          const message = JSON.parse(msg.body);
          console.log("[WebSocket] Group message received:", message);

          store.dispatch(upsertMessage(message));

          // ✅ 2) Ensure group metadata exists
          const stateNow = store.getState();
          const groupsById = stateNow.groups?.byId || {};
          let groupMeta = groupsById[groupId];

          if (!groupMeta) {
            try {
              groupMeta = await store.dispatch(getGroupById(groupId)).unwrap();
            } catch {
              groupMeta = {
                id: groupId,
                name: "Group Chat",
                avatar: "group.png",
                memberIds: [],
              };
            }
          }

          // ✅ 3) Ensure sender profile exists
          const profiles = store.getState().app?.profiles || {};
          if (message.senderId && !profiles[message.senderId]) {
            try {
              await store.dispatch(fetchUserById(message.senderId)).unwrap();
            } catch (err) {
              console.warn("[WS] failed to fetch sender profile:", err);
            }
          }

          // ✅ 4) Update conversation preview (sidebar)
          const updatedProfiles = store.getState().app?.profiles || {};
          const usersMap = Object.values(updatedProfiles).reduce((m, u) => {
            m[String(u.id)] = u;
            return m;
          }, {});

          store.dispatch(
            upsertConversationFromMessage({
              message,
              currentUserId: userId,
              usersMap,
              groupMeta,
            })
          );
        } catch (err) {
          console.error("[WebSocket] group handler error:", err);
        }
      }
    );

    subscriptions.current.set(`group-${groupId}`, groupSub);

    // Group typing subscription
    const typingGroupSub = stompClient.current.subscribe(
      `/topic/typing/group/${groupId}`,
      (msg) => {
        const typingPayload = JSON.parse(msg.body);
        store.dispatch(setTypingStatus(typingPayload));
        console.log("[WebSocket] Group typing received:", typingPayload);
      }
    );
    subscriptions.current.set(`typing-group-${groupId}`, typingGroupSub);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
    // intentionally only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        connectWebSocket,
        disconnectWebSocket,
        sendMessageWS,
        sendTypingStatus,
        subscribeToGroup,
        connected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
