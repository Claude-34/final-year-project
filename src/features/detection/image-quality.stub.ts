import type { ImageQualityAssessment, LightingCondition } from '@/features/detection/detection.types';
import { clamp } from '@/utils/helpers';

function simpleHash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Demo blur / lighting gate — replace with OpenCV blur variance + exposure stats.
 * Uses URI fingerprint + preprocessing lighting branch.
 */
export function assessImageQualityStub(
  fingerprintUri: string,
  lighting: LightingCondition,
): ImageQualityAssessment {
  const h = simpleHash(fingerprintUri);
  let blurScore = clamp(0.45 + (h % 45) / 100, 0, 1);
  let lightingScore = clamp(0.5 + ((h >> 4) % 40) / 100, 0, 1);

  if (lighting === 'night') {
    lightingScore *= 0.82;
    blurScore *= 0.9;
  } else if (lighting === 'low_light') {
    lightingScore *= 0.9;
  }

  const passed = blurScore >= 0.38 && lightingScore >= 0.4;
  const suggestRetake = !passed || blurScore < 0.45 || lightingScore < 0.48;

  return {
    blurScore,
    lightingScore,
    passed,
    suggestRetake,
  };
}
