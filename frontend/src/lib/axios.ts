import axios from "axios";
import { parseCookies } from "nookies";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
})

let currentInterceptorId: number | null = null;

export const removeAuthInterceptor = () => {
  if (currentInterceptorId !== null) {
    api.interceptors.request.eject(currentInterceptorId);
    currentInterceptorId = null;
  }
};

export const setAuthInterceptor = (userId: string | number) => {
  removeAuthInterceptor();
  
  currentInterceptorId = api.interceptors.request.use((config) => {
    const cookieName = `avenant_token_${userId}`;
    const cookies = parseCookies();
    const token = cookies[cookieName];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  });
};