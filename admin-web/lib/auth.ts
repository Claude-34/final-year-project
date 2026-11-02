import type { AuthSession } from './types';

const TOKEN_KEY = 'pothole_admin_token';
const USER_KEY = 'pothole_admin_user';

export function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL ?? '';
  return url.replace(/\/$/, '');
}

export function saveSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  if (!token || !userJson) return null;
  try {
    return { token, user: JSON.parse(userJson) };
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
