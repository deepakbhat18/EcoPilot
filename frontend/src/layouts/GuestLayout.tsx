import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const GuestLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner 
        fullPage 
        size="lg" 
        message="Loading security interface..." 
      />
    );
  }

  if (isAuthenticated) {
    
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
