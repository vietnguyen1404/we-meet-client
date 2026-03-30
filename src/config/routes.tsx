import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/loading/LoadingScreen';

const LoginPage = lazy(() => import('@/features/auth/components/loginPage'));
const OAuthCallbackPage = lazy(() => import('@/features/auth/components/OAuthCallbackPage'));
const DashboardPage = lazy(() => import('@/features/auth/components/dashboardPage'));
const ProtectedRoute = lazy(() => import('@/features/auth/components/protectedRoute'));
const StartMeetingPage = lazy(() => import('@/features/meeting/components/startMeetingPage'));
const MeetingPage = lazy(() => import('@/features/meeting/components/MeetingPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/meetings/start" replace />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <OAuthCallbackPage />
      </Suspense>
    ),
  },
  {
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <ProtectedRoute />
      </Suspense>
    ),
    children: [
      {
        path: '/dashboard',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/meetings/start',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <StartMeetingPage />
          </Suspense>
        ),
      },
      {
        path: '/meetings/:id',
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <MeetingPage />
          </Suspense>
        ),
      },
    ],
  },
]);
