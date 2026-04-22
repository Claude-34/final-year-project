import { preprocessRoadImage } from '@/features/capture/image-preprocessing';
import { assessImageQualityStub } from '@/features/detection/image-quality.stub';
import { findDuplicateNearby } from '@/features/reports/duplicate-nearby';

import { runPotholeInference } from './inference.service';

import type { DetectionResult } from './detection.types';

function withDetectionDefaults(r: DetectionResult): DetectionResult {
  return {
    ...r,
    boxes: r.boxes?.length ? r.boxes : [],
    depthEstimateCm: r.depthEstimateCm ?? 4,
    widthEstimateM: r.widthEstimateM ?? 0.28,
    vehicleDamageRisk: r.vehicleDamageRisk ?? 0.32,
    damageKind: r.damageKind ?? 'pothole',
    surfaceMoisture: r.surfaceMoisture ?? 'dry',
    lightingCondition: r.lightingCondition ?? 'day',
    roadEnvironment: r.roadEnvironment ?? 'urban',
    preprocessingPipeline: r.preprocessingPipeline ?? 'day',
    perspectiveDepthCm: r.perspectiveDepthCm ?? r.depthEstimateCm ?? 4,
    volumeEstimateLitres: r.volumeEstimateLitres,
    duplicateNearby: r.duplicateNearby ?? null,
    explanationFactors:
      r.explanationFactors && r.explanationFactors.length > 0 ? r.explanationFactors : ['confidence'],
  };
}

export type DetectContext = {
  latitude?: number;
  longitude?: number;
};

export async function detectPotholeFromImage(
  imageUri: string,
  ctx: DetectContext = {},
): Promise<DetectionResult> {
  if (!imageUri) {
    throw new Error('Missing imageUri');
  }

  const prep = await preprocessRoadImage(imageUri);
  const raw = await runPotholeInference({
    imageUri: prep.uri,
    lightingCondition: prep.lightingCondition,
    fingerprintUri: imageUri,
  });

  const imageQuality = assessImageQualityStub(imageUri, prep.lightingCondition);
  const duplicateNearby = await findDuplicateNearby(ctx.latitude, ctx.longitude);

  return withDetectionDefaults({
    ...raw,
    lightingCondition: prep.lightingCondition,
    preprocessingPipeline: prep.pipeline,
    lowLightEnhancementApplied: prep.appliedLowLightEnhancement,
    imageQuality,
    duplicateNearby,
  });
}
