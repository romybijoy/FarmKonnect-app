import React from "react";
import { Feed, AppSidebar, Suggestions } from "../components/index";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContent from "../components/AppContent";

const DefaultLayout = () => {
  return (
   
      <div className="d-flex vh-100">
        <div className="w-20">
          <AppSidebar />
        </div>
        <div className="body flex-grow-1">
          <ToastContainer />
          <AppContent />
        </div>
      </div>
  );
};

export default DefaultLayout;
