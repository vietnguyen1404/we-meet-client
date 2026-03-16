import { useState, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  OfferPayload,
  AnswerPayload,
  IceCandidatePayload,
  ParticipantJoinedPayload,
  UseSignalingReturn,
} from '../types/meeting.types';

/**
 * useSignaling — WebRTC signaling layer.
 *
 * Listens to socket relay events (offer, answer, ice-candidate, participant-joined)
 * and drives RTCPeerConnection negotiation so that media can flow between participants.
 *
 * Peer IDs are socketIds as specified by the backend signaling protocol.
 * All relay payloads follow the shape documented in socket-signaling.md.
 */
export const useSignaling = (
  socket: Socket | null,
  meetingId: string | undefined,
  createPeerConnection: (peerId: string) => RTCPeerConnection | null,
  closePeerConnection: (peerId: string) => void,
  getPeerConnection: (peerId: string) => RTCPeerConnection | undefined,
): UseSignalingReturn => {
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationErrors, setNegotiationErrors] = useState<Record<string, string | null>>({});

  /**
   * Buffers RTCIceCandidateInit per peer before remote description is set.
   * Key is socketId (peerId).
   */
  const iceCandidateQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  /**
   * Tracks which peers have had setRemoteDescription called so ICE candidates
   * can be applied immediately rather than buffered.
   */
  const remoteDescriptionSetRef = useRef<Set<string>>(new Set());
  const isUnmountedRef = useRef<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const activeNegotiationsRef = useRef<number>(0);

  useEffect(() => {
    if (!socket || !meetingId) return;

    // Reset the unmount guard each time the effect runs (new socket or meetingId).
    isUnmountedRef.current = false;
    socketRef.current = socket;

    const drainIceCandidateQueue = async (peerId: string, pc: RTCPeerConnection): Promise<void> => {
      const queue = iceCandidateQueuesRef.current.get(peerId);
      if (!queue?.length) return;
      iceCandidateQueuesRef.current.delete(peerId);
      for (const candidateInit of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
        } catch {
          // Ignore individual addIceCandidate failures; continue draining remaining candidates
        }
      }
    };

    const attachOnIceCandidate = (peerId: string, pc: RTCPeerConnection): void => {
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (isUnmountedRef.current || !event.candidate || !socketRef.current) return;
        socketRef.current.emit('ice-candidate', {
          meetingId,
          targetSocketId: peerId,
          payload: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
        });
      };
    };

    // ── Handler: participant-joined ──────────────────────────────────────────
    // Fired when a remote participant joins the video call room. We are the
    // existing participant — we initiate the offer.
    const handleParticipantJoined = async (data: ParticipantJoinedPayload): Promise<void> => {
      const participant = data?.participant;
      if (!participant || typeof participant.socketId !== 'string' || !participant.socketId) {
        console.warn('[useSignaling] participant-joined: malformed payload', data);
        return;
      }

      const peerId = participant.socketId;

      // Clear stale buffers in case this peer reconnected
      iceCandidateQueuesRef.current.delete(peerId);
      remoteDescriptionSetRef.current.delete(peerId);

      const pc = createPeerConnection(peerId);
      if (!pc) {
        console.warn(
          `[useSignaling] handleParticipantJoined: could not create PC for "${peerId}" (mesh limit or error)`,
        );
        return;
      }

      attachOnIceCandidate(peerId, pc);

      activeNegotiationsRef.current += 1;
      setIsNegotiating(true);
      try {
        const offer = await pc.createOffer();
        if (isUnmountedRef.current) return;
        await pc.setLocalDescription(offer);
        if (isUnmountedRef.current) return;
        socket.emit('offer', {
          meetingId,
          targetSocketId: peerId,
          payload: { type: 'offer', sdp: offer.sdp },
        });
      } catch (err) {
        console.error(
          `[useSignaling] handleParticipantJoined: offer creation failed for "${peerId}"`,
          err,
        );
        closePeerConnection(peerId);
        if (!isUnmountedRef.current) {
          const message = err instanceof Error ? err.message : String(err);
          setNegotiationErrors((prev) => ({ ...prev, [peerId]: message }));
        }
      } finally {
        activeNegotiationsRef.current = Math.max(0, activeNegotiationsRef.current - 1);
        if (!isUnmountedRef.current) {
          setIsNegotiating(activeNegotiationsRef.current > 0);
        }
      }
    };

    // Fired when a remote participant sends us an offer. We create an answer.
    const handleOffer = async (data: OfferPayload): Promise<void> => {
      if (!data?.fromSocketId || typeof data.fromSocketId !== 'string') {
        console.warn('[useSignaling] offer: malformed fromSocketId', data);
        return;
      }
      if (!data.payload?.sdp || typeof data.payload.sdp !== 'string') {
        console.warn('[useSignaling] offer: malformed payload.sdp', data);
        return;
      }

      const peerId = data.fromSocketId;

      iceCandidateQueuesRef.current.delete(peerId);
      remoteDescriptionSetRef.current.delete(peerId);

      const pc = createPeerConnection(peerId);
      if (!pc) {
        console.warn(
          `[useSignaling] handleOffer: could not create PC for "${peerId}" (mesh limit or error)`,
        );
        return;
      }

      attachOnIceCandidate(peerId, pc);

      activeNegotiationsRef.current += 1;
      setIsNegotiating(true);
      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: 'offer', sdp: data.payload.sdp }),
        );
        if (isUnmountedRef.current) return;
        remoteDescriptionSetRef.current.add(peerId);
        await drainIceCandidateQueue(peerId, pc);
        if (isUnmountedRef.current) return;

        const answer = await pc.createAnswer();
        if (isUnmountedRef.current) return;
        await pc.setLocalDescription(answer);
        if (isUnmountedRef.current) return;

        socket.emit('answer', {
          meetingId,
          targetSocketId: peerId,
          payload: { type: 'answer', sdp: answer.sdp },
        });
      } catch (err) {
        console.error(`[useSignaling] handleOffer: failed for "${peerId}"`, err);
        closePeerConnection(peerId);
        if (!isUnmountedRef.current) {
          const message = err instanceof Error ? err.message : String(err);
          setNegotiationErrors((prev) => ({ ...prev, [peerId]: message }));
        }
      } finally {
        activeNegotiationsRef.current = Math.max(0, activeNegotiationsRef.current - 1);
        if (!isUnmountedRef.current) {
          setIsNegotiating(activeNegotiationsRef.current > 0);
        }
      }
    };

    // Fired when the remote peer responds to our offer with an SDP answer.
    const handleAnswer = async (data: AnswerPayload): Promise<void> => {
      if (!data?.fromSocketId || typeof data.fromSocketId !== 'string') {
        console.warn('[useSignaling] answer: malformed fromSocketId', data);
        return;
      }
      if (!data.payload?.sdp || typeof data.payload.sdp !== 'string') {
        console.warn('[useSignaling] answer: malformed payload.sdp', data);
        return;
      }

      const peerId = data.fromSocketId;
      const pc = getPeerConnection(peerId);
      if (!pc) {
        console.warn(`[useSignaling] handleAnswer: no peer connection for "${peerId}"`, data);
        return;
      }

      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp: data.payload.sdp }),
        );
        if (isUnmountedRef.current) return;
        remoteDescriptionSetRef.current.add(peerId);
        await drainIceCandidateQueue(peerId, pc);
      } catch (err) {
        console.error(`[useSignaling] handleAnswer: failed for "${peerId}"`, err);
        if (!isUnmountedRef.current) {
          const message = err instanceof Error ? err.message : String(err);
          setNegotiationErrors((prev) => ({ ...prev, [peerId]: message }));
        }
      }
    };

    // Apply immediately if remote description is set; otherwise buffer.
    const handleIceCandidate = async (data: IceCandidatePayload): Promise<void> => {
      if (!data?.fromSocketId || typeof data.fromSocketId !== 'string') {
        console.warn('[useSignaling] ice-candidate: malformed fromSocketId', data);
        return;
      }
      if (!data.payload?.candidate || typeof data.payload.candidate !== 'string') {
        console.warn('[useSignaling] ice-candidate: malformed payload.candidate', data);
        return;
      }

      const peerId = data.fromSocketId;
      const candidateInit: RTCIceCandidateInit = {
        candidate: data.payload.candidate,
        sdpMid: data.payload.sdpMid,
        sdpMLineIndex: data.payload.sdpMLineIndex,
      };

      if (remoteDescriptionSetRef.current.has(peerId)) {
        const pc = getPeerConnection(peerId);
        if (!pc) {
          console.warn(
            `[useSignaling] handleIceCandidate: no PC for "${peerId}", discarding candidate`,
          );
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
        } catch {
          // Ignore individual addIceCandidate failures
        }
      } else {
        // Buffer the candidate until setRemoteDescription has been called for this peer
        const queue = iceCandidateQueuesRef.current.get(peerId) ?? [];
        queue.push(candidateInit);
        iceCandidateQueuesRef.current.set(peerId, queue);
      }
    };

    socket.on('participant-joined', handleParticipantJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    // Capture current map/set in local variables so cleanup uses the same
    // object reference even if the ref is reassigned (satisfies react-hooks/exhaustive-deps).
    const iceCandidateQueues = iceCandidateQueuesRef.current;
    const remoteDescriptionSet = remoteDescriptionSetRef.current;

    return () => {
      isUnmountedRef.current = true;
      socketRef.current = null;
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      iceCandidateQueues.clear();
      remoteDescriptionSet.clear();
    };
  }, [socket, meetingId, createPeerConnection, closePeerConnection, getPeerConnection]);

  return { isNegotiating, negotiationErrors };
};
