import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-[#6764f2] to-[#8b88ff] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
                  fill="white"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">VideoMeet</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Dashboard</h2>
          <p className="text-gray-600 mb-6">
            You are now authenticated and can access protected content.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">User Information</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium text-blue-900">ID:</dt>
                <dd className="text-blue-700">{user?.id}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-blue-900">Name:</dt>
                <dd className="text-blue-700">{user?.name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-blue-900">Email:</dt>
                <dd className="text-blue-700">{user?.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
};
