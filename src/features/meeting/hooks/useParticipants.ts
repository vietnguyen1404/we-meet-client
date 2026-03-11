import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!socket || !meetingId) return;

    const handleParticipantsList = (payload: ParticipantsListPayload) => {
      const map: Record<string, ParticipantInfo> = {};

      for (const p of payload.participants) {
        map[p.userId] = p; // key by userId to deduplicate reconnects
      }
      setParticipantMap(map);
    };

    const handleParticipantJoined = (payload: ParticipantJoinedPayload) => {
      const { participant } = payload;
      setParticipantMap((prev) => {
        if (prev[participant.userId]) return prev;
        return { ...prev, [participant.userId]: participant };
      });
    };

    const handleParticipantLeft = (payload: ParticipantLeftPayload) => {
      const { userId } = payload.participant;
      setParticipantMap((prev) => {
        if (!prev[userId]) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    socket.on('participants-list', handleParticipantsList);
    socket.on('participant-joined', handleParticipantJoined);
    socket.on('participant-left', handleParticipantLeft);

    // Emit after listeners are registered so the response is never dropped.
    socket.emit('watch-meeting', { meetingId });

    return () => {
      socket.off('participants-list', handleParticipantsList);
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('participant-left', handleParticipantLeft);
      // Reset stale entries when this socket is torn down (on reconnect or
      // unmount). By the time the new socket fires, the map is empty and
      // participants-list will populate it fresh.
      setParticipantMap({});
    };
  }, [socket, meetingId]);

  const participants = Object.values(participantMap);

  return {
    participants,
    participantCount: participants.length,
  };
};
