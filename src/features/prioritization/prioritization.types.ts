import type { PotholeReport } from '@/types/pothole';

/** Normalized 0–1 inputs used in the weighted priority formula. */
export interface PrioritizationBreakdown {
  severity: number;
  traffic: number;
  roadType: number;
  accidentRisk: number;
  proximitySensitive: number;
  reportCluster: number;
  weather: number;
}

export interface PrioritizationContext {
  breakdown: PrioritizationBreakdown;
}

export interface ScoredPotholeReport extends PotholeReport {
  priorityScore: number;
  context: PrioritizationContext;
}
