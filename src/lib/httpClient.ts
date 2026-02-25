import axios from 'axios';
import { env } from '@/config/env';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store for auth functions (set by AuthProvider when available)
let getAccessToken: (() => string | null) | null = null;
let getRefreshToken: (() => Promise<string>) | null = null;
let handleLogout: (() => void) | null = null;

export const setAuthFunctions = (
  accessTokenGetter: () => string | null,
  refreshTokenGetter: () => Promise<string>,
  logoutHandler: () => void,
) => {
  getAccessToken = accessTokenGetter;
  getRefreshToken = refreshTokenGetter;
  handleLogout = logoutHandler;
};

// Request interceptor - Add access token to all requests
httpClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken?.();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Handle 401 errors and retry with refreshed token
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (getRefreshToken) {
          const newAccessToken = await getRefreshToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        handleLogout?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
