import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Heading, Text, Button, UserAvatar } from '@/components/ui';
import { Header } from '@/components/layout/Header';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        actions={
          <>
            <div className="flex items-center gap-3">
              <UserAvatar name={user?.name ?? ''} avatarUrl={user?.avatar} size="md" />
              <div className="text-right">
                <Text className="text-sm font-medium text-gray-900">{user?.name}</Text>
                <Text className="text-xs text-gray-500">{user?.email}</Text>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              {t('common.logout')}
            </Button>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Heading level={2} className="text-2xl font-bold text-gray-900 mb-4">
            {t('dashboard.welcomeTitle')}
          </Heading>
          <Text className="text-gray-600 mb-6">{t('dashboard.welcomeMessage')}</Text>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Heading level={3} className="text-sm font-semibold text-blue-900 mb-2">
              {t('dashboard.userInfo')}
            </Heading>
            <dl className="space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium text-blue-900">{t('dashboard.labelId')}</dt>
                <dd className="text-blue-700">{user?.id}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-blue-900">{t('dashboard.labelName')}</dt>
                <dd className="text-blue-700">{user?.name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-blue-900">{t('dashboard.labelEmail')}</dt>
                <dd className="text-blue-700">{user?.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
