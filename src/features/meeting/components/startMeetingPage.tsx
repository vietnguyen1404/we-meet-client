import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth';
import { Heading, Text, Button, IconButton } from '@/components/ui';
import { Header } from '@/components/layout/Header';
import SpinnerIcon from '@/assets/icons/spinner.svg?react';
import VideoAddIcon from '@/assets/icons/video-add.svg?react';
import SettingsIcon from '@/assets/icons/settings.svg?react';
import HelpCircleIcon from '@/assets/icons/help-circle.svg?react';
import AccountCircleIcon from '@/assets/icons/account-circle.svg?react';
import KeyboardIcon from '@/assets/icons/keyboard.svg?react';
import ErrorCircleIcon from '@/assets/icons/error-circle.svg?react';
import FaceIcon from '@/assets/icons/face.svg?react';
import FaceWomanIcon from '@/assets/icons/face-woman.svg?react';
import FaceHappyIcon from '@/assets/icons/face-happy.svg?react';
import MicOffIcon from '@/assets/icons/mic-off.svg?react';
import ShieldCheckIcon from '@/assets/icons/shield-check.svg?react';
import { meetingsApi } from '../services/meetingService';
import type { ApiError } from '../types/meeting.types';

// Hoisted static JSX — avoids re-creation on every render (rendering-hoist-jsx)
const backgroundDecoration = (
  <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
    <div className="absolute -top-[10%] -left-[10%] w-1/2 h-1/2 bg-primary/5 blur-[150px] rounded-full" />
    <div className="absolute -bottom-[10%] -right-[10%] w-2/5 h-2/5 bg-blue-500/5 blur-[150px] rounded-full" />
  </div>
);

export const StartMeetingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [meetingId, setMeetingId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleCreateMeeting = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const meeting = await meetingsApi.createMeeting({});
      navigate(`/meetings/${meeting.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      setCreateError(apiError.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = meetingId.trim();
    if (!trimmedId) {
      setJoinError(t('meeting.join.errorRequired'));
      return;
    }
    if (isJoining) return;
    setIsJoining(true);
    setJoinError(null);
    try {
      await meetingsApi.joinMeeting(trimmedId);
      navigate(`/meetings/${trimmedId}`);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMsg =
        {
          404: t('meeting.join.errorNotFound'),
          409: t('meeting.join.errorAlreadyJoined'),
          401: t('meeting.join.errorAuth'),
        }[apiError.statusCode] || apiError.message;

      setJoinError(errorMsg);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const hasJoinError = !!joinError;

  return (
    <div className="bg-[#f6f6f8] min-h-screen flex flex-col overflow-hidden relative">
      {backgroundDecoration}

      <Header
        variant="transparent"
        actions={
          <>
            <IconButton
              className="text-slate-600 hover:bg-slate-200"
              aria-label={t('meeting.start.settings')}
            >
              <SettingsIcon className="w-6 h-6" />
            </IconButton>
            <IconButton
              className="text-slate-600 hover:bg-slate-200"
              aria-label={t('meeting.start.help')}
            >
              <HelpCircleIcon className="w-6 h-6" />
            </IconButton>
            <IconButton
              onClick={handleLogout}
              className="bg-primary/10 text-primary hover:bg-primary/20 ml-2"
              aria-label={t('meeting.start.logout')}
              title={`${user?.name} — ${t('meeting.start.logout')}`}
            >
              <AccountCircleIcon className="w-6 h-6" />
            </IconButton>
          </>
        }
      />

      <main className="flex-1 flex flex-col justify-center items-center px-6 pt-32 md:pt-40 relative">
        <div className="max-w-[80%] w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 md:pr-8 text-center md:text-left">
            <div className="space-y-4">
              <Heading
                level={1}
                className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900"
              >
                {t('meeting.start.heroTitle')}
              </Heading>
              <Text className="text-lg text-slate-500 leading-relaxed max-w-md mx-auto md:mx-0">
                {t('meeting.start.heroSubtitle')}
              </Text>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 w-full md:w-auto">
              <Button
                onClick={handleCreateMeeting}
                disabled={isCreating}
                size="lg"
                className="shadow-lg shadow-primary/20 w-full sm:w-auto h-12.5"
              >
                {isCreating ? (
                  <SpinnerIcon className="animate-spin w-5 h-5 shrink-0" />
                ) : (
                  <VideoAddIcon className="w-5 h-5 shrink-0" />
                )}
                {isCreating ? t('meeting.create.buttonCreating') : t('meeting.start.newMeeting')}
              </Button>

              <form onSubmit={handleJoinMeeting} className="flex flex-col w-full sm:w-auto">
                <div className="relative w-full sm:w-64 flex items-center">
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors ${hasJoinError ? 'text-red-500' : 'text-slate-400'}`}
                  >
                    <KeyboardIcon className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    value={meetingId}
                    onChange={(e) => {
                      setMeetingId(e.target.value);
                      setJoinError(null);
                    }}
                    placeholder={t('meeting.join.codePlaceholder')}
                    disabled={isJoining}
                    className={`w-full pl-10 pr-16 py-3 h-12.5 rounded-lg border transition-all outline-none text-slate-700 placeholder:text-slate-500 ${
                      hasJoinError
                        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                        : 'border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    } disabled:opacity-50`}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={isJoining || !meetingId.trim()}
                    className="absolute right-2 text-slate-400 hover:text-primary font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-full flex items-center"
                  >
                    {isJoining ? (
                      <SpinnerIcon className="animate-spin w-4 h-4" />
                    ) : (
                      t('meeting.start.joinBtn')
                    )}
                  </button>
                </div>
                {joinError && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-500">
                    <ErrorCircleIcon className="w-4 h-4 shrink-0" />
                    <Text as="span" className="text-xs font-medium">
                      {joinError}
                    </Text>
                  </div>
                )}
              </form>
            </div>

            {createError && (
              <div className="flex items-center gap-1.5 text-red-500">
                <ErrorCircleIcon className="w-4 h-4 shrink-0" />
                <Text as="span" className="text-sm font-medium">
                  {createError}
                </Text>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 w-full max-w-md mx-auto md:mx-0">
              <Text className="text-sm text-slate-500">
                <button type="button" className="text-primary hover:underline">
                  {t('meeting.start.learnMore')}
                </button>{' '}
              </Text>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />

              <div className="relative z-10 grid grid-cols-2 gap-4 p-4 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative">
                  <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-orange-400 border-2 border-white" />
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FaceIcon className="w-10 h-10" />
                  </div>
                </div>

                <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative">
                  <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-blue-400 border-2 border-white" />
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FaceWomanIcon className="w-10 h-10" />
                  </div>
                </div>

                <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden relative">
                  <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-green-400 border-2 border-white" />
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FaceHappyIcon className="w-10 h-10" />
                  </div>
                </div>

                <div className="aspect-video bg-primary/10 rounded-lg flex items-center justify-center flex-col gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <MicOffIcon className="w-5 h-5" />
                  </div>
                  <Text as="span" className="text-xs font-semibold text-primary">
                    {t('meeting.start.youLabel')}
                  </Text>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 z-20">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <Text className="text-xs text-slate-500 font-medium">
                    {t('meeting.start.connectionLabel')}
                  </Text>
                  <Text className="text-sm font-bold text-slate-800">
                    {t('meeting.start.e2eLabel')}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 px-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <Text className="text-sm text-slate-500">{t('meeting.start.copyright')}</Text>
          <div className="flex gap-6">
            <button type="button" className="hover:text-slate-800 transition-colors">
              {t('meeting.start.footerPrivacy')}
            </button>
            <button type="button" className="hover:text-slate-800 transition-colors">
              {t('meeting.start.footerTerms')}
            </button>
            <button type="button" className="hover:text-slate-800 transition-colors">
              {t('meeting.start.footerSecurity')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
