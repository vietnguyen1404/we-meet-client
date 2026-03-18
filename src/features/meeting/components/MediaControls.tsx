import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared';
import { IconButton } from '@/components/ui';
import MicOffIcon from '@/assets/icons/mic-off.svg?react';
import VideocamIcon from '@/assets/icons/videocam.svg?react';
import LeaveIcon from '@/assets/icons/leave.svg?react';

interface MediaControlsProps {
  stream: MediaStream | null;
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
} = ({ stream, className, children }) => {
  const { t } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const toggleMic = () => {
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !isMuted;
    setIsMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !isCameraOff;
    setIsCameraOff((prev) => !prev);
  };

  const hasAudio = stream !== null && stream.getAudioTracks().length > 0;
  const hasVideo = stream !== null && stream.getVideoTracks().length > 0;

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <IconButton
        onClick={toggleMic}
        disabled={!hasAudio}
        aria-label={t('meeting.controls.toggleMic')}
        title={t('meeting.controls.toggleMic')}
        className={cn(
          'h-12 w-12 transition-colors',
          isMuted
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-600/80 text-white hover:bg-gray-500/80',
          !hasAudio && 'opacity-40 cursor-not-allowed',
        )}
      >
        <MicOffIcon className="w-5 h-5" />
      </IconButton>

      <IconButton
        onClick={toggleCamera}
        disabled={!hasVideo}
        aria-label={t('meeting.controls.toggleCamera')}
        title={t('meeting.controls.toggleCamera')}
        className={cn(
          'h-12 w-12 transition-colors',
          isCameraOff
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-600/80 text-white hover:bg-gray-500/80',
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
