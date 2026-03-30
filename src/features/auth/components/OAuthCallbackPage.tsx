import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingScreen from '@/components/loading/LoadingScreen';
import { useAuth } from '../hooks/useAuth';

export default function OAuthCallbackPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (errorCode) {
      navigate(`/login?error=${encodeURIComponent(errorCode)}`, { replace: true });
      return;
    }

    if (!isLoading) {
      navigate(isAuthenticated ? '/meetings/start' : '/login?error=auth_failed', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, searchParams]);

  return <LoadingScreen />;
}
