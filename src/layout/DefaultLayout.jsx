import React from "react";
import { Outlet } from "react-router-dom";
import { Feed, AppSidebar, Suggestions } from "../components/index";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingChatDock from "../components/chat/FloatingChatDock";

const DefaultLayout = () => {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-grow md:ml-64 w-full">
        <ToastContainer />
        <Outlet />
        {/* floating messages dock*/}
        <FloatingChatDock />
      </div>
    </div>
  );
};

export default DefaultLayout;
