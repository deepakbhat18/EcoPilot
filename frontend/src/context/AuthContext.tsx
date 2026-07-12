import React, { createContext, useContext, useEffect, useState } from "react";
import { api, API_ENDPOINTS } from "../services/api";

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: number;
  role_id: number;
  profile_image?: string;
  status: string;
  is_active: boolean;
  role?: Role;
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

  const logout = () => {
    localStorage.removeItem("ecopilot_access_token");
    localStorage.removeItem("ecopilot_refresh_token");
    setUser(null);
    setIsAuthenticated(false);
  };

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
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          logout();
        }
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

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role) return false;
    const perms = user.role.permissions || [];
    if (perms.includes("read:all") && permission.startsWith("read:")) return true;
    if (perms.includes("write:all") && permission.startsWith("write:")) return true;
    return perms.includes(permission);
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user || !user.role) return false;
    const userRoleName = user.role.name.toLowerCase();
    return roles.map(r => r.toLowerCase()).includes(userRoleName);
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
