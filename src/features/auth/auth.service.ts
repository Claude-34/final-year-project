import { appConfig } from '@/config/app.config';
import { apiFetch } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/services/storage/secure-storage';
import { isValidEmail, minLength } from '@/utils/validators';

import type { AuthSession, LoginPayload, RegisterPayload } from './auth.types';

const TOKEN_KEY = 'token';
const USER_KEY = 'auth_user_json';

export async function loginWithPassword(payload: LoginPayload): Promise<AuthSession> {
  if (!isValidEmail(payload.email)) throw new Error('Invalid email');
  if (!minLength(payload.password, 6)) throw new Error('Password too short');

  if (!appConfig.apiBaseUrl) {
    const session: AuthSession = {
      token: 'demo-token',
      user: {
        id: 'u_demo',
        name: 'Demo User',
        email: payload.email,
        role: 'citizen',
      },
    };
    await persistSession(session);
    return session;
  }

  const session = (await apiFetch(endpoints.authLogin, { method: 'POST', body: payload })) as AuthSession;
  await persistSession(session);
  return session;
}

export async function registerAccount(payload: RegisterPayload): Promise<AuthSession> {
  if (!minLength(payload.name, 2)) throw new Error('Name too short');
  if (!isValidEmail(payload.email)) throw new Error('Invalid email');
  if (!minLength(payload.password, 6)) throw new Error('Password too short');

  if (!appConfig.apiBaseUrl) {
    const session: AuthSession = {
      token: 'demo-token',
      user: {
        id: 'u_demo',
        name: payload.name,
        email: payload.email,
        role: 'citizen',
      },
    };
    await persistSession(session);
    return session;
  }

  const session = (await apiFetch(endpoints.authRegister, { method: 'POST', body: payload })) as AuthSession;
  await persistSession(session);
  return session;
}

export async function requestPasswordReset(email: string) {
  if (!isValidEmail(email)) throw new Error('Invalid email');
  if (!appConfig.apiBaseUrl) return { ok: true as const };
  await apiFetch(endpoints.authForgotPassword, { method: 'POST', body: { email } });
  return { ok: true as const };
}

export async function loadPersistedSession(): Promise<AuthSession | null> {
  const token = await getSecureItem(TOKEN_KEY);
  const userJson = await getSecureItem(USER_KEY);
  if (!token || !userJson) return null;

  try {
    const user = JSON.parse(userJson) as AuthSession['user'];
    return { token, user };
  } catch {
    return null;
  }
}

export async function clearPersistedSession() {
  await deleteSecureItem(TOKEN_KEY);
  await deleteSecureItem(USER_KEY);
}

async function persistSession(session: AuthSession) {
  await setSecureItem(TOKEN_KEY, session.token);
  await setSecureItem(USER_KEY, JSON.stringify(session.user));
}
