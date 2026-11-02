import { appConfig } from '@/config/app.config';

import { getAuthHeader } from './interceptor';

const NETWORK_HINT =
  'Use your computer LAN IP on a real phone (not localhost). Android emulator: http://10.0.2.2:3000. Start the API (e.g. npm run api). Restart Expo after changing .env.';

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type JsonInit = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiFetch(path: string, init: JsonInit = {}) {
  if (!appConfig.apiBaseUrl) {
    // Scaffold default: keep the app runnable without a backend.
    throw new ApiError('API base URL is not configured (src/config/app.config.ts)', 0);
  }

  // const url = `${appConfig.apiBaseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
  const url = `http://192.168.1.146:5000${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
    ...getAuthHeader(),
  };

  let body: BodyInit | undefined = init.body as BodyInit | undefined;
  if (init.body && typeof init.body === 'object' && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(init.body);
  }

  let res: Response;
  try {
    console.log(url)
    res = await fetch(url, { ...init, headers, body });
  } catch (e) {
    const cause = e instanceof Error ? e.message : 'Network error';
    throw new ApiError(`${cause}. ${NETWORK_HINT}`, 0);
  }

  const contentType = res.headers.get('content-type') ?? '';
  const parsed = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message =
      typeof parsed === 'object' && parsed && 'message' in parsed ? String((parsed as any).message) : res.statusText;
    throw new ApiError(message || 'Request failed', res.status, parsed);
  }

  return parsed;
}
