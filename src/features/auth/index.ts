export { default as LoginPage } from './components/loginPage';
export { default as DashboardPage } from './components/dashboardPage';
export { default as ProtectedRoute } from './components/protectedRoute';

export { AuthProvider } from './context/authContext';
export { useAuth } from './hooks/useAuth';

export { authService } from './services/authService';

export type { User, LoginRequest, LoginResponse, RefreshResponse } from './types/auth.types';
