/**
 * Pre-inference preprocessing: normalize resolution, branch for low light (demo).
 *
 * expo-image-manipulator supports resize/compress/rotate — not pixel-level curves.
 * Night/low-light path uses tighter compression + target width as a **stand-in** for
 * a production CLAHE / gamma / exposure-normalization stack on device or server.
 */
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import type { LightingCondition } from '@/features/detection/detection.types';

export type PreprocessOutcome = {
  uri: string;
  lightingCondition: LightingCondition;
  appliedLowLightEnhancement: boolean;
  /** Which copy branch to show (`detection.preprocess.*`). */
  pipeline: 'day' | 'low_light';
};

function simpleHash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

function inferLightingFromClockAndTextureStub(imageUri: string): LightingCondition {
  const hour = new Date().getHours();
  const h = simpleHash(imageUri);

  if (hour >= 22 || hour < 5) return 'night';
  if ((hour >= 18 && hour < 22) || (hour >= 5 && hour < 7)) return 'low_light';

  const lumaStub = (h % 100) / 100;
  if (lumaStub < 0.38) return 'low_light';

  return 'day';
}

export async function preprocessRoadImage(localUri: string): Promise<PreprocessOutcome> {
  const lightingCondition = inferLightingFromClockAndTextureStub(localUri);
  const needsLowLightPath = lightingCondition !== 'day';

  const targetWidth = needsLowLightPath ? 1120 : 1024;
  const compress = needsLowLightPath ? 0.86 : 0.92;

  let uri = localUri;
  try {
    const out = await manipulateAsync(
      localUri,
      [{ resize: { width: targetWidth } }],
      { compress, format: SaveFormat.JPEG },
    );
    uri = out.uri;
  } catch {
    // Keep original if manipulator fails (e.g. unsupported URI in tests).
  }

  const appliedLowLightEnhancement = needsLowLightPath && uri !== localUri;

  return {
    uri,
    lightingCondition,
    appliedLowLightEnhancement,
    pipeline: needsLowLightPath ? 'low_light' : 'day',
  };
}
