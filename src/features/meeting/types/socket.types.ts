export const SOCKET_REASONS_ERROR = {
  IO_SERVER_DISCONNECT: 'io server disconnect',
  IO_CLIENT_DISCONNECT: 'io client disconnect',
  PING_TIMEOUT: 'ping timeout',
  TRANSPORT_CLOSE: 'transport close',
  TRANSPORT_ERROR: 'transport error',
} as const;
