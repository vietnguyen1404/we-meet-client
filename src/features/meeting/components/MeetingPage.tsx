import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';
import { Heading, Text, Button } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import SpinnerIcon from '@/assets/icons/spinner.svg?react';
import AlertTriangleIcon from '@/assets/icons/alert-triangle.svg?react';
import CopyIcon from '@/assets/icons/copy.svg?react';
import {
  useLocalMedia,
  useMeetingSocket,
  useParticipants,
  useParticipantToasts,
  usePeerConnections,
  useSignaling,
  useRemoteStreams,
} from '../hooks';
import { showToast } from '@/shared/utils/toast';
import { meetingsApi } from '../services/meetingService';
import { SOCKET_STATUS } from '../types/meeting.types';
import type { Meeting, ApiError, VideoTile } from '../types/meeting.types';
import { VideoGrid } from './VideoGrid';
import { MediaControls } from './MediaControls';
import { LocalVideoPreview } from './LocalVideoPreview';
import { ParticipantList } from './ParticipantList';
import { MeetingPhase, MeetingPhaseFlags } from '@/shared/constants/meeting';

const MeetingPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [phase, setPhase] = useState<MeetingPhase>(MeetingPhase.PRE_JOIN);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMeetingData = useCallback(async () => {
    if (!id || !userId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await meetingsApi.getMeeting(id);
      setMeeting(data);
    } catch (err) {
      const apiError = err as ApiError;
      const statusMessageMap: Record<number, string> = {
        404: t('meeting.lobby.errorNotFound'),
        401: t('meeting.lobby.errorUnauthorized'),
        403: t('meeting.lobby.errorUnauthorized'),
      };
      setFetchError(
        statusMessageMap[apiError.statusCode] ??
          apiError.message ??
          t('meeting.lobby.errorDefault'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, userId, t]);

  useEffect(() => {
    if (!id) {
      navigate('/meetings/start', { replace: true });
      return;
    }
    fetchMeetingData();
  }, [id, navigate, fetchMeetingData]);

  const {
    stream: localStream,
    isLoading: isMediaLoading,
    error: mediaError,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    videoSendersRef,
    audioSendersRef,
  } = useLocalMedia();

  const isVideoEnabledRef = useRef(isVideoEnabled);
  const isAudioEnabledRef = useRef(isAudioEnabled);
  useEffect(() => {
    isVideoEnabledRef.current = isVideoEnabled;
  }, [isVideoEnabled]);
  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  const {
    socket,
    connect,
    joinRoom,
    leaveRoom,
    watchMeeting,
    isConnected,
    connectionStatus,
    error: socketError,
    isReconnecting,
  } = useMeetingSocket(id);

  const { participants, participantCount } = useParticipants(socket, id);

  const { createPeerConnection, closePeerConnection, getPeerConnection, peerStatuses } =
    usePeerConnections(localStream, videoSendersRef, audioSendersRef);

  const { remoteStreams, addStream } = useRemoteStreams(getPeerConnection, peerStatuses);

  const { negotiationErrors } = useSignaling(
    socket,
    id,
    createPeerConnection,
    closePeerConnection,
    getPeerConnection,
    addStream,
  );

  useParticipantToasts(socket, phase, userId);

  // pendingJoin is set to true by handleJoin and consumed by the effect below.
  // This decouples joinRoom() from the connect() call, ensuring useSignaling's
  // socket.on('offer'/'answer'/...) listeners are registered BEFORE we emit
  // join-room and the server starts relaying WebRTC signaling messages.
  const [pendingJoin, setPendingJoin] = useState(false);

  useEffect(() => {
    if (!pendingJoin || !socket) return;
    if (!socket.connected) {
      return;
    }
    setPendingJoin(false);
    joinRoom();
    // Do NOT emit participant-media-state here — it races the server’s async
    // join-room handler. The participants-confirm effect below emits it once
    // the server confirms our join via participants-list.
  }, [pendingJoin, socket, joinRoom]);

  // Centralised emit helper. Guards against:
  //   socket being null / disconnected (prevents silent drops)
  //   emitting before the user has formally joined the room (lobby phase)
  const safeEmitMediaState = useCallback(
    (video: boolean, audio: boolean) => {
      if (!socket?.connected) return;
      if (!MeetingPhaseFlags.isInCall(phase)) {
        // Socket is connected via watch-meeting in the lobby but the user
        // hasn’t joined the room yet — the server would reject the event.
        return;
      }
      const payload = { meetingId: id, video, audio };
      socket.emit('participant-media-state', payload);
    },
    [socket, phase, id],
  );

  // Reset flag when the socket disconnects so the initial emit fires again
  // after reconnect (server resets media defaults when the socket rejoins).
  const hasEmittedInitialMediaStateRef = useRef(false);
  useEffect(() => {
    if (!isConnected) {
      hasEmittedInitialMediaStateRef.current = false;
    }
  }, [isConnected]);

  // Emit our initial media state once the server confirms we are in the room,
  // detected by seeing our own userId appear in participants-list.
  // This serialises the emit AFTER the server’s async join-room handler,
  // eliminating the race where participant-media-state arrives before the
  // socket has been added to the room. Also handles post-reconnect rejoin.
  useEffect(() => {
    if (!MeetingPhaseFlags.isInCall(phase)) return;
    if (hasEmittedInitialMediaStateRef.current) return;
    if (!socket?.connected) return;
    if (!userId) return;

    const selfInRoom = participants.some((p) => p.userId === userId);
    if (!selfInRoom) return;

    hasEmittedInitialMediaStateRef.current = true;
    const payload = {
      meetingId: id,
      video: isVideoEnabledRef.current,
      audio: isAudioEnabledRef.current,
    };

    socket.emit('participant-media-state', payload);
  }, [participants, phase, socket, userId, id]);

  // Toggle handlers: toggle local media then broadcast the new state.
  // Using refs to read current state avoids stale closures in async callbacks.
  const handleToggleVideo = useCallback(async () => {
    const nextVideo = !isVideoEnabledRef.current;
    await toggleVideo();
    // Update ref eagerly so a concurrent handleToggleAudio reads correct value.
    isVideoEnabledRef.current = nextVideo;
    safeEmitMediaState(nextVideo, isAudioEnabledRef.current);
  }, [toggleVideo, safeEmitMediaState]);

  const handleToggleAudio = useCallback(() => {
    const nextAudio = !isAudioEnabledRef.current;
    toggleAudio();
    // Update ref eagerly so a concurrent handleToggleVideo reads correct value.
    isAudioEnabledRef.current = nextAudio;
    safeEmitMediaState(isVideoEnabledRef.current, nextAudio);
  }, [toggleAudio, safeEmitMediaState]);

  // Once meeting metadata is loaded, connect the socket in the background and
  // emit watch-meeting so the lobby shows real-time participant presence
  // without the user having formally joined the call.
  useEffect(() => {
    if (!meeting) return;
    connect()
      .then(() => watchMeeting())
      .catch(() => {
        // Connection error is already surfaced via socketError state — no extra handling needed.
      });
  }, [meeting, connect, watchMeeting]);

  const handleJoin = useCallback(async () => {
    setPhase(MeetingPhase.JOINING);
    try {
      await connect();
      // Do NOT call joinRoom() here — use the pendingJoin effect above so that
      // React re-renders first and useSignaling registers its socket listeners
      // before the server starts sending offer/answer/ice-candidate messages.
      setPendingJoin(true);
      setPhase(MeetingPhase.IN_CALL);
    } catch {
      setPhase(MeetingPhase.PRE_JOIN);
      showToast.error(t('meeting.toast.joinFailed'), 'join-failed');
    }
  }, [connect, t]);

  const handleLeave = useCallback(() => {
    leaveRoom();
    navigate('/meetings/start');
  }, [leaveRoom, navigate]);

  const tiles = useMemo<VideoTile[]>(() => {
    if (!MeetingPhaseFlags.isInCall(phase)) return [];

    const result: VideoTile[] = [
      {
        peerId: 'local',
        stream: localStream,
        label: user?.name ?? t('meeting.start.youLabel'),
        isLocal: true,
        isCameraOff: !isVideoEnabled,
        isMuted: !isAudioEnabled,
      },
    ];

    // Build remote tiles from the participant list so tiles appear immediately
    // when a participant joins, even before their camera stream arrives.
    // isCameraOff/isMuted come from signaling state, NOT stream inspection.
    for (const participant of participants) {
      if (participant.userId === userId) continue;
      const peerId = participant.socketId;
      const stream = remoteStreams.get(peerId) ?? null;
      result.push({
        peerId,
        stream,
        label: participant.name ?? peerId,
        isCameraOff: participant.isVideoEnabled === false,
        isMuted: participant.isAudioEnabled === false,
      });
    }

    return result;
  }, [
    phase,
    localStream,
    remoteStreams,
    participants,
    user?.name,
    t,
    isVideoEnabled,
    isAudioEnabled,
    userId,
  ]);

  const copyMeetingId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    showToast.success(t('meeting.toast.roomIdCopied'), 'copy-room-id');
  };

  // Show toast when media permission is denied or device not found
  const prevMediaErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (mediaError && mediaError !== prevMediaErrorRef.current) {
      showToast.error(mediaError, 'media-error');
    }
    prevMediaErrorRef.current = mediaError;
  }, [mediaError]);

  // Show toast for WebRTC negotiation errors
  const prevNegotiationErrorsRef = useRef<Record<string, string | null>>({});
  useEffect(() => {
    for (const [peerId, message] of Object.entries(negotiationErrors)) {
      if (message && prevNegotiationErrorsRef.current[peerId] !== message) {
        showToast.error(t('meeting.toast.webrtcError'), `webrtc-${peerId}`);
      }
    }
    prevNegotiationErrorsRef.current = negotiationErrors;
  }, [negotiationErrors, t]);

  if (MeetingPhaseFlags.isPreJoin(phase) || MeetingPhaseFlags.isJoining(phase)) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <SpinnerIcon className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <Text className="text-gray-600">{t('meeting.lobby.loadingTitle')}</Text>
          </div>
        </div>
      );
    }

    if (fetchError || !meeting) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <Heading level={2} className="text-xl font-bold text-gray-900 mb-2">
                {t('meeting.lobby.errorTitle')}
              </Heading>
              <Text className="text-gray-600 mb-6">
                {fetchError || t('meeting.lobby.errorDefault')}
              </Text>
              <Button onClick={() => navigate('/meetings/start')}>
                {t('meeting.lobby.buttonBack')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const isHost = meeting.hostId === userId;

    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          actions={
            <Button variant="ghost" onClick={() => navigate('/meetings/start')}>
              {t('meeting.lobby.buttonLeave')}
            </Button>
          }
        >
          <div className="flex-1 mx-6">
            <Heading level={1} className="text-2xl font-bold text-gray-900">
              {meeting.title}
            </Heading>
            <Text className="text-sm text-gray-500 mt-1">
              {t('meeting.lobby.labelMeetingId')}: {id}
            </Text>
          </div>
        </Header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <Heading level={2} className="text-lg font-semibold text-gray-900 mb-4">
                  {t('meeting.lobby.detailsTitle')}
                </Heading>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Text as="span" className="text-sm text-gray-600">
                      {t('meeting.lobby.labelMeetingId')}
                    </Text>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">{id}</code>
                      <button
                        onClick={copyMeetingId}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title={t('meeting.lobby.copyMeetingId')}
                      >
                        <CopyIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text as="span" className="text-sm text-gray-600">
                      {t('meeting.lobby.labelRole')}
                    </Text>
                    <Text
                      as="span"
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isHost ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isHost ? t('meeting.role.host') : t('meeting.role.participant')}
                    </Text>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <LocalVideoPreview
                  stream={localStream}
                  isLoading={isMediaLoading}
                  error={mediaError}
                  isCameraOn={isVideoEnabled}
                  isMicrophoneOn={isAudioEnabled}
                />
                <div className="mt-4 flex justify-center">
                  <MediaControls
                    stream={localStream}
                    onToggleAudio={handleToggleAudio}
                    onToggleVideo={handleToggleVideo}
                    isAudioEnabled={isAudioEnabled}
                    isVideoEnabled={isVideoEnabled}
                  />
                </div>
              </div>

              {socketError && (
                <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
                  <AlertTriangleIcon className="h-5 w-5 shrink-0 text-yellow-600" />
                  <Text className="text-sm text-yellow-800">{socketError}</Text>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleJoin}
                  disabled={MeetingPhaseFlags.isJoining(phase)}
                  size="lg"
                >
                  {MeetingPhaseFlags.isJoining(phase)
                    ? t('meeting.lobby.joiningTitle')
                    : t('meeting.lobby.buttonJoin')}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <Heading level={2} className="text-lg font-semibold text-gray-900 mb-4">
                  {t('meeting.lobby.participantsTitle')}
                </Heading>
                <ParticipantList
                  participants={participants}
                  currentUserId={userId}
                  isSocketConnected={isConnected}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isMediaLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <SpinnerIcon className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <Text className="text-gray-400">{t('meeting.room.loadingTitle')}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-30 flex flex-col items-center gap-2 pt-4 px-4 pointer-events-none">
        {isReconnecting && (
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-lg bg-blue-900/80 backdrop-blur-sm border border-blue-700/60 px-4 py-2">
            <SpinnerIcon className="animate-spin h-4 w-4 shrink-0 text-blue-400" />
            <Text className="text-sm text-blue-200">{t('meeting.lobby.socketReconnecting')}</Text>
          </div>
        )}

        {!isReconnecting && connectionStatus === SOCKET_STATUS.ERROR && (
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-lg bg-yellow-900/80 backdrop-blur-sm border border-yellow-700/60 px-4 py-2">
            <AlertTriangleIcon className="h-4 w-4 shrink-0 text-yellow-400" />
            <Text className="text-sm text-yellow-200">
              {socketError ?? t('meeting.room.errorDefault')}
            </Text>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <VideoGrid tiles={tiles} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center py-5 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-6 rounded-full bg-gray-800/70 backdrop-blur-md px-6 py-3 shadow-lg ring-1 ring-white/10">
          <MediaControls
            stream={localStream}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
          >
            <MediaControls.Leave onLeave={handleLeave} />
          </MediaControls>

          {isConnected && (
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" title="Connected" />
          )}
        </div>
      </div>

      {participantCount > 0 && (
        <div className="absolute top-4 right-4 z-20 bg-gray-800/70 backdrop-blur-sm rounded-lg px-3 py-1.5 ring-1 ring-white/10">
          <Text className="text-xs text-gray-300">
            {participantCount} {t('meeting.lobby.participantsTitle').toLowerCase()}
          </Text>
        </div>
      )}
    </div>
  );
};

export default MeetingPage;
