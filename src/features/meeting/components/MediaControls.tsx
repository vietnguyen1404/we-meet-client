import { useTranslation } from 'react-i18next';
import { cn } from '@/shared';
import { IconButton } from '@/components/ui';
import MicOffIcon from '@/assets/icons/mic-off.svg?react';
import VideocamIcon from '@/assets/icons/videocam.svg?react';
import LeaveIcon from '@/assets/icons/leave.svg?react';

interface MediaControlsProps {
  stream: MediaStream | null;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface MediaControlsLeaveProps {
  onLeave: () => void;
}

const LeaveButton = ({ onLeave }: MediaControlsLeaveProps) => {
  const { t } = useTranslation();

  return (
    <IconButton
      onClick={onLeave}
      aria-label={t('meeting.controls.leave')}
      title={t('meeting.controls.leave')}
      className="ml-4 h-12 w-12 bg-red-600 text-white hover:bg-red-700 transition-colors"
    >
      <LeaveIcon className="w-5 h-5" />
    </IconButton>
  );
};

export const MediaControls: React.FC<MediaControlsProps> & {
  Leave: typeof LeaveButton;
} = ({
  stream,
  className,
  children,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled,
  isVideoEnabled,
}) => {
  const { t } = useTranslation();

  const hasAudio = stream !== null && stream.getAudioTracks().length > 0;
  const hasVideo = stream !== null && stream.getVideoTracks().length > 0;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <IconButton
        onClick={onToggleAudio}
        disabled={!hasAudio}
        aria-label={t('meeting.controls.toggleMic')}
        title={t('meeting.controls.toggleMic')}
        className={cn(
          'h-12 w-12 transition-colors',
          isAudioEnabled
            ? 'bg-gray-600/80 text-white hover:bg-gray-500/80'
            : 'bg-red-500 text-white hover:bg-red-600',
          !hasAudio && 'opacity-40 cursor-not-allowed',
        )}
      >
        <MicOffIcon className="w-5 h-5" />
      </IconButton>

      <IconButton
        onClick={onToggleVideo}
        disabled={!hasVideo}
        aria-label={t('meeting.controls.toggleCamera')}
        title={t('meeting.controls.toggleCamera')}
        className={cn(
          'h-12 w-12 transition-colors',
          isVideoEnabled
            ? 'bg-gray-600/80 text-white hover:bg-gray-500/80'
            : 'bg-red-500 text-white hover:bg-red-600',
          !hasVideo && 'opacity-40 cursor-not-allowed',
        )}
      >
        <VideocamIcon className="w-5 h-5" />
      </IconButton>

      {children}
    </div>
  );
};

MediaControls.Leave = LeaveButton;
