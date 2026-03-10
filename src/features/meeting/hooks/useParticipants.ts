import { useState, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { MEETING_ROLE } from '@/shared';
import type { MeetingRole } from '@/shared';
import type {
  MeetingMember,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  ParticipantsListPayload,
  UseParticipantsReturn,
} from '../types/meeting.types';

const toISOString = (value: string | Date): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

export const useParticipants = (
  socket: Socket | null,
  meetingId: string | undefined,
  initialMembers: MeetingMember[],
  currentUserId: string | undefined,
): UseParticipantsReturn => {
  // 'Update state during render' pattern: sync state from prop without useEffect
  const [prevInitialMembers, setPrevInitialMembers] = useState(initialMembers);
  const [participants, setParticipants] = useState(initialMembers);
  const initialMembersRef = useRef(initialMembers);

  if (prevInitialMembers !== initialMembers) {
    setPrevInitialMembers(initialMembers);
    setParticipants(initialMembers);
  }

  // Keep ref in sync so socket handlers can read the latest roles without
  // needing initialMembers in the socket useEffect deps.
  useEffect(() => {
    initialMembersRef.current = initialMembers;
  }, [initialMembers]);

  useEffect(() => {
    if (!socket || !meetingId) return;

    socket.emit('get-participants', { meetingId });

    const resolveRole = (userId: string): MeetingRole =>
      initialMembersRef.current.find((m) => m.userId === userId)?.role ?? MEETING_ROLE.PARTICIPANT;

    const handleParticipantJoined = (payload: ParticipantJoinedPayload) => {
      const { participant } = payload;
      setParticipants((prev) => {
        const exists = prev.some((p) => p.userId === participant.userId);
        if (exists) return prev;
        return [
          ...prev,
          {
            id: participant.userId,
            userId: participant.userId,
            userName: participant.name || 'Unknown User',
            role: resolveRole(participant.userId),
            joinedAt: toISOString(participant.joinedAt),
          },
        ];
      });
    };

    const handleParticipantLeft = (payload: ParticipantLeftPayload) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== payload.participant.userId));
    };

    const handleParticipantsList = (payload: ParticipantsListPayload) => {
      setParticipants(
        payload.participants.map((p) => ({
          id: p.userId,
          userId: p.userId,
          userName: p.name || 'Unknown User',
          role: resolveRole(p.userId),
          joinedAt: toISOString(p.joinedAt),
        })),
      );
    };

    socket.on('participant-joined', handleParticipantJoined);
    socket.on('participant-left', handleParticipantLeft);
    socket.on('participants-list', handleParticipantsList);

    return () => {
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('participant-left', handleParticipantLeft);
      socket.off('participants-list', handleParticipantsList);
    };
  }, [socket, meetingId]);

  void currentUserId;

  return {
    participants,
    participantCount: participants.length,
  };
};
