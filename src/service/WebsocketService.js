// websocketService.js
import SockJS from "sockjs-client/dist/sockjs";
import { Stomp } from "@stomp/stompjs";
import { addMessage, addGroupMessage } from "../../redux/slices/ChatSlice";
import store from "../../redux/store";

let stompClient = null;
let connectPromise = null;

export const connectWebSocket = (userId, chatHandler, callHandler) => {
  if (stompClient && stompClient.connected) {
    console.log("Already connected");
    return Promise.resolve();
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = new Promise((resolve, reject) => {
    const token = localStorage.getItem("token");
    stompClient = Stomp.over(() => new SockJS("http://localhost:4052/chat-ws"));
    stompClient.debug = () => {};

    stompClient.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log("Connected");

        if (chatHandler) {
          stompClient.subscribe(`/topic/private/${userId}`, (message) => {
            chatHandler(JSON.parse(message.body));
            store.dispatch(addMessage(message));
          });

          if (callHandler) {
            stompClient.subscribe(`/user/${userId}/topic/signal`, (msg) => {
              callHandler(JSON.parse(msg.body));
            });
          }
        }

        resolve();
      },
      (error) => {
        console.error("WebSocket connection error:", error);
        reject(error);
      }
    );
  });

  return connectPromise;
};



export const subscribeToGroup = (groupId) => {
  if (stompClient && stompClient.connected) {
    stompClient.subscribe(`/topic/group/${groupId}`, (msg) => {
      const message = JSON.parse(msg.body);
      store.dispatch(addGroupMessage(message));
    });
  }
};

export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log("WebSocket disconnected");
    });
  }
};

export const sendMessageWS = (destination, message) => {
  if (stompClient && stompClient.connected) {
    stompClient.send(destination, {}, JSON.stringify(message));
  } else {
    console.warn("WebSocket is not connected.");
  }
};
