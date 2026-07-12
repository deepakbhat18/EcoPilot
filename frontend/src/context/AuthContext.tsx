import React, { createContext, useContext, useEffect, useState } from "react";
import { api, API_ENDPOINTS } from "../services/api";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("ecopilot_access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get(API_ENDPOINTS.ME);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        
        console.error("Session sync failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();

    
    const handleLogoutEvent = () => logout();
    window.addEventListener("auth-logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("auth-logout", handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem("ecopilot_access_token", access_token);
      localStorage.setItem("ecopilot_refresh_token", refresh_token);
      
      
      const userResponse = await api.get(API_ENDPOINTS.ME);
      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("ecopilot_access_token");
    localStorage.removeItem("ecopilot_refresh_token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const rolePermissions: Record<string, string[]> = {
      admin: ["read:all", "write:all", "delete:all"],
      manager: ["read:all", "write:all"],
      analyst: ["read:all", "write:environmental", "write:social", "write:governance"],
      viewer: ["read:all"]
    };

    const perms = rolePermissions[user.role] || [];
    if (perms.includes("read:all") && permission.startsWith("read:")) return true;
    if (perms.includes("write:all") && permission.startsWith("write:")) return true;
    return perms.includes(permission);
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
