import React from "react";
import { useWebRTC } from "../../context/WebRTCContext";
import IncomingCallPopup from "./IncomingCallPopup";

export default function GlobalCallListener() {
  const { incoming, calling, callFrom } = useWebRTC();

  return (
    <>
      {incoming && !calling && (
        <IncomingCallPopup callerName={callFrom} callType="video" />
      )}
    </>
  );
}
