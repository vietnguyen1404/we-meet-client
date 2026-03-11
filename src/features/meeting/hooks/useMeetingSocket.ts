import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth';
import { env } from '@/config';
import { getMeetingSocket, destroyMeetingSocket } from '../services/socket';
import { SOCKET_STATUS } from '../types/meeting.types';
import type { SocketConnectionStatus, UseMeetingSocketReturn } from '../types/meeting.types';

const MAX_RECONNECT_ATTEMPTS = 5;

export const useMeetingSocket = (meetingId: string | undefined): UseMeetingSocketReturn => {
  const { accessToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<SocketConnectionStatus>(
    SOCKET_STATUS.IDLE,
  );
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  // Refs to manage reconnect lifecycle without causing re-renders
  const isUnmountedRef = useRef<boolean>(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef<number>(0);

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

    isUnmountedRef.current = false;

    const sock = getMeetingSocket(env.socketUrl, accessToken);
    socketRef.current = sock;

    /**
     * Schedule an automatic reconnect attempt with exponential backoff.
     * Delays: 1s, 2s, 4s, 8s, 16s (capped at 30s).
     */
    const scheduleReconnect = (attempt: number) => {
      if (attempt >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus(SOCKET_STATUS.ERROR);
        setIsReconnecting(false);
        return;
      }

      // Guard against double-scheduling
      if (reconnectTimerRef.current !== null) return;

      setReconnectAttempt(attempt + 1);
      const delay = Math.min(Math.pow(2, attempt) * 1000, 30000);

      reconnectTimerRef.current = setTimeout(() => {
        if (isUnmountedRef.current) return;
        reconnectTimerRef.current = null;
        reconnectAttemptRef.current = attempt + 1;
        sock.connect();
      }, delay);
    };

    const handleConnect = () => {
      // Clear any pending reconnect timer
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      reconnectAttemptRef.current = 0;
      setReconnectAttempt(0);
      setIsReconnecting(false);
      setConnectionStatus(SOCKET_STATUS.CONNECTED);
      setError(null);
      // Restore socket state — this re-triggers useParticipants which re-emits watch-meeting
      setSocket(sock);
    };

    const handleConnectError = (err: Error) => {
      if (reconnectAttemptRef.current > 0) {
        setError(err.message);
        return;
      }
      setConnectionStatus(SOCKET_STATUS.ERROR);
      setError(err.message);
    };

    const handleDisconnect = (reason: string) => {
      // Intentional disconnect from cleanup — skip reconnect loop entirely
      if (reason === 'io client disconnect') return;

      setConnectionStatus(SOCKET_STATUS.RECONNECTING);
      setIsReconnecting(true);
      // Null out socket so useParticipants stops listening; it will re-subscribe on reconnect
      setSocket(null);
      scheduleReconnect(reconnectAttemptRef.current);
    };

    sock.on('connect', handleConnect);
    sock.on('connect_error', handleConnectError);
    sock.on('disconnect', handleDisconnect);

    if (!sock.connected) {
      sock.connect();
    }

    return () => {
      // Must be set before destroyMeetingSocket so any in-flight timeout exits cleanly
      isUnmountedRef.current = true;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      sock.off('connect', handleConnect);
      sock.off('connect_error', handleConnectError);
      sock.off('disconnect', handleDisconnect);
      destroyMeetingSocket();
      socketRef.current = null;
      setSocket(null);
      setConnectionStatus(SOCKET_STATUS.IDLE);
      setError(null);
      setIsReconnecting(false);
      setReconnectAttempt(0);
      reconnectAttemptRef.current = 0;
    };
  }, [meetingId, accessToken]);

  return {
    isConnected: connectionStatus === SOCKET_STATUS.CONNECTED,
    connectionStatus,
    error,
    socket,
    joinRoom,
    isReconnecting,
    reconnectAttempt,
  };
};
