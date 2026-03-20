import { useState, useEffect, useRef, useCallback } from 'react';
import type { UseLocalMediaReturn } from '../types/meeting.types';
import { useTranslation } from 'react-i18next';

const MEDIA_ERROR_KEYS = {
  PERMISSION_DENIED: 'meeting.lobby.mediaPermissionDenied',
  DEVICE_NOT_FOUND: 'meeting.lobby.mediaDeviceNotFound',
  GENERIC: 'meeting.lobby.mediaError',
} as const;

function resolveMediaErrorKey(err: unknown, t: (key: string) => string): string {
  if (err instanceof Error) {
    const name = err.name;
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return t(MEDIA_ERROR_KEYS.PERMISSION_DENIED);
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return t(MEDIA_ERROR_KEYS.DEVICE_NOT_FOUND);
    }
    console.warn('[useLocalMedia] Unrecognised getUserMedia error:', name, err);
  }
  return t(MEDIA_ERROR_KEYS.GENERIC);
}

export const useLocalMedia = (): UseLocalMediaReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoSendersRef = useRef<Set<RTCRtpSender>>(new Set());
  const audioSendersRef = useRef<Set<RTCRtpSender>>(new Set());
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    const acquire = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(t(MEDIA_ERROR_KEYS.GENERIC));
        setIsLoading(false);
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;

        const videoEnabled = mediaStream.getVideoTracks().some((t) => t.enabled);
        const audioEnabled = mediaStream.getAudioTracks().some((t) => t.enabled);

        setIsVideoEnabled(videoEnabled);
        setIsAudioEnabled(audioEnabled);

        mediaStream.getVideoTracks().forEach((track) => {
          track.onended = () => setIsVideoEnabled(false);
        });
        mediaStream.getAudioTracks().forEach((track) => {
          track.onended = () => setIsAudioEnabled(false);
        });

        setStream(mediaStream);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(resolveMediaErrorKey(err, t));
        setIsLoading(false);
      }
    };

    void acquire();

    return () => {
      cancelled = true;

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [t]);

  const toggleAudio = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    if (!tracks.length) return;

    const next = !tracks[0].enabled;

    tracks.forEach((track) => {
      track.enabled = next;
    });

    setIsAudioEnabled(next);
  }, []);

  const toggleVideo = useCallback(async () => {
    const currentStream = streamRef.current;
    if (!currentStream) return;

    const liveVideoTrack = currentStream
      .getVideoTracks()
      .find((track) => track.readyState === 'live');

    if (liveVideoTrack) {
      // Turn OFF: stop track to release camera hardware (LED turns off)
      liveVideoTrack.stop();

      // Stop sending video to all peers
      const promises: Promise<void>[] = [];
      for (const sender of videoSendersRef.current) {
        promises.push(sender.replaceTrack(null));
      }
      await Promise.all(promises);

      setIsVideoEnabled(false);
    } else {
      // Turn ON: acquire a new video track
      try {
        const newMediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newVideoTrack = newMediaStream.getVideoTracks()[0];

        // Remove ended video tracks from the existing stream
        currentStream.getVideoTracks().forEach((track) => {
          currentStream.removeTrack(track);
        });

        // Add the new live track into the existing MediaStream
        currentStream.addTrack(newVideoTrack);

        // Resume sending video to all peers
        const promises: Promise<void>[] = [];
        for (const sender of videoSendersRef.current) {
          promises.push(sender.replaceTrack(newVideoTrack));
        }
        await Promise.all(promises);

        newVideoTrack.onended = () => setIsVideoEnabled(false);

        setIsVideoEnabled(true);

        // Force React re-render with a new MediaStream reference
        const updated = new MediaStream(currentStream.getTracks());
        streamRef.current = updated;
        setStream(updated);
      } catch (err) {
        setError(resolveMediaErrorKey(err, t));
      }
    }
  }, [t]);

  return {
    stream,
    isLoading,
    error,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    videoSendersRef,
    audioSendersRef,
  };
};
