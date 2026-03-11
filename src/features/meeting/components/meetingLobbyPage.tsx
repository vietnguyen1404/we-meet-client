import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';
import { MEETING_ROLE } from '@/shared';
import { Heading, Text, Button } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import AlertTriangleIcon from '@/assets/icons/alert-triangle.svg?react';
import CopyIcon from '@/assets/icons/copy.svg?react';
import SpinnerIcon from '@/assets/icons/spinner.svg?react';
import { meetingsApi } from '../services/meetingService';
import { useMeetingSocket, useParticipants } from '../hooks';
import { SOCKET_STATUS } from '../types/meeting.types';
import type { MeetingLobbyData, ApiError } from '../types/meeting.types';
import { ParticipantList } from './ParticipantList';

export const MeetingLobbyPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Use primitive userId as effect dependency to avoid re-fetching on object reference changes (rerender-dependencies)
  const userId = user?.id;

  const {
    isConnected,
    connectionStatus,
    error: socketError,
    socket,
    isReconnecting,
  } = useMeetingSocket(id);

  const [lobbyData, setLobbyData] = useState<MeetingLobbyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { participants, participantCount } = useParticipants(socket, id);

  const fetchMeetingData = useCallback(async () => {
    if (!id || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const meeting = await meetingsApi.getMeeting(id);

      const currentMember = meeting.members.find((member) => member.userId === userId);
      const currentUserRole = currentMember?.role || MEETING_ROLE.PARTICIPANT;
      const isHost = meeting.hostId === userId;

      setLobbyData({
        meeting,
        currentUserRole,
        isHost,
      });
    } catch (err) {
      const apiError = err as ApiError;
      const statusMessageMap: Record<number, string> = {
        404: t('meeting.lobby.errorNotFound'),
        401: t('meeting.lobby.errorUnauthorized'),
        403: t('meeting.lobby.errorUnauthorized'),
      };

      const errorMsg =
        statusMessageMap[apiError.statusCode] ??
        apiError.message ??
        t('meeting.lobby.errorDefault');

      setError(errorMsg);
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

  const copyMeetingId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    // TODO: Show tooltip or toast notification on successful copy
  };

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

  if (error || !lobbyData) {
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
            <Text className="text-gray-600 mb-6">{error || t('meeting.lobby.errorDefault')}</Text>
            <Button onClick={() => navigate('/meetings/start')}>
              {t('meeting.lobby.buttonBack')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { meeting, currentUserRole, isHost } = lobbyData;

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
        {isReconnecting && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <SpinnerIcon className="animate-spin h-5 w-5 shrink-0 text-blue-600" />
            <Text className="text-sm text-blue-800">{t('meeting.lobby.socketReconnecting')}</Text>
          </div>
        )}
        {connectionStatus === SOCKET_STATUS.ERROR && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3">
            <AlertTriangleIcon className="h-5 w-5 shrink-0 text-yellow-600" />
            <Text className="text-sm text-yellow-800">
              {socketError || t('meeting.lobby.socketError')}
            </Text>
          </div>
        )}
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
                    {currentUserRole === MEETING_ROLE.HOST
                      ? t('meeting.role.host')
                      : t('meeting.role.participant')}
                  </Text>
                </div>
                <div className="flex items-center justify-between">
                  <Text as="span" className="text-sm text-gray-600">
                    {t('meeting.lobby.labelStatus')}
                  </Text>
                  <Text
                    as="span"
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                  >
                    {t(`meeting.status.${meeting.status ?? 'active'}`)}
                  </Text>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <Heading level={2} className="text-lg font-semibold text-gray-900 mb-4">
                {t('meeting.lobby.comingSoonTitle')}
              </Heading>
              <Text className="text-gray-600">{t('meeting.lobby.comingSoonText')}</Text>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <Heading level={2} className="text-lg font-semibold text-gray-900 mb-4">
                {t('meeting.lobby.participantsTitle')}
                {isConnected ? ` (${participantCount})` : ''}
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
};
