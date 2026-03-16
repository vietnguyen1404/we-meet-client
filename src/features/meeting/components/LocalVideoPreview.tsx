import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import AlertTriangleIcon from '@/assets/icons/alert-triangle.svg?react';
import SpinnerIcon from '@/assets/icons/spinner.svg?react';

interface LocalVideoPreviewProps {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
}

export const LocalVideoPreview = ({ stream, isLoading, error }: LocalVideoPreviewProps) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

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

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
        <AlertTriangleIcon className="h-5 w-5 shrink-0 text-yellow-600" />
        <Text className="text-sm text-yellow-800">{t(error)}</Text>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover scale-x-[-1]"
      />
    </div>
  );
};
