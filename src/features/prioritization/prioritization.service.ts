import type { PrioritizationContext, ScoredPotholeReport } from '@/features/prioritization/prioritization.types';
import {
  accidentRiskNorm,
  PRIORITY_WEIGHTS,
  proximitySensitiveNorm,
  reportClusterNorm,
  roadTypeNorm,
  severityNorm,
  trafficNorm,
  weatherImpactNorm,
} from '@/features/prioritization/scoring.rules';
import { clamp } from '@/utils/helpers';

import type { PotholeReport } from '@/types/pothole';

function buildBreakdown(report: PotholeReport) {
  return {
    severity: severityNorm(report.severity),
    traffic: trafficNorm(report.trafficDensity),
    roadType: roadTypeNorm(report.roadType),
    accidentRisk: accidentRiskNorm(report),
    proximitySensitive: proximitySensitiveNorm(report),
    reportCluster: reportClusterNorm(report),
    weather: weatherImpactNorm(report),
  };
}

function scoreFromBreakdown(b: PrioritizationContext['breakdown']) {
  return (
    PRIORITY_WEIGHTS.severity * b.severity +
    PRIORITY_WEIGHTS.traffic * b.traffic +
    PRIORITY_WEIGHTS.roadType * b.roadType +
    PRIORITY_WEIGHTS.accidentRisk * b.accidentRisk +
    PRIORITY_WEIGHTS.proximitySensitive * b.proximitySensitive +
    PRIORITY_WEIGHTS.reportCluster * b.reportCluster +
    PRIORITY_WEIGHTS.weather * b.weather
  );
}

export function scorePothole(report: PotholeReport) {
  const breakdown = buildBreakdown(report);
  return clamp(scoreFromBreakdown(breakdown), 0, 1);
}

export function rankPotholes(reports: PotholeReport[]): ScoredPotholeReport[] {
  const scored = reports.map((r) => {
    const breakdown = buildBreakdown(r);
    return {
      ...r,
      priorityScore: clamp(scoreFromBreakdown(breakdown), 0, 1),
      context: { breakdown },
    };
  });

  return scored.sort((a, b) => b.priorityScore - a.priorityScore);
}
