import { useState, useEffect, useRef } from 'react';
import type { UseLocalMediaReturn } from '../types/meeting.types';

const MEDIA_ERROR_KEYS = {
  PERMISSION_DENIED: 'meeting.lobby.mediaPermissionDenied',
  DEVICE_NOT_FOUND: 'meeting.lobby.mediaDeviceNotFound',
  GENERIC: 'meeting.lobby.mediaError',
} as const;

function resolveMediaErrorKey(err: unknown): string {
  if (err instanceof Error) {
    const name = err.name;
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return MEDIA_ERROR_KEYS.PERMISSION_DENIED;
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return MEDIA_ERROR_KEYS.DEVICE_NOT_FOUND;
    }
    console.warn('[useLocalMedia] Unrecognised getUserMedia error:', name, err);
  }
  return MEDIA_ERROR_KEYS.GENERIC;
}

export const useLocalMedia = (): UseLocalMediaReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const acquire = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (isMountedRef.current) {
          setError(MEDIA_ERROR_KEYS.GENERIC);
          setIsLoading(false);
        }
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMountedRef.current) {
          // Component unmounted before promise resolved — stop tracks immediately
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;

        setStream(mediaStream);
        setIsLoading(false);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(resolveMediaErrorKey(err));
        setIsLoading(false);
      }
    };

    void acquire();

    return () => {
      isMountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  return { stream, isLoading, error };
};
