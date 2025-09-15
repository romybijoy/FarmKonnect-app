import { createContext, useContext, useRef } from "react";

const SignalContext = createContext();

export const SignalProvider = ({ children }) => {
  const signalHandlerRef = useRef(null);
  const signalSenderRef = useRef(null);

  const setSignalHandler = (handler) => {
    signalHandlerRef.current = handler;
  };

  const setSignalSender = (sender) => {
    console.log("✅ Signal sender registered");

    signalSenderRef.current = sender;
  };

  const sendSignalSender = (receiverId, signal) => {
    if (!signalSenderRef.current) {
      console.warn("⚠️ Signal sender not ready");
      return;
    }
    signalSenderRef.current(receiverId, signal);
  };

  const handleSignalSender = ({senderId, signal} ) => {
    console.log("📩 Incoming signal:", signal, "from", senderId);
    if (!signalHandlerRef.current) {
      console.warn("⚠️ Signal handler not set");
      return;
    }
    signalHandlerRef.current({signal, senderId });
  };

  return (
    <SignalContext.Provider
      value={{
        setSignalHandler,
        setSignalSender,
        sendSignalSender,
        handleSignalSender,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => useContext(SignalContext);
