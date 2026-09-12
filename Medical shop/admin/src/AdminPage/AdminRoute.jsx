/* eslint-disable no-unused-vars */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAdminToken } from "../utils/auth";

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const adminToken = getAdminToken();

  if (!adminToken) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
};

export default AdminRoute;