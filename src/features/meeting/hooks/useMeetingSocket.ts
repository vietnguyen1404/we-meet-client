import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth';
import { env } from '@/config';
import { SOCKET_STATUS } from '../types/meeting.types';
import type { SocketConnectionStatus, UseMeetingSocketReturn } from '../types/meeting.types';

export const useMeetingSocket = (meetingId: string | undefined): UseMeetingSocketReturn => {
  const { accessToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>(
    SOCKET_STATUS.IDLE,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    if (!accessToken) {
      console.warn('[useMeetingSocket] accessToken is null — skipping connection');
      return;
    }

    if (!env.socketUrl) {
      console.warn('[useMeetingSocket] VITE_WS_URL is not set — skipping connection');
      return;
    }

    const socket = io(env.socketUrl, {
      autoConnect: false,
      auth: { token: accessToken },
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnectionStatus(SOCKET_STATUS.CONNECTED);
      setError(null);
      socket.emit('join-room', { meetingId });
    };

    const handleConnectError = (err: Error) => {
      setConnectionStatus(SOCKET_STATUS.ERROR);
      setError(err.message);
    };

    const handleDisconnect = () => {
      setConnectionStatus(SOCKET_STATUS.DISCONNECTED);
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnectionStatus(SOCKET_STATUS.IDLE);
      setError(null);
    };
  }, [meetingId, accessToken]);

  return {
    isConnected: connectionStatus === SOCKET_STATUS.CONNECTED,
    connectionStatus,
    error,
  };
};
