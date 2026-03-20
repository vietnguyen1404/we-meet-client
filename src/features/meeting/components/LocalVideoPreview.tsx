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
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
}

export const LocalVideoPreview = ({
  stream,
  isLoading,
  error,
  isCameraOn,
  isMicrophoneOn,
}: LocalVideoPreviewProps) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!videoRef.current) return;
    if (isCameraOn && stream) {
      videoRef.current.srcObject = stream;
    } else {
      videoRef.current.srcObject = null;
    }
  }, [stream, isCameraOn]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-48">
        <SpinnerIcon className="animate-spin h-8 w-8 text-primary" />
        <Text className="text-sm text-gray-500">{t('meeting.lobby.mediaLoading')}</Text>
      </div>
    );
  }

  const isPermissionDenied = error === t('meeting.lobby.mediaPermissionDenied');
  const showPlaceholder = !isCameraOn || isPermissionDenied || !stream;

  return (
    <div className="flex min-h-64 overflow-hidden rounded-lg">
      {showPlaceholder ? (
        <ParticipantAvatar
          displayName={user?.name ?? t('meeting.lobby.you')}
          isMuted={!isMicrophoneOn}
          className="flex-1"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="flex-1 w-full object-cover scale-x-[-1]"
        />
      )}
    </div>
  );
};
