import React, { Suspense, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "./redux/slices/NotificationSlice";
import AppRoutes from "./AppRoutes";
import { SignalProvider } from "./context/SignalContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { WebRTCProvider } from "./context/WebRTCContext";
import GlobalCallListener from "./components/call/GlobalCallListener";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.app.currentUser);

  console.log(user);
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications({ id: user.id }));
    }
  }, [dispatch, user]);

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
