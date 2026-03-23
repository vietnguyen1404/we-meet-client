import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/shared/utils/toast';
import { MeetingPhase, MeetingPhaseFlags } from '@/shared/constants/meeting';
import type { ParticipantJoinedPayload, ParticipantLeftPayload } from '../types/meeting.types';

/**
 * Shows toast notifications when participants join or leave the meeting.
 *
 * Only fires while the current user is IN_CALL (not during lobby/watch-meeting).
 * Uses toast IDs to prevent duplicate notifications for the same event.
 */
export const useParticipantToasts = (
  socket: Socket | null,
  phase: MeetingPhase,
  currentUserId: string | undefined,
): void => {
  const { t } = useTranslation();
  const phaseRef = useRef(phase);
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (!socket) return;

    const handleJoined = (payload: ParticipantJoinedPayload) => {
      if (!MeetingPhaseFlags.isInCall(phaseRef.current)) return;

      const participant = payload?.participant;
      if (!participant || participant.userId === currentUserIdRef.current) return;

      const name = participant.name ?? participant.userId;
      showToast.success(t('meeting.toast.userJoined', { name }), `join-${participant.userId}`);
    };

    const handleLeft = (payload: ParticipantLeftPayload) => {
      if (!MeetingPhaseFlags.isInCall(phaseRef.current)) return;

      const participant = payload?.participant;
      if (!participant || participant.userId === currentUserIdRef.current) return;

      const name = participant.name ?? participant.userId;
      showToast.info(t('meeting.toast.userLeft', { name }), `leave-${participant.userId}`);
    };

    socket.on('participant-joined', handleJoined);
    socket.on('participant-left', handleLeft);

    return () => {
      socket.off('participant-joined', handleJoined);
      socket.off('participant-left', handleLeft);
    };
  }, [socket, t]);
};
