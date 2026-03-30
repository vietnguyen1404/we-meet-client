import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import SpinnerIcon from '@/assets/icons/spinner.svg?react';
import { getInitialsFromName, getAvatarColor } from '@/shared/utils/avatar';
import type { ParticipantInfo } from '../types/meeting.types';

interface ParticipantListProps {
  participants: ParticipantInfo[];
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

      {participants.map((participant) => (
        <div
          key={participant.socketId}
          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(participant.name)}`}
          >
            <Text as="span" className="text-white font-medium text-sm">
              {getInitialsFromName(participant.name)}
            </Text>
          </div>
          <div className="flex-1 min-w-0">
            <Text className="text-sm font-medium text-gray-900 truncate">
              {participant.name}
              {participant.userId === currentUserId && (
                <Text as="span" className="ml-2 text-xs text-gray-500">
                  {t('meeting.lobby.youLabel')}
                </Text>
              )}
            </Text>
            {participant.isHost && (
              <Text as="span" className="text-xs text-primary font-medium">
                {t('meeting.role.host')}
              </Text>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
