'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser, LoginRequest } from '@/types';
import {
  login as loginService,
  logout as logoutService,
  logoutAll as logoutAllService,
  getStoredAuth,
  clearStoredAuth,
  refreshTokens,
  isTokenExpired,
  shouldRefreshToken,
} from '@/services/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = getStoredAuth();

      if (!storedAuth) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired()) {
        try {
          const response = await refreshTokens(storedAuth.refreshToken);
          setUser(response.user);
        } catch {
          clearStoredAuth();
        }
      } else {
        setUser(storedAuth.user);

        if (shouldRefreshToken()) {
          try {
            const response = await refreshTokens(storedAuth.refreshToken);
            setUser(response.user);
          } catch {}
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      if (shouldRefreshToken()) {
        const storedAuth = getStoredAuth();
        if (storedAuth) {
          try {
            const response = await refreshTokens(storedAuth.refreshToken);
            setUser(response.user);
          } catch {
            clearStoredAuth();
            setUser(null);
            router.push('/login');
          }
        }
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [user, router]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const response = await loginService(data);
      setUser(response.user);
      router.push('/');
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } finally {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const logoutAll = useCallback(async () => {
    try {
      await logoutAllService();
    } finally {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
