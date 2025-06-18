// import React, { createContext, useContext, useEffect, useState } from "react";
// import SockJS from "sockjs-client/dist/sockjs";
// import { Stomp } from "@stomp/stompjs";
// import { useDispatch, useSelector } from "react-redux";
// import { addMessage, addGroupMessage } from "../redux/slices/ChatSlice";

// const WebSocketContext = createContext();

// export const WebSocketProvider = ({ children }) => {
//   const [stompClient, setStompClient] = useState(null);
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.auth);  // assuming you store user in Redux

//   useEffect(() => {
//     if (!user) {
//       console.warn("No user, skipping WebSocket connection");
//       return;
//     }

//     const token = localStorage.getItem("token");
//     const socket = new SockJS("http://localhost:4052/chat-ws");
//     const client = Stomp.over(socket);
//     client.debug = () => {};

//     client.connect(
//       { Authorization: `Bearer ${token}` },
//       () => {
//         console.log("WebSocket connected");
//         setStompClient(client);

//         // Subscribe for private messages
//         client.subscribe(`/topic/private/${user.id}`, (message) => {
//           const payload = JSON.parse(message.body);
//           dispatch(addMessage(payload));
//         });

//         // Subscribe for call signaling
//         client.subscribe(`/user/${user.id}/topic/signal`, (msg) => {
//           const payload = JSON.parse(msg.body);
//           console.log("Signal received:", payload);
//           // you can dispatch here too if needed
//         });

//       },
//       (error) => {
//         console.error("WebSocket connection error:", error);
//       }
//     );

//     return () => {
//       if (client && client.connected) {
//         client.disconnect(() => {
//           console.log("WebSocket disconnected");
//         });
//       }
//     };
//   }, [user]);

//   // Group subscription
//   const subscribeToGroup = (groupId) => {
//     if (stompClient && stompClient.connected) {
//       stompClient.subscribe(`/topic/group/${groupId}`, (msg) => {
//         const message = JSON.parse(msg.body);
//         dispatch(addGroupMessage(message));
//       });
//     }
//   };

//   const sendMessageWS = (destination, message) => {
//     if (stompClient && stompClient.connected) {
//       stompClient.send(destination, {}, JSON.stringify(message));
//     } else {
//       console.warn("WebSocket is not connected.");
//     }
//   };

//    // ✅ THIS IS THE NEW FUNCTION YOU WERE MISSING:
//   const subscribeToSignal = (userId, handler) => {
//     if (stompClient.current && stompClient.current.connected) {
//       const subscription = stompClient.current.subscribe(
//         `/user/${userId}/topic/signal`,
//         (msg) => {
//           const message = JSON.parse(msg.body);
//           handler(message);
//         }
//       );

//       // return unsubscribe function:
//       return () => subscription.unsubscribe();
//     }
//   };

//   return (
//     <WebSocketContext.Provider value={{ stompClient, sendMessageWS, subscribeToGroup,subscribeToSignal, }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// // Custom hook
// export const useWebSocket = () => useContext(WebSocketContext);


// import React, { createContext, useContext, useEffect, useState, useRef } from "react";
// import SockJS from "sockjs-client/dist/sockjs";
// import { Stomp } from "@stomp/stompjs";
// import store from "../redux/store";
// import { addMessage, addGroupMessage } from "../redux/slices/ChatSlice";

// const WebSocketContext = createContext();

// export const WebSocketProvider = ({ children }) => {
//   const stompClient = useRef(null);
//   const [connected, setConnected] = useState(false);

//   const connectWebSocket = (userId) => {
//     if (stompClient.current && stompClient.current.connected) {
//       console.log("Already connected");
//       return Promise.resolve();
//     }

//     return new Promise((resolve, reject) => {
//       const token = localStorage.getItem("token");
//       stompClient.current = Stomp.over(() => new SockJS("http://localhost:4052/chat-ws"));
//       stompClient.current.debug = () => {}; // disable console logs

//       stompClient.current.connect(
//         { Authorization: `Bearer ${token}` },
//         () => {
//           console.log("WebSocket connected");
//           setConnected(true);

//           // Subscribe to private chat messages
//           stompClient.current.subscribe(`/topic/private/${userId}`, (msg) => {
//             const message = JSON.parse(msg.body);
//             store.dispatch(addMessage(message));
//           });

//           resolve();
//         },
//         (error) => {
//           console.error("WebSocket connection error:", error);
//           reject(error);
//         }
//       );
//     });
//   };

//   const disconnectWebSocket = () => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.disconnect(() => {
//         console.log("WebSocket disconnected");
//         setConnected(false);
//       });
//     }
//   };

//   const sendMessageWS = (destination, message) => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.send(destination, {}, JSON.stringify(message));
//     } else {
//       console.warn("WebSocket is not connected.");
//     }
//   };

//   // ✅ Add group chat subscription
//   const subscribeToGroup = (groupId) => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.subscribe(`/topic/group/${groupId}`, (msg) => {
//         const message = JSON.parse(msg.body);
//         store.dispatch(addGroupMessage(message));
//       });
//     }
//   };

//   const subscribeToSignal = (userId, handler) => {
//   if (!stompClient.current || !stompClient.current.connected) {
//     console.warn("WebSocket not connected: can't subscribe to signal.");
//     return () => {};  // return empty unsubscribe function
//   }

//   const subscription = stompClient.current.subscribe(
//     `/user/${userId}/topic/signal`,
//     (msg) => {
//       const message = JSON.parse(msg.body);
//       handler(message);
//     }
//   );

//   return () => subscription.unsubscribe();
// };


//   return (
//     <WebSocketContext.Provider
//       value={{
//         connectWebSocket,
//         disconnectWebSocket,
//         sendMessageWS,
//         subscribeToGroup,
//         subscribeToSignal, // 👈 now exposed
//         connected,
//       }}
//     >
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocket = () => useContext(WebSocketContext);


// import React, { createContext, useContext, useState, useRef, useEffect } from "react";
// import SockJS from "sockjs-client/dist/sockjs";
// import { Stomp } from "@stomp/stompjs";
// import store from "../redux/store";
// import { addMessage, addGroupMessage } from "../redux/slices/ChatSlice";

// // 1️⃣ Create Context
// const WebSocketContext = createContext();

// // 2️⃣ Provider Component
// export const WebSocketProvider = ({ children }) => {
//   const stompClient = useRef(null);
//   const subscriptions = useRef(new Map()); // To manage dynamic subscriptions
//   const [connected, setConnected] = useState(false);

//   // 3️⃣ Connect WebSocket
//   const connectWebSocket = (userId) => {
//     return new Promise((resolve, reject) => {
//       if (stompClient.current && stompClient.current.connected) {
//         console.log("Already connected");
//         resolve();
//         return;
//       }

//       const token = localStorage.getItem("token");
//       const socket = new SockJS("http://localhost:4052/chat-ws");
//       stompClient.current = Stomp.over(() => socket);
//       stompClient.current.debug = () => {}; // disable logs

//       stompClient.current.connect(
//         { Authorization: `Bearer ${token}` },
//         () => {
//           console.log("WebSocket connected");
//           setConnected(true);

//           // Default subscription for private messages
//           const privateSub = stompClient.current.subscribe(
//             `/topic/private/${userId}`,
//             (msg) => {
//               const message = JSON.parse(msg.body);
//               store.dispatch(addMessage(message));

//               console.log("Received signal (auto-subscribe):", message);
//             }
//           );
//           subscriptions.current.set(`private-${userId}`, privateSub);

//           resolve();
//         },
//         (error) => {
//           console.error("WebSocket connection error:", error);
//           setConnected(false);
//           reject(error);
//         }
//       );
//     });
//   };

//   // 4️⃣ Disconnect WebSocket
//   const disconnectWebSocket = () => {
//     if (stompClient.current) {
//       subscriptions.current.forEach((sub) => sub.unsubscribe());
//       subscriptions.current.clear();

//       stompClient.current.disconnect(() => {
//         console.log("WebSocket disconnected");
//         setConnected(false);
//       });
//     }
//   };

//   // 5️⃣ Send message
//   const sendMessageWS = (destination, message) => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.send(destination, {}, JSON.stringify(message));
//     } else {
//       console.warn("WebSocket is not connected.");
//     }
//   };

//   // 6️⃣ Subscribe to group
//   const subscribeToGroup = (groupId) => {
//     if (!stompClient.current || !stompClient.current.connected) {
//       console.warn("WebSocket not connected: cannot subscribe to group.");
//       return;
//     }

//     const groupSub = stompClient.current.subscribe(
//       `/topic/group/${groupId}`,
//       (msg) => {
//         const message = JSON.parse(msg.body);
//         store.dispatch(addGroupMessage(message));
//       }
//     );

//     subscriptions.current.set(`group-${groupId}`, groupSub);
//   };

//  const subscribeToSignal = (userId, handler) => {
//   if (stompClient.current && stompClient.current.connected) {
//     stompClient.current.subscribe(`/user/${userId}/topic/signal`, (msg) => {
//       const message = JSON.parse(msg.body);
//       console.log("Received signal on WS:", message);
//       handler(message);
//     });
//   }
// };


//   const sendSignal = (message) => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.send("/app/signal", {}, JSON.stringify(message));
//     }
//   };

//   // 8️⃣ Cleanup on unmount (optional but safe)
//   useEffect(() => {
//     return () => {
//       disconnectWebSocket();
//     };
//   }, []);

//   return (
//     <WebSocketContext.Provider
//       value={{
//         connectWebSocket,
//         disconnectWebSocket,
//         sendMessageWS,
//         subscribeToGroup,
//         subscribeToSignal,
//         sendSignal,
//         connected,
//       }}
//     >
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// // 9️⃣ Export hook for usage
// export const useWebSocket = () => useContext(WebSocketContext);


// import React, { createContext, useContext, useEffect, useState } from "react";
// import SockJS from "sockjs-client/dist/sockjs";
// import { Stomp } from "@stomp/stompjs";
// import { useDispatch, useSelector } from "react-redux";
// import { addMessage, addGroupMessage } from "../redux/slices/ChatSlice";

// const WebSocketContext = createContext();

// export const WebSocketProvider = ({ children }) => {
//   const [stompClient, setStompClient] = useState(null);
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.auth);  // assuming you store user in Redux

//   useEffect(() => {
//     if (!user) {
//       console.warn("No user, skipping WebSocket connection");
//       return;
//     }

//     const token = localStorage.getItem("token");
//     const socket = new SockJS("http://localhost:4052/chat-ws");
//     const client = Stomp.over(socket);
//     client.debug = () => {};

//     client.connect(
//       { Authorization: `Bearer ${token}` },
//       () => {
//         console.log("WebSocket connected");
//         setStompClient(client);

//         // Subscribe for private messages
//         client.subscribe(`/topic/private/${user.id}`, (message) => {
//           const payload = JSON.parse(message.body);
//           dispatch(addMessage(payload));
//         });

//         // Subscribe for call signaling
//         client.subscribe(`/user/${user.id}/topic/signal`, (msg) => {
//           const payload = JSON.parse(msg.body);
//           console.log("Signal received:", payload);
//           // you can dispatch here too if needed
//         });

//       },
//       (error) => {
//         console.error("WebSocket connection error:", error);
//       }
//     );

//     return () => {
//       if (client && client.connected) {
//         client.disconnect(() => {
//           console.log("WebSocket disconnected");
//         });
//       }
//     };
//   }, [user]);

//   // Group subscription
//   const subscribeToGroup = (groupId) => {
//     if (stompClient && stompClient.connected) {
//       stompClient.subscribe(`/topic/group/${groupId}`, (msg) => {
//         const message = JSON.parse(msg.body);
//         dispatch(addGroupMessage(message));
//       });
//     }
//   };

//   const sendMessageWS = (destination, message) => {
//     if (stompClient && stompClient.connected) {
//       stompClient.send(destination, {}, JSON.stringify(message));
//     } else {
//       console.warn("WebSocket is not connected.");
//     }
//   };

//    // ✅ THIS IS THE NEW FUNCTION YOU WERE MISSING:
//   const subscribeToSignal = (userId, handler) => {
//     if (stompClient.current && stompClient.current.connected) {
//       const subscription = stompClient.current.subscribe(
//         `/user/${userId}/topic/signal`,
//         (msg) => {
//           const message = JSON.parse(msg.body);
//           handler(message);
//         }
//       );

//       // return unsubscribe function:
//       return () => subscription.unsubscribe();
//     }
//   };

//   return (
//     <WebSocketContext.Provider value={{ stompClient, sendMessageWS, subscribeToGroup,subscribeToSignal, }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// // Custom hook
// export const useWebSocket = () => useContext(WebSocketContext);


// import React, { createContext, useContext, useEffect, useState, useRef } from "react";
// import SockJS from "sockjs-client/dist/sockjs";
// import { Stomp } from "@stomp/stompjs";
// import store from "../redux/store";
// import { addMessage, addGroupMessage } from "../redux/slices/ChatSlice";

// const WebSocketContext = createContext();

// export const WebSocketProvider = ({ children }) => {
//   const stompClient = useRef(null);
//   const [connected, setConnected] = useState(false);

//   const connectWebSocket = (userId) => {
//     if (stompClient.current && stompClient.current.connected) {
//       console.log("Already connected");
//       return Promise.resolve();
//     }

//     return new Promise((resolve, reject) => {
//       const token = localStorage.getItem("token");
//       stompClient.current = Stomp.over(() => new SockJS("http://localhost:4052/chat-ws"));
//       stompClient.current.debug = () => {}; // disable console logs

//       stompClient.current.connect(
//         { Authorization: `Bearer ${token}` },
//         () => {
//           console.log("WebSocket connected");
//           setConnected(true);

//           // Subscribe to private chat messages
//           stompClient.current.subscribe(`/topic/private/${userId}`, (msg) => {
//             const message = JSON.parse(msg.body);
//             store.dispatch(addMessage(message));
//           });

//           resolve();
//         },
//         (error) => {
//           console.error("WebSocket connection error:", error);
//           reject(error);
//         }
//       );
//     });
//   };

//   const disconnectWebSocket = () => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.disconnect(() => {
//         console.log("WebSocket disconnected");
//         setConnected(false);
//       });
//     }
//   };

//   const sendMessageWS = (destination, message) => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.send(destination, {}, JSON.stringify(message));
//     } else {
//       console.warn("WebSocket is not connected.");
//     }
//   };

//   // ✅ Add group chat subscription
//   const subscribeToGroup = (groupId) => {
//     if (stompClient.current && stompClient.current.connected) {
//       stompClient.current.subscribe(`/topic/group/${groupId}`, (msg) => {
//         const message = JSON.parse(msg.body);
//         store.dispatch(addGroupMessage(message));
//       });
//     }
//   };

//   const subscribeToSignal = (userId, handler) => {
//   if (!stompClient.current || !stompClient.current.connected) {
//     console.warn("WebSocket not connected: can't subscribe to signal.");
//     return () => {};  // return empty unsubscribe function
//   }

//   const subscription = stompClient.current.subscribe(
//     `/user/${userId}/topic/signal`,
//     (msg) => {
//       const message = JSON.parse(msg.body);
//       handler(message);
//     }
//   );

//   return () => subscription.unsubscribe();
// };


//   return (
//     <WebSocketContext.Provider
//       value={{
//         connectWebSocket,
//         disconnectWebSocket,
//         sendMessageWS,
//         subscribeToGroup,
//         subscribeToSignal, // 👈 now exposed
//         connected,
//       }}
//     >
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocket = () => useContext(WebSocketContext);


import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Stomp } from "@stomp/stompjs";
import store from "../redux/store";
import { addMessage, addGroupMessage } from "../redux/slices/ChatSlice";

// 1️⃣ Create Context
const WebSocketContext = createContext();

// 2️⃣ Provider Component
export const WebSocketProvider = ({ children }) => {
  const stompClient = useRef(null);
  const subscriptions = useRef(new Map()); // To manage dynamic subscriptions
  const [connected, setConnected] = useState(false);

  // 3️⃣ Connect WebSocket
  const connectWebSocket = (userId) => {
    return new Promise((resolve, reject) => {
      if (stompClient.current && stompClient.current.connected) {
        console.log("Already connected");
        resolve();
        return;
      }

      const token = localStorage.getItem("token");
      const socket = new SockJS("http://localhost:4052/chat-ws");
      stompClient.current = Stomp.over(() => socket);
      stompClient.current.debug = () => {}; // disable logs

      stompClient.current.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log("WebSocket connected");
          setConnected(true);

          // Default subscription for private messages
          const privateSub = stompClient.current.subscribe(
            `/topic/private/${userId}`,
            (msg) => {
              const message = JSON.parse(msg.body);
              store.dispatch(addMessage(message));

              console.log("Received signal (auto-subscribe):", message);
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

  // 4️⃣ Disconnect WebSocket
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

  // 5️⃣ Send message
  const sendMessageWS = (destination, message) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send(destination, {}, JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  // 6️⃣ Subscribe to group
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
      }
    );

    subscriptions.current.set(`group-${groupId}`, groupSub);
  };

 const subscribeToSignal = (userId, handler) => {
  if (stompClient.current && stompClient.current.connected) {
    stompClient.current.subscribe(`/user/${userId}/topic/signal`, (msg) => {
      const message = JSON.parse(msg.body);
      console.log("Received signal on WS:", message);
      handler(message);
    });
  }
};


  const sendSignal = (message) => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.send("/app/signal", {}, JSON.stringify(message));
    }
  };

  // 8️⃣ Cleanup on unmount (optional but safe)
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
        subscribeToSignal,
        sendSignal,
        connected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// 9️⃣ Export hook for usage
export const useWebSocket = () => useContext(WebSocketContext);
