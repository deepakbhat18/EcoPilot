import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const ProtectedRouteLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <LoadingSpinner 
        fullPage 
        size="lg" 
        message="Authenticating EcoPilot session..." 
      />
    );
  }

  if (!isAuthenticated) {
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
