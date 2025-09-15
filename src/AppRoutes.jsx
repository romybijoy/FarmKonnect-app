import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import DefaultLayout from "./layout/DefaultLayout";
import Protected from "./components/Protected/Protected";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import CallPage from "./components/call/CallPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/verifyotp" element={<VerifyOtp />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/set-Password" element={<ResetPassword />} />

      {/* Call screen route */}
      <Route path="/call" element={<CallPage />} />

      {/* Protected area */}
      <Route
        path="*"
        element={
          <Protected>
            <DefaultLayout />
          </Protected>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
