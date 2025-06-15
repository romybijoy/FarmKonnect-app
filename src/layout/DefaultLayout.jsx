import React from "react";
import { Feed, AppSidebar, Suggestions } from "../components/index";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContent from "../components/AppContent";

const DefaultLayout = () => {
  return (
    <div className="flex min-h-screen">
      
        <AppSidebar />
      <div className="flex-growflex-grow md:ml-64 w-full">
        <ToastContainer />
        <AppContent />
      </div>
    </div>
  );
};

export default DefaultLayout;
