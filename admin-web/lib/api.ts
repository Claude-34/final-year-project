import { getApiBaseUrl, getToken } from './auth';
import type { AdminStats, AuthSession, PotholeReport } from './types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) throw new ApiError('NEXT_PUBLIC_API_URL is not set', 0);

  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body && typeof init.body === 'string') headers['Content-Type'] = 'application/json';

  const res = await fetch(`${base}${path}`, { ...init, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message ?? res.statusText ?? 'Request failed';
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export async function login(email: string, password: string): Promise<AuthSession> {
  return apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>('/admin/stats');
}

export async function fetchReports(params?: {
  status?: string;
  severity?: string;
  minPriority?: number;
}): Promise<PotholeReport[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.severity) q.set('severity', params.severity);
  if (params?.minPriority != null) q.set('minPriority', String(params.minPriority));
  const suffix = q.toString() ? `?${q}` : '';
  return apiFetch<PotholeReport[]>(`/admin/reports${suffix}`);
}

export async function fetchReport(id: string): Promise<PotholeReport> {
  return apiFetch<PotholeReport>(`/admin/reports/${encodeURIComponent(id)}`);
}

export async function patchReport(
  id: string,
  body: { status?: string; assignedCrew?: string; notes?: string },
): Promise<PotholeReport> {
  return apiFetch<PotholeReport>(`/admin/reports/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
