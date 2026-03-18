import { useRef, useEffect } from 'react';
import { cn } from '@/shared';
import MicOffIcon from '@/assets/icons/mic-off.svg?react';
import type { VideoTile } from '../types/meeting.types';
import { ParticipantAvatar } from './ParticipantAvatar';

interface TileProps {
  tile: VideoTile;
  /** When true the tile is the only one — it fills the entire container. */
  solo?: boolean;
}

const Tile = ({ tile, solo = false }: TileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = tile.stream;
  }, [tile.stream]);

  const wrapperClass = cn(
    'relative overflow-hidden rounded-xl bg-gray-800',
    solo && 'w-full h-full',
  );

  if (tile.isCameraOff || !tile.stream) {
    return (
      <ParticipantAvatar displayName={tile.label} isMuted={tile.isMuted} className={wrapperClass} />
    );
  }

  return (
    <div className={wrapperClass}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={tile.isLocal}
        className={cn('w-full h-full object-cover', tile.isLocal && 'scale-x-[-1]')}
      />

      <span className="absolute bottom-3 left-3 text-xs text-white/90 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md">
        {tile.label}
      </span>

      {tile.isMuted && (
        <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-1">
          <MicOffIcon className="w-4 h-4 text-red-400" />
        </span>
      )}
    </div>
  );
};

interface VideoGridProps {
  tiles: VideoTile[];
}

const getOptimalGrid = (count: number) => {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return { cols, rows };
};

export const VideoGrid = ({ tiles }: VideoGridProps) => {
  const { cols, rows } = getOptimalGrid(tiles.length);

  return (
    <div
      className="grid w-full h-full p-2 gap-2 bg-black"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {tiles.map((tile) => (
        <div key={tile.peerId} className="flex items-center justify-center">
          <div className="w-full aspect-video max-h-full bg-gray-900 rounded-xl overflow-hidden">
            <Tile tile={tile} />
          </div>
        </div>
      ))}
    </div>
  );
};
