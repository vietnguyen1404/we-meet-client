import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth';
import { env } from '@/config';
import { getMeetingSocket, destroyMeetingSocket } from '../services/socket';
import { SOCKET_STATUS } from '../types/meeting.types';
import type { SocketConnectionStatus, UseMeetingSocketReturn } from '../types/meeting.types';

export const useMeetingSocket = (meetingId: string | undefined): UseMeetingSocketReturn => {
  const { accessToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>(
    SOCKET_STATUS.IDLE,
  );
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  /**
   * Promote the watcher to an active video-call participant.
   * Emits join-room and lets the server broadcast participant-joined to the room.
   * Safe to call multiple times — the server is idempotent.
   */
  const joinRoom = useCallback(() => {
    if (socketRef.current?.connected && meetingId) {
      socketRef.current.emit('join-room', { meetingId });
    }
  }, [meetingId]);

  useEffect(() => {
    if (!meetingId) return;

    if (!accessToken) {
      console.warn('[useMeetingSocket] accessToken is null — skipping connection');
      return;
    }

    if (!env.socketUrl) {
      console.warn('[useMeetingSocket] VITE_WS_URL is not set — skipping connection');
      return;
    }

    const sock = getMeetingSocket(env.socketUrl, accessToken);
    socketRef.current = sock;

    const handleConnect = () => {
      setConnectionStatus(SOCKET_STATUS.CONNECTED);
      setError(null);
      setSocket(sock);
    };

    const handleConnectError = (err: Error) => {
      setConnectionStatus(SOCKET_STATUS.ERROR);
      setError(err.message);
    };

    const handleDisconnect = () => {
      setConnectionStatus(SOCKET_STATUS.DISCONNECTED);
    };

    sock.on('connect', handleConnect);
    sock.on('connect_error', handleConnectError);
    sock.on('disconnect', handleDisconnect);

    if (!sock.connected) {
      sock.connect();
    }

    return () => {
      sock.off('connect', handleConnect);
      sock.off('connect_error', handleConnectError);
      sock.off('disconnect', handleDisconnect);
      destroyMeetingSocket();
      socketRef.current = null;
      setSocket(null);
      setConnectionStatus(SOCKET_STATUS.IDLE);
      setError(null);
    };
  }, [meetingId, accessToken]);

  return {
    isConnected: connectionStatus === SOCKET_STATUS.CONNECTED,
    connectionStatus,
    error,
    socket,
    joinRoom,
  };
};
