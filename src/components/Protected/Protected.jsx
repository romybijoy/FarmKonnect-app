import React from "react";
import { Navigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import { useSelector } from "react-redux";

const Protected = ({ children }) => {
  const { user, dbUser } = UserAuth();
  if (!user && !dbUser) {
    return <Navigate to="/home" />;
  }

  return children;
};

export default Protected;
