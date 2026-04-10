import { useState, useEffect, useRef, useCallback } from 'react';
import { env } from '@/config/env';
import type { PeerConnectionStatus, UsePeerConnectionsReturn } from '../types/meeting.types';

const MAX_PEER_CONNECTIONS = 3;
const DEFAULT_STUN = 'stun:stun.l.google.com:19302';
let stunWarnedOnce = false;
export const usePeerConnections = (
  stream: MediaStream | null,
  videoSendersRef?: { current: Set<RTCRtpSender> },
  audioSendersRef?: { current: Set<RTCRtpSender> },
): UsePeerConnectionsReturn => {
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [peerStatuses, setPeerStatuses] = useState<Record<string, PeerConnectionStatus>>({});
  const isUnmountedRef = useRef<boolean>(false);

  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection | null => {
      // Guard: old browser without RTCPeerConnection
      if (typeof RTCPeerConnection === 'undefined') {
        console.error('[usePeerConnections] RTCPeerConnection is not supported in this browser.');
        return null;
      }

      const map = peerConnectionsRef.current;
      // Close existing connection for this peer before replacing (always allowed, even when map is full)
      if (map.has(peerId)) {
        const existing = map.get(peerId)!;
        try {
          existing.getSenders().forEach((s) => {
            videoSendersRef?.current.delete(s);
            audioSendersRef?.current.delete(s);
            existing.removeTrack(s);
          });
          existing.close();
        } catch (err) {
          console.warn(
            `[usePeerConnections] Error closing existing connection for "${peerId}":`,
            err,
          );
        }
        map.delete(peerId);
        setPeerStatuses((prev) => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      }

      // Guard: mesh limit (checked after duplicate removal so replacing an existing peer is always permitted)
      if (map.size >= MAX_PEER_CONNECTIONS) {
        console.warn(
          `[usePeerConnections] Cannot create connection for "${peerId}": mesh limit (${MAX_PEER_CONNECTIONS}) reached.`,
        );
        return null;
      }

      // Guard: warn when stream is null
      if (stream === null) {
        console.warn(
          `[usePeerConnections] createPeerConnection("${peerId}"): stream is null, addTrack will be skipped.`,
        );
      }

      // Resolve STUN URL
      const stunUrl = env.stunUrl ?? DEFAULT_STUN;
      if (!env.stunUrl && !stunWarnedOnce) {
        stunWarnedOnce = true;
        console.warn(
          '[usePeerConnections] VITE_STUN_URL is not set; falling back to default STUN server.',
        );
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: stunUrl },
          {
            urls: env.turnUrl,
            username: env.turnUsername,
            credential: env.turnCredential,
          },
        ],
      });

      // Add local tracks and register senders
      if (stream !== null) {
        stream.getTracks().forEach((track) => {
          const sender = pc.addTrack(track, stream);
          if (track.kind === 'video') videoSendersRef?.current.add(sender);
          else if (track.kind === 'audio') audioSendersRef?.current.add(sender);
        });
      }

      // Track connection state changes
      pc.addEventListener('connectionstatechange', () => {
        if (isUnmountedRef.current) return;
        if (!peerConnectionsRef.current.has(peerId)) return;
        setPeerStatuses((prev) => ({
          ...prev,
          [peerId]: pc.connectionState as PeerConnectionStatus,
        }));
      });

      map.set(peerId, pc);

      // Set initial status
      setPeerStatuses((prev) => ({ ...prev, [peerId]: 'connecting' }));

      return pc;
    },
    [stream, videoSendersRef, audioSendersRef],
  );

  const closePeerConnection = useCallback(
    (peerId: string): void => {
      const map = peerConnectionsRef.current;
      const pc = map.get(peerId);
      if (!pc) return;

      pc.getSenders().forEach((s) => {
        videoSendersRef?.current.delete(s);
        audioSendersRef?.current.delete(s);
        try {
          pc.removeTrack(s);
        } catch (err) {
          console.warn(`[usePeerConnections] removeTrack error for "${peerId}":`, err);
        }
      });

      try {
        pc.close();
      } catch (err) {
        console.error(`[usePeerConnections] pc.close() error for "${peerId}":`, err);
      }

      map.delete(peerId);

      setPeerStatuses((prev) => {
        const next = { ...prev };
        delete next[peerId];
        return next;
      });
    },
    [videoSendersRef, audioSendersRef],
  );

  useEffect(() => {
    isUnmountedRef.current = false;
    const map = peerConnectionsRef.current;
    const videoSenders = videoSendersRef?.current;
    const audioSenders = audioSendersRef?.current;
    return () => {
      isUnmountedRef.current = true;
      map.forEach((pc) => {
        pc.getSenders().forEach((s) => {
          videoSenders?.delete(s);
          audioSenders?.delete(s);
        });
        try {
          pc.close();
        } catch {
          // Ignore close errors during teardown
        }
      });
      map.clear();
      setPeerStatuses({});
    };
  }, [videoSendersRef, audioSendersRef]);

  const getPeerConnection = useCallback((peerId: string): RTCPeerConnection | undefined => {
    return peerConnectionsRef.current.get(peerId);
  }, []);

  return {
    createPeerConnection,
    closePeerConnection,
    getPeerConnection,
    peerStatuses,
    peerCount: Object.keys(peerStatuses).length,
  };
};
