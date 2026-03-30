import { useState } from 'react';
import { cn } from '@/shared';
import { getInitialsFromName, getAvatarColor } from '@/shared/utils/avatar';

type AvatarSize = 'sm' | 'md' | 'lg';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const UserAvatar = ({ name, avatarUrl, size = 'md', className }: UserAvatarProps) => {
  const [imgFailed, setImgFailed] = useState(false);

  const showImage = !!avatarUrl && !imgFailed;
  const initials = getInitialsFromName(name);
  const colorClass = getAvatarColor(name);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 overflow-hidden',
        sizeClasses[size],
        !showImage && colorClass,
        className,
      )}
      title={name}
      aria-label={name}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="font-semibold text-white leading-none">{initials}</span>
      )}
    </div>
  );
};
