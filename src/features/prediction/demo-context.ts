import type { PredictiveContext } from '@/features/prediction/road-risk';

/** Demo inputs for “predictive maintenance” copy on the dashboard. */
export const demoPredictiveContext: PredictiveContext = {
  rainfallIndex: 0.64,
  trafficDensity: 'high',
  roadAgeYears: 17,
  priorPotholeCount: 6,
};
