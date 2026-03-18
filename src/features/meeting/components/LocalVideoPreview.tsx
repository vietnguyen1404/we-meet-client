import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import SpinnerIcon from '@/assets/icons/spinner.svg?react';
import { useAuth } from '@/features/auth';
import { ParticipantAvatar } from './ParticipantAvatar';

interface LocalVideoPreviewProps {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
}

export const LocalVideoPreview = ({ stream, isLoading, error }: LocalVideoPreviewProps) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-48">
        <SpinnerIcon className="animate-spin h-8 w-8 text-primary" />
        <Text className="text-sm text-gray-500">{t('meeting.lobby.mediaLoading')}</Text>
      </div>
    );
  }

  const isPermissionDenied = error === t('meeting.lobby.mediaPermissionDenied');

  return (
    <div className="h-64 overflow-hidden rounded-lg">
      {isPermissionDenied ? (
        <ParticipantAvatar
          displayName={user?.name ?? t('meeting.lobby.you')}
          isMuted
          className="h-full"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover scale-x-[-1]"
        />
      )}
    </div>
  );
};
