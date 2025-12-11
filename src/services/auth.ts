import { api } from '@/lib/axios';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  AuthUser,
  UserSession,
} from '@/types';

const AUTH_STORAGE_KEY = 'auth';

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

function setAuthCookie(): void {
  document.cookie = 'auth-status=authenticated; path=/; SameSite=Lax';
}

function clearAuthCookie(): void {
  document.cookie =
    'auth-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as StoredAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  setAuthCookie();
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  clearAuthCookie();
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);

  const auth: StoredAuth = {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    expiresAt: Date.now() + response.data.expiresIn * 1000,
    user: response.data.user,
  };

  setStoredAuth(auth);

  return response.data;
}

export async function refreshTokens(
  refreshToken: string
): Promise<LoginResponse> {
  const data: RefreshTokenRequest = { refreshToken };
  const response = await api.post<LoginResponse>('/auth/refresh', data);

  const auth: StoredAuth = {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    expiresAt: Date.now() + response.data.expiresIn * 1000,
    user: response.data.user,
  };

  setStoredAuth(auth);

  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    clearStoredAuth();
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await api.post('/auth/logout-all');
  } finally {
    clearStoredAuth();
  }
}

export async function changePassword(
  data: ChangePasswordRequest
): Promise<void> {
  await api.post('/auth/change-password', data);
  clearStoredAuth();
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get<AuthUser>('/auth/me');
  return response.data;
}

export async function getSessions(): Promise<UserSession[]> {
  const response = await api.get<UserSession[]>('/auth/sessions');
  return response.data;
}

export async function revokeSession(sessionId: number): Promise<void> {
  await api.delete(`/auth/sessions/${sessionId}`);
}

export function shouldRefreshToken(): boolean {
  const auth = getStoredAuth();
  if (!auth) return false;

  const fiveMinutes = 5 * 60 * 1000;
  return auth.expiresAt - Date.now() < fiveMinutes;
}

export function isTokenExpired(): boolean {
  const auth = getStoredAuth();
  if (!auth) return true;

  return Date.now() >= auth.expiresAt;
}
