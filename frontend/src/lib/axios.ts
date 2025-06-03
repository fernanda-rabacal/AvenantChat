import axios from "axios";
import { parseCookies } from "nookies";

export const api = axios.create({
  baseURL: process?.env?.VITE_API_URL || "http://localhost:8080",
})

export const setAuthInterceptor = (userId: string | number) => {
  api.interceptors.request.use((config) => {
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