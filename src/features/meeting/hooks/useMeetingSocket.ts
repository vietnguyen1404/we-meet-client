import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth';
import { env } from '@/config';
import { getMeetingSocket, destroyMeetingSocket } from '../services/socket';
import { SOCKET_STATUS } from '../types/meeting.types';
import type { SocketConnectionStatus, UseMeetingSocketReturn } from '../types/meeting.types';
import { SOCKET_REASONS_ERROR } from '../types/socket.types';

const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Manages the Socket.IO client lifecycle for a meeting room.
 *
 * **Lazy connect** — the socket is created on mount but does NOT connect
 * automatically. The consumer must call `connect()` explicitly (e.g. when
 * the user clicks "Join Meeting").
 *
 * On successful reconnect after an unexpected disconnect the hook
 * automatically re-emits `join-room` so the server restores the
 * participant's presence.
 */
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

  // Tracks whether the user has entered the call (join-room emitted).
  // Used to auto re-emit join-room on reconnect.
  const hasJoinedRef = useRef<boolean>(false);

  // Promise callbacks for the imperative `connect()` method.
  const connectResolveRef = useRef<(() => void) | null>(null);
  const connectRejectRef = useRef<((err: Error) => void) | null>(null);

  /**
   * Emit watch-meeting to observe lobby presence without entering the call.
   * Safe to call multiple times — the server is idempotent.
   */
  const watchMeeting = useCallback(() => {
    if (socketRef.current?.connected && meetingId) {
      socketRef.current.emit('watch-meeting', { meetingId });
    }
  }, [meetingId]);

  /**
   * Emit join-room to enter the video call room.
   * Safe to call multiple times — the server is idempotent.
   */
  const joinRoom = useCallback(() => {
    if (socketRef.current?.connected && meetingId) {
      socketRef.current.emit('join-room', { meetingId });
      hasJoinedRef.current = true;
    }
  }, [meetingId]);

  /**
   * Emit leave-room, disconnect, and reset all socket state.
   */
  const leaveRoom = useCallback(() => {
    if (socketRef.current?.connected && meetingId) {
      socketRef.current.emit('leave-room', { meetingId });
    }
    hasJoinedRef.current = false;
    destroyMeetingSocket();
    socketRef.current = null;
    setSocket(null);
    setConnectionStatus(SOCKET_STATUS.IDLE);
    setError(null);
    setIsReconnecting(false);
    setReconnectAttempt(0);
    reconnectAttemptRef.current = 0;
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, [meetingId]);

  useEffect(() => {
    if (!meetingId) return;

    if (!accessToken) {
      console.warn('[useMeetingSocket] accessToken is null — skipping socket setup');
      return;
    }

    if (!env.socketUrl) {
      console.warn('[useMeetingSocket] VITE_WS_URL is not set — skipping socket setup');
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
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      reconnectAttemptRef.current = 0;
      setReconnectAttempt(0);
      setIsReconnecting(false);
      setConnectionStatus(SOCKET_STATUS.CONNECTED);
      setError(null);
      setSocket(sock);

      // Resolve pending connect() promise (initial connect).
      if (connectResolveRef.current) {
        connectResolveRef.current();
        connectResolveRef.current = null;
        connectRejectRef.current = null;
      }

      // Re-emit join-room on reconnect so the server restores presence.
      if (hasJoinedRef.current && meetingId) {
        sock.emit('join-room', { meetingId });
      }
    };

    const handleConnectError = (err: Error) => {
      // Reject pending connect() promise on the first attempt.
      if (connectResolveRef.current) {
        connectRejectRef.current?.(err);
        connectResolveRef.current = null;
        connectRejectRef.current = null;
      }

      if (reconnectAttemptRef.current > 0) {
        setError(err.message);
        return;
      }
      setConnectionStatus(SOCKET_STATUS.ERROR);
      setError(err.message);
    };

    const handleDisconnect = (reason: string) => {
      // Intentional disconnect from cleanup or leaveRoom — skip reconnect
      if (reason === SOCKET_REASONS_ERROR.IO_CLIENT_DISCONNECT) return;

      setConnectionStatus(SOCKET_STATUS.RECONNECTING);
      setIsReconnecting(true);
      // Null out socket so downstream hooks (useParticipants, useSignaling) go dormant
      setSocket(null);
      scheduleReconnect(reconnectAttemptRef.current);
    };

    sock.on('connect', handleConnect);
    sock.on('connect_error', handleConnectError);
    sock.on('disconnect', handleDisconnect);

    return () => {
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
      hasJoinedRef.current = false;
      // Reject any pending connect() promise.
      if (connectRejectRef.current) {
        connectRejectRef.current(new Error('Socket unmounted'));
        connectResolveRef.current = null;
        connectRejectRef.current = null;
      }
    };
  }, [meetingId, accessToken]);

  /**
   * Imperatively connect the socket.
   * Returns a promise that resolves on the `connect` event,
   * or rejects on `connect_error` / unmount.
   */
  const connect = useCallback((): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const sock = socketRef.current;
      if (!sock) {
        reject(new Error('Socket not initialised — ensure meetingId and accessToken are set'));
        return;
      }
      if (sock.connected) {
        resolve();
        return;
      }
      connectResolveRef.current = resolve;
      connectRejectRef.current = reject;
      setConnectionStatus(SOCKET_STATUS.CONNECTING);
      sock.connect();
    });
  }, []);

  return {
    isConnected: connectionStatus === SOCKET_STATUS.CONNECTED,
    connectionStatus,
    error,
    socket,
    connect,
    joinRoom,
    leaveRoom,
    watchMeeting,
    isReconnecting,
    reconnectAttempt,
  };
};
