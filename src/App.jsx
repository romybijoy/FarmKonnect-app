import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { SignalProvider } from "./context/SignalContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { WebRTCProvider } from "./context/WebRTCContext";
import GlobalCallListener from "./components/call/GlobalCallListener";

function App() {
  return (
    <SignalProvider>
      <WebSocketProvider>
        <BrowserRouter future={{ v7_startTransition: true }}>
          <WebRTCProvider>
            <Suspense
              fallback={<div className="pt-3 text-center">Loading...</div>}
            >
              <AppRoutes />
              <GlobalCallListener />
            </Suspense>
          </WebRTCProvider>
        </BrowserRouter>
      </WebSocketProvider>
    </SignalProvider>
  );
}

export default App;
