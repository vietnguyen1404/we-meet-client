export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  socketUrl: import.meta.env.VITE_WS_URL,
  stunUrl: import.meta.env.VITE_STUN_URL,
} as const;
