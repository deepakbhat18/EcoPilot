import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("ecopilot_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("ecopilot_refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token: new_refresh } = response.data;
          
          localStorage.setItem("ecopilot_access_token", access_token);
          if (new_refresh) {
            localStorage.setItem("ecopilot_refresh_token", new_refresh);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("ecopilot_access_token");
        localStorage.removeItem("ecopilot_refresh_token");
        window.dispatchEvent(new CustomEvent("auth-logout"));
        return Promise.reject(refreshError);
      }
    }

    const errorData = (error.response?.data as any)?.error;
    const message = errorData?.message || error.message || "A system network error occurred.";
    const code = errorData?.code || "NETWORK_ERROR";

    window.dispatchEvent(new CustomEvent("api-error", { 
      detail: { message, code, status: error.response?.status } 
    }));

    return Promise.reject(error);
  }
);

export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  REFRESH: "/auth/refresh",
  ME: "/users/me",
  HEALTH: "/health",
};
