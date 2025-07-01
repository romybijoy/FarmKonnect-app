import React, { Suspense } from "react";
import {
  BrowserRouter
} from "react-router-dom";
import AppRoutes from "./AppRoutes";

import { WebSocketProvider } from "./context/WebSocketContext";
import { WebRTCProvider } from "./context/WebRTCContext";

function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter future={{ v7_startTransition: true }}>
        <WebRTCProvider>
          <Suspense fallback={<div className="pt-3 text-center">Loading...</div>}>
            <AppRoutes />
          </Suspense>
        </WebRTCProvider>
      </BrowserRouter>
    </WebSocketProvider>
  );
}

export default App;
