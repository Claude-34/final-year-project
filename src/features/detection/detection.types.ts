import type { DamageKind, Severity } from '@/types/pothole';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Scene lighting — drives preprocessing branch and confidence calibration (stub). */
export type LightingCondition = 'day' | 'low_light' | 'night';

/** Surface water — water-filled hides true depth → higher effective risk. */
export type SurfaceMoisture = 'dry' | 'water_filled';

/** CV road context — mapped to `RoadType` for prioritization. */
export type DetectedRoadEnvironment = 'highway' | 'urban' | 'rural';

/** Factors the UI can explain to users (mapped to i18n). */
export interface ImageQualityAssessment {
  /** 0–1, higher = sharper (demo — blur variance proxy). */
  blurScore: number;
  /** 0–1, higher = better exposure for CV. */
  lightingScore: number;
  passed: boolean;
  suggestRetake: boolean;
}

export interface DuplicateNearbyInfo {
  reportId: string;
  distanceM: number;
}

export type ExplanationFactor =
  | 'depth'
  | 'width'
  | 'shape'
  | 'confidence'
  | 'traffic_context'
  | 'water_hidden_depth'
  | 'low_light_uncertainty'
  | 'road_environment';

export interface DetectionResult {
  severity: Severity;
  confidence: number;
  boxes: BoundingBox[];
  damageKind?: DamageKind;
  depthEstimateCm?: number;
  widthEstimateM?: number;
  vehicleDamageRisk?: number;
  explanationFactors?: ExplanationFactor[];
  surfaceMoisture?: SurfaceMoisture;
  lightingCondition?: LightingCondition;
  roadEnvironment?: DetectedRoadEnvironment;
  /** Preprocessing branch for UI (`detection.preprocess.*`). */
  preprocessingPipeline?: 'day' | 'low_light';
  /** True when night/low-light branch ran (resize + stronger compression — proxy for contrast prep). */
  lowLightEnhancementApplied?: boolean;
  imageQuality?: ImageQualityAssessment;
  duplicateNearby?: DuplicateNearbyInfo | null;
  /** Monocular depth hint (cm) — demo perspective scaling. */
  perspectiveDepthCm?: number;
  /** Rough void volume (litres) from width + depth cone model (research stub). */
  volumeEstimateLitres?: number;
}
