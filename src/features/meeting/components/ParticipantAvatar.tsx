import { cn } from '@/shared';
import MicOffIcon from '@/assets/icons/mic-off.svg?react';
import { getAvatarColor } from '@/shared/utils/avatar';
import { UserAvatar } from '@/components/ui';

export interface ParticipantAvatarProps {
  displayName: string;
  avatarUrl?: string | null;
  isMuted?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

const PARTICIPANT_TILE_BG =
  'bg-[radial-gradient(circle_at_center,_#6b5a2b_0%,_#4a4023_35%,_#2b2a1f_70%,_#171717_100%)]';

export const ParticipantAvatar = ({
  displayName,
  avatarUrl,
  isMuted = false,
  className,
}: ParticipantAvatarProps) => {
  const avatarColor = getAvatarColor(displayName);
  const background = PARTICIPANT_TILE_BG;
  const showImage = !!avatarUrl;

  return (
    <div
      className={cn(
        'relative flex items-center flex-1 justify-center w-full overflow-hidden',
        'bg-linear-to-br',
        background,
        className,
      )}
      aria-label={`Participant ${displayName}`}
      title={displayName}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold text-white overflow-hidden',
          'w-16 h-16 text-xl',
          !showImage && avatarColor,
        )}
      >
        <UserAvatar name={displayName} avatarUrl={avatarUrl} size="lg" className="w-full h-full" />
      </div>

      <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 text-white px-2 py-1 rounded-md max-w-[70%]">
        <span className="text-xs truncate">{displayName}</span>
        {isMuted && <MicOffIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />}
      </div>
    </div>
  );
};
