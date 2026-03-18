import { useState, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  ParticipantInfo,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  ParticipantsListPayload,
  UseParticipantsReturn,
} from '../types/meeting.types';

export const useParticipants = (
  socket: Socket | null,
  meetingId: string | undefined,
): UseParticipantsReturn => {
  const [participantMap, setParticipantMap] = useState<Record<string, ParticipantInfo>>({});
  const participantMapRef = useRef<Record<string, ParticipantInfo>>({});

  // Keep ref in sync after every render so handlers always read latest state
  useEffect(() => {
    participantMapRef.current = participantMap;
  });

  useEffect(() => {
    if (!socket || !meetingId) return;

    const handleParticipantsList = (payload: ParticipantsListPayload) => {
      if (!Array.isArray(payload?.participants)) {
        console.warn(
          '[useParticipants] participants-list: expected array, got',
          typeof payload?.participants,
        );
        return;
      }

      const map: Record<string, ParticipantInfo> = {};

      for (const p of payload.participants) {
        map[p.userId] = p; // key by userId to deduplicate reconnects
      }
      setParticipantMap(map);
    };

    const handleParticipantJoined = (payload: ParticipantJoinedPayload) => {
      const participant = payload?.participant;
      if (!participant || typeof participant.userId !== 'string' || !participant.userId) {
        console.warn(
          '[useParticipants] participant-joined: malformed payload — missing or invalid participant.userId',
          payload,
        );
        return;
      }

      setParticipantMap((prev) => {
        if (prev[participant.userId]) return prev;
        return { ...prev, [participant.userId]: participant };
      });
    };

    const handleParticipantLeft = (payload: ParticipantLeftPayload) => {
      const participant = payload?.participant;
      if (!participant || typeof participant.userId !== 'string' || !participant.userId) {
        console.warn(
          '[useParticipants] participant-left: malformed payload — missing or invalid participant.userId',
          payload,
        );
        return;
      }

      const { userId } = participant;
      if (!participantMapRef.current[userId]) {
        console.warn(
          '[useParticipants] participant-left: userId not found in map, treating as no-op',
          userId,
        );
        return;
      }
      setParticipantMap((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    socket.on('participants-list', handleParticipantsList);
    socket.on('participant-joined', handleParticipantJoined);
    socket.on('participant-left', handleParticipantLeft);

    return () => {
      socket.off('participants-list', handleParticipantsList);
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('participant-left', handleParticipantLeft);

      setParticipantMap({});
    };
  }, [socket, meetingId]);

  const participants = Object.values(participantMap);

  return {
    participants,
    participantCount: participants.length,
  };
};
