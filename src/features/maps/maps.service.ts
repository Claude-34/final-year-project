import { clamp } from '@/utils/helpers';

export function regionForCoordinates(latitude: number, longitude: number, delta = 0.05) {
  return {
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export function normalizeMarkerCount(count: number) {
  return clamp(count, 1, 5000);
}
