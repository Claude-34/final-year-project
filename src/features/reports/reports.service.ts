import { appConfig } from '@/config/app.config';
import { apiFetch, ApiError } from '@/services/api/client';
import { endpoints, reportByIdPath } from '@/services/api/endpoints';
import { enqueueOfflineOp } from '@/services/storage/offline-queue';
import { getJson, setJson } from '@/services/storage/async-storage';
import { useAuthStore } from '@/store/auth.store';

import type { CreateReportResponse } from './reports.types';

import type { PotholeReport } from '@/types/pothole';

const LOCAL_REPORTS_KEY = 'local_reports_v1';

export async function listLocalReports(): Promise<PotholeReport[]> {
  return (await getJson<PotholeReport[]>(LOCAL_REPORTS_KEY)) ?? [];
}

/**
 * When the API is configured and the user is signed in, loads remote reports and refreshes the local cache.
 * Otherwise returns locally stored reports (offline / demo).
 */
export async function listReports(): Promise<PotholeReport[]> {
  if (!appConfig.apiBaseUrl || !useAuthStore.getState().token) {
    return listLocalReports();
  }
  try {
    const remote = (await apiFetch(endpoints.reports, { method: 'GET' })) as PotholeReport[];
    await setJson(LOCAL_REPORTS_KEY, remote);
    return remote;
  } catch {
    return listLocalReports();
  }
}

export async function getReportById(id: string): Promise<PotholeReport | null> {
  if (!appConfig.apiBaseUrl || !useAuthStore.getState().token) {
    const list = await listLocalReports();
    return list.find((r) => r.id === id) ?? null;
  }
  try {
    const report = (await apiFetch(reportByIdPath(id), { method: 'GET' })) as PotholeReport;
    await mergeReportIntoLocalCache(report);
    return report;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    const list = await listLocalReports();
    return list.find((r) => r.id === id) ?? null;
  }
}

async function mergeReportIntoLocalCache(report: PotholeReport) {
  const existing = await listLocalReports();
  const next = [report, ...existing.filter((r) => r.id !== report.id)];
  await setJson(LOCAL_REPORTS_KEY, next);
}

export async function createReport(report: PotholeReport): Promise<CreateReportResponse> {
  if (!appConfig.apiBaseUrl) {
    const existing = await listLocalReports();
    const next = [report, ...existing];
    await setJson(LOCAL_REPORTS_KEY, next);
    return { id: report.id };
  }

  try {
    const res = (await apiFetch(endpoints.reports, { method: 'POST', body: report })) as CreateReportResponse;
    await mergeReportIntoLocalCache(report);
    return res;
  } catch (e) {
    if (e instanceof ApiError && e.status !== 0) {
      throw e;
    }

    await enqueueOfflineOp({ type: 'CREATE_REPORT', payload: report });
    return { id: report.id };
  }
}
