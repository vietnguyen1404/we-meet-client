import { useTranslation } from 'react-i18next';
import { MEETING_ROLE } from '@/shared';
import { Text } from '@/components/ui';
import SpinnerIcon from '@/assets/icons/spinner.svg?react';
import type { MeetingMember } from '../types/meeting.types';

interface ParticipantListProps {
  participants: MeetingMember[];
  currentUserId: string | undefined;
  isSocketConnected: boolean;
}

export const ParticipantList = ({
  participants,
  currentUserId,
  isSocketConnected,
}: ParticipantListProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {!isSocketConnected && participants.length === 0 && (
        <div className="flex items-center gap-2 text-gray-400">
          <SpinnerIcon className="animate-spin h-4 w-4 shrink-0" />
          <Text className="text-sm text-gray-400">{t('meeting.lobby.participantsLoading')}</Text>
        </div>
      )}

      {isSocketConnected && participants.length === 0 && (
        <Text className="text-sm text-gray-500">{t('meeting.lobby.participantsEmpty')}</Text>
      )}

      {participants.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Text as="span" className="text-primary font-medium">
                {member.userName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </div>
            <div>
              <Text className="text-sm font-medium text-gray-900">
                {member.userName}
                {member.userId === currentUserId && (
                  <Text as="span" className="ml-2 text-xs text-gray-500">
                    {t('meeting.lobby.youLabel')}
                  </Text>
                )}
              </Text>
            </div>
          </div>
          {member.role === MEETING_ROLE.HOST && (
            <Text
              as="span"
              className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
            >
              {t('meeting.role.host')}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
};
