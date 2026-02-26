import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  useRef,
} from 'react';
import { authService } from '../services/authService';
import { setAuthFunctions } from '@/lib/api';
import type { User } from '../types/auth.types';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const didInit = useRef(false);

  const refreshToken = useCallback(async (): Promise<string> => {
    try {
      const response = await authService.refresh();
      setAccessToken(response.accessToken);
      return response.accessToken;
    } catch (error) {
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setAuthFunctions(
      () => accessToken,
      refreshToken,
      () => {
        setAccessToken(null);
        setUser(null);
      },
    );
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const initAuth = async () => {
      try {
        const { accessToken } = await authService.refresh();
        setAccessToken(accessToken);
        const user = await authService.getMe(accessToken);
        setUser(user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { accessToken, user } = await authService.login({ email, password });
      setAccessToken(accessToken);
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      login,
      logout,
      refreshToken,
    }),
    [user, accessToken, isLoading, login, logout, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
