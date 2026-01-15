import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import DefaultLayout from "./layout/DefaultLayout";
import Protected from "./components/Protected/Protected";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import {
  Home,
  Profile,
  AddPost,
  ChatApp,
  AddStory,
  CallPage,
  NotificationPanel,
  AllSuggestions,
} from "./routes";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/verifyotp" element={<VerifyOtp />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/set-Password" element={<ResetPassword />} />

       {/* CALL PAGE (NO SIDEBAR) */}
      <Route path="/call/:receiverId" element={<CallPage />} />
      <Route path="/call" element={<CallPage />} />
      <Route
        element={
          <Protected>
            <DefaultLayout />
          </Protected>
        }
      >
       <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/addPost" element={<AddPost />} />
        <Route path="/chat" element={<ChatApp />} />
        <Route path="/addStory" element={<AddStory />} />
        <Route path="/notifications" element={<NotificationPanel />} />
        <Route path="/suggestions" element={<AllSuggestions />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
