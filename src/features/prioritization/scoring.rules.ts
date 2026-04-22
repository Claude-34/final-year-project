import type { PotholeReport, Severity } from '@/types/pothole';

import { clamp } from '@/utils/helpers';

/** Weights sum to 1 — matches multi-factor municipal-style triage (demo). */
export const PRIORITY_WEIGHTS = {
  severity: 0.26,
  traffic: 0.16,
  roadType: 0.12,
  accidentRisk: 0.12,
  proximitySensitive: 0.14,
  reportCluster: 0.1,
  weather: 0.1,
} as const;

export function severityNorm(severity: Severity) {
  if (severity === 'low') return 0.33;
  if (severity === 'medium') return 0.66;
  return 1;
}

export function roadTypeNorm(roadType: PotholeReport['roadType']) {
  if (roadType === 'highway') return 1;
  if (roadType === 'secondary') return 0.66;
  return 0.33;
}

export function trafficNorm(density: PotholeReport['trafficDensity']) {
  if (density === 'high') return 1;
  if (density === 'medium') return 0.66;
  return 0.33;
}

/** Accident / safety exposure from severity + highway + traffic (stub). */
export function accidentRiskNorm(report: PotholeReport) {
  const s = severityNorm(report.severity);
  const hw = report.roadType === 'highway' ? 0.22 : 0;
  const tr = trafficNorm(report.trafficDensity) * 0.35;
  return clamp(s * 0.45 + hw + tr, 0, 1);
}

/** Schools, hospitals, and similar sensitive land uses. */
export function proximitySensitiveNorm(report: PotholeReport) {
  let v = 0.15;
  if (report.nearSchool) v += 0.5;
  if (report.nearHospital) v += 0.35;
  return clamp(v, 0, 1);
}

export function reportClusterNorm(report: PotholeReport) {
  const n = report.reportCountNearby ?? 1;
  return clamp(Math.log1p(n) / Math.log1p(12), 0, 1);
}

/** Rainfall / freeze-thaw stress — replace with API-derived index. */
export function weatherImpactNorm(_report: PotholeReport) {
  return 0.44;
}
