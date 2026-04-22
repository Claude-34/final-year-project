import type { PotholeReport, TrafficDensity } from '@/types/pothole';

import { clamp } from '@/utils/helpers';

export type PredictiveContext = {
  /** 0–1 normalized rainfall / wet-season index (stub until weather API). */
  rainfallIndex: number;
  trafficDensity: TrafficDensity;
  roadAgeYears: number;
  /** Prior potholes on same corridor in last 12 months (stub count). */
  priorPotholeCount: number;
};

/**
 * Demo horizon until new damage is likely — **not** a real forecast.
 * Wire rainfall, pavement age, and history from your data pipeline.
 */
export function estimateWeeksUntilLikelyDamage(ctx: PredictiveContext): number {
  const wet = ctx.rainfallIndex * 4;
  const age = clamp(ctx.roadAgeYears / 25, 0, 1) * 5;
  const history = clamp(Math.log1p(ctx.priorPotholeCount) / Math.log1p(10), 0, 1) * 4;
  const traffic =
    ctx.trafficDensity === 'high' ? 3 : ctx.trafficDensity === 'medium' ? 2 : 1;
  const raw = 10 - wet - age - history + traffic * 0.4;
  return Math.round(clamp(raw, 1, 20));
}

export function roadQualityScoreFromReports(reports: PotholeReport[]): number {
  if (reports.length === 0) return 72;
  const avgSev = reports.reduce((a, r) => a + sevNum(r.severity), 0) / reports.length;
  const cluster = reports.reduce((a, r) => a + (r.reportCountNearby ?? 1), 0) / reports.length;
  const base = 100 - avgSev * 28 - clamp(cluster / 6, 0, 1) * 22;
  return Math.round(clamp(base, 8, 96));
}

function sevNum(s: PotholeReport['severity']) {
  if (s === 'low') return 1;
  if (s === 'medium') return 2;
  return 3;
}

