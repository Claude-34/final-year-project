/**
 * Deterministic stub aligned with the mobile `inference.service.ts` demo logic
 * (same hash → same pseudo-detection for file URIs).
 */

type Severity = 'low' | 'medium' | 'high';
type DamageKind = 'pothole' | 'crack' | 'surface_wear' | 'erosion' | 'flooded_pothole';
type LightingCondition = 'day' | 'low_light' | 'night';
type SurfaceMoisture = 'dry' | 'water_filled';
type DetectedRoadEnvironment = 'highway' | 'urban' | 'rural';

type ExplanationFactor =
  | 'depth'
  | 'width'
  | 'shape'
  | 'confidence'
  | 'traffic_context'
  | 'water_hidden_depth'
  | 'low_light_uncertainty'
  | 'road_environment';

export type DetectionResult = {
  severity: Severity;
  confidence: number;
  boxes: { x: number; y: number; w: number; h: number }[];
  damageKind?: DamageKind;
  depthEstimateCm?: number;
  widthEstimateM?: number;
  vehicleDamageRisk?: number;
  explanationFactors?: ExplanationFactor[];
  surfaceMoisture?: SurfaceMoisture;
  lightingCondition?: LightingCondition;
  roadEnvironment?: DetectedRoadEnvironment;
  preprocessingPipeline?: 'day' | 'low_light';
  lowLightEnhancementApplied?: boolean;
  perspectiveDepthCm?: number;
  volumeEstimateLitres?: number;
};

const DAMAGE_KINDS: DamageKind[] = [
  'pothole',
  'crack',
  'surface_wear',
  'erosion',
  'flooded_pothole',
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function simpleHash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

function severityNormNum(s: Severity) {
  if (s === 'low') return 0.33;
  if (s === 'medium') return 0.66;
  return 1;
}

function bumpSeverity(s: Severity): Severity {
  if (s === 'low') return 'medium';
  if (s === 'medium') return 'high';
  return 'high';
}

function buildExplanations(
  severity: Severity,
  depthCm: number,
  widthM: number,
  confidence: number,
  surfaceMoisture: SurfaceMoisture,
  lighting: LightingCondition,
  roadEnvironment: DetectedRoadEnvironment,
): ExplanationFactor[] {
  const xs: ExplanationFactor[] = [];
  if (depthCm >= 5) xs.push('depth');
  if (widthM >= 0.4) xs.push('width');
  if (confidence >= 0.72) xs.push('confidence');
  if (severity === 'high') xs.push('shape');
  if (severity === 'high' || severity === 'medium') xs.push('traffic_context');
  if (surfaceMoisture === 'water_filled') xs.push('water_hidden_depth');
  if (lighting === 'night' || lighting === 'low_light') xs.push('low_light_uncertainty');
  xs.push('road_environment');
  if (xs.length === 0) xs.push('confidence');
  return Array.from(new Set(xs)).slice(0, 6);
}

export function stubFromHash(imageUri: string, lighting: LightingCondition = 'day'): DetectionResult {
  const hash = simpleHash(imageUri);
  const severities = ['low', 'medium', 'high'] as const;
  let severity = severities[hash % severities.length];
  let confidence = clamp(0.52 + (hash % 44) / 100, 0, 1);
  let depthEstimateCm = 2 + (hash % 14) + (severity === 'high' ? 4 : severity === 'medium' ? 2 : 0);
  let widthEstimateM = clamp(0.15 + ((hash >> 3) % 55) / 100, 0.08, 0.95);
  let vehicleDamageRisk = clamp(
    0.18 + severityNormNum(severity) * 0.22 + (hash % 25) / 100,
    0,
    1,
  );
  const damageKind = DAMAGE_KINDS[hash % DAMAGE_KINDS.length];

  const roadEnvs: DetectedRoadEnvironment[] = ['highway', 'urban', 'rural'];
  const roadEnvironment = roadEnvs[(hash >> 5) % 3];

  const waterRoll = (hash >> 7) % 10;
  let surfaceMoisture: SurfaceMoisture =
    damageKind === 'flooded_pothole' || waterRoll < 3 ? 'water_filled' : 'dry';

  if (surfaceMoisture === 'water_filled') {
    severity = bumpSeverity(severity);
    vehicleDamageRisk = clamp(vehicleDamageRisk * 1.2, 0, 1);
    depthEstimateCm = clamp(depthEstimateCm * 1.15, 0.5, 40);
  }

  if (lighting === 'night' || lighting === 'low_light') {
    confidence = clamp(confidence * 0.92, 0.38, 0.98);
    vehicleDamageRisk = clamp(vehicleDamageRisk * 1.06, 0, 1);
  }

  const perspectiveDepthCm = clamp(depthEstimateCm * (1.04 + (hash % 14) / 200), 0.5, 55);
  const r = widthEstimateM / 2;
  const hM = perspectiveDepthCm / 100;
  const volumeEstimateLitres = clamp(((Math.PI * r * r * hM) / 3) * 1000, 0.02, 220);

  return {
    severity,
    confidence,
    boxes: [{ x: 0.1, y: 0.2, w: 0.42, h: 0.26 }],
    damageKind,
    depthEstimateCm,
    widthEstimateM,
    vehicleDamageRisk,
    surfaceMoisture,
    lightingCondition: lighting,
    roadEnvironment,
    perspectiveDepthCm,
    volumeEstimateLitres,
    explanationFactors: buildExplanations(
      severity,
      depthEstimateCm,
      widthEstimateM,
      confidence,
      surfaceMoisture,
      lighting,
      roadEnvironment,
    ),
  };
}
