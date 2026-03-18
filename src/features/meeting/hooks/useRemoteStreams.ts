import { useState, useEffect, useRef, useCallback } from 'react';
import type { PeerConnectionStatus, UseRemoteStreamsReturn } from '../types/meeting.types';

export const useRemoteStreams = (
  getPeerConnection: (peerId: string) => RTCPeerConnection | undefined,
  peerStatuses: Record<string, PeerConnectionStatus>,
): UseRemoteStreamsReturn => {
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(() => new Map());
  // Tracks which peers currently have a stream so we can clean up on departure.
  const activeStreamPeersRef = useRef<Set<string>>(new Set());
  const isUnmountedRef = useRef(false);

  /**
   * Add or update a remote stream immediately.
   * Called by useSignaling right when pc.ontrack fires, avoiding the async
   * useEffect timing window where a fast track event could be missed.
   */
  const addStream = useCallback((peerId: string, stream: MediaStream) => {
    if (isUnmountedRef.current) return;
    activeStreamPeersRef.current.add(peerId);
    setRemoteStreams((prev) => {
      if (prev.get(peerId) === stream) return prev;
      const next = new Map(prev);
      next.set(peerId, stream);
      return next;
    });
  }, []);

  const removeStream = useCallback(
    (peerId: string) => {
      const pc = getPeerConnection(peerId);
      if (pc) {
        pc.ontrack = null;
      }
      activeStreamPeersRef.current.delete(peerId);
      setRemoteStreams((prev) => {
        if (!prev.has(peerId)) return prev;
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    },
    [getPeerConnection],
  );

  useEffect(() => {
    const currentPeerIds = new Set(Object.keys(peerStatuses));

    // Remove streams for peers that have left or whose connection is closed/failed.
    // ontrack attachment is handled synchronously by useSignaling via addStream.
    for (const activePeerId of Array.from(activeStreamPeersRef.current)) {
      const status = peerStatuses[activePeerId];
      const hasLeft = !currentPeerIds.has(activePeerId);
      const isClosed = status === 'closed' || status === 'failed';
      if (hasLeft || isClosed) {
        removeStream(activePeerId);
      }
    }
  }, [peerStatuses, removeStream]);

  useEffect(() => {
    // Capture ref value at effect setup time per react-hooks/exhaustive-deps convention
    const activeStreamPeers = activeStreamPeersRef.current;
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      activeStreamPeers.clear();
      setRemoteStreams(new Map());
    };
  }, []);

  return { remoteStreams, addStream };
};
