import { appConfig } from '@/config/app.config';
import type { PredictiveContext } from '@/features/prediction/road-risk';
import { apiFetch } from '@/services/api/client';
import { weatherContextPath } from '@/services/api/endpoints';

export type WeatherContextResponse =
  | {
      available: true;
      rainfallIndex: number;
      precipMm1h: number | null;
      description: string;
      fetchedAt: string;
    }
  | { available: false; reason: 'not_configured' };

/**
 * Fetches normalized wetness from the backend (OpenWeatherMap via server proxy).
 * Returns null if the API base URL is unset, the request fails, or weather is not configured.
 */
export async function fetchWeatherContext(lat: number, lon: number): Promise<WeatherContextResponse | null> {
  if (!appConfig.apiBaseUrl) return null;

  try {
    const data = await apiFetch(weatherContextPath(lat, lon), { method: 'GET' });
    if (data && typeof data === 'object' && 'available' in data) {
      if (data.available === false) {
        return { available: false, reason: 'not_configured' };
      }
      if (
        data.available === true &&
        typeof (data as { rainfallIndex?: unknown }).rainfallIndex === 'number'
      ) {
        return data as WeatherContextResponse;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function mergePredictiveContext(
  base: PredictiveContext,
  rainfallIndex: number,
): PredictiveContext {
  return { ...base, rainfallIndex };
}
