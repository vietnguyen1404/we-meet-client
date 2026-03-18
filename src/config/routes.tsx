import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage, DashboardPage, ProtectedRoute } from '@/features/auth';
import { StartMeetingPage, MeetingPage } from '@/features/meeting';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/meetings/start" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/meetings/start',
        element: <StartMeetingPage />,
      },
      {
        path: '/meetings/:id',
        element: <MeetingPage />,
      },
    ],
  },
]);
