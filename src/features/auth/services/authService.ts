import axios from 'axios';
import { env } from '@/config/env';
import type { LoginRequest, LoginResponse, RefreshResponse, User } from '../types/auth.types';

// Separate axios instance for auth (no interceptors to avoid circular dependency)
const authClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send cookies with requests
});

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await authClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  refresh: async (): Promise<RefreshResponse> => {
    const response = await authClient.post<RefreshResponse>('/auth/refresh');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await authClient.post('/auth/logout');
  },

  getMe: async (accessToken: string): Promise<User> => {
    const response = await authClient.get<User>('/users/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  },
};
