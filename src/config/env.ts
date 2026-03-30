export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  socketUrl: import.meta.env.VITE_WS_URL,
  stunUrl: import.meta.env.VITE_STUN_URL,
  googleOAuthUrl: import.meta.env.VITE_GOOGLE_OAUTH_URL as string | undefined,
} as const;
