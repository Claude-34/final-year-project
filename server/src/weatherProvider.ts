function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export type WeatherContextOk = {
  available: true;
  rainfallIndex: number;
  precipMm1h: number | null;
  description: string;
  fetchedAt: string;
};

/**
 * Map OpenWeather current data to 0–1 rainfallIndex: measured precip (mm/h) scaled to a cap,
 * else coarse buckets from condition codes (WMO-style groups).
 */
function rainfallIndexFromOpenWeatherCurrent(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const rain = o.rain as Record<string, unknown> | undefined;
  const mm1h = typeof rain?.['1h'] === 'number' ? rain['1h'] : null;
  const mm3h = typeof rain?.['3h'] === 'number' ? rain['3h'] : null;
  const mmPerHour = mm1h ?? (mm3h != null ? mm3h / 3 : null);
  if (mmPerHour != null && mmPerHour > 0) {
    return clamp(mmPerHour / 12, 0, 1);
  }

  const weather = o.weather as Array<{ id?: number }> | undefined;
  const wid = weather?.[0]?.id ?? 800;
  if (wid >= 200 && wid < 300) return 0.75;
  if (wid >= 300 && wid < 400) return 0.4;
  if (wid >= 500 && wid < 600) return 0.58;
  if (wid >= 600 && wid < 700) return 0.82;
  return 0.12;
}

function descriptionFromOpenWeather(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const o = data as Record<string, unknown>;
  const weather = o.weather as Array<{ description?: string }> | undefined;
  return String(weather?.[0]?.description ?? '');
}

function precipMm1hFromOpenWeather(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const rain = (data as Record<string, unknown>).rain as Record<string, unknown> | undefined;
  const mm1h = typeof rain?.['1h'] === 'number' ? rain['1h'] : null;
  if (mm1h != null) return mm1h;
  const mm3h = typeof rain?.['3h'] === 'number' ? rain['3h'] : null;
  return mm3h != null ? mm3h / 3 : null;
}

export async function fetchOpenWeatherContext(
  lat: number,
  lon: number,
  apiKey: string,
): Promise<{ ok: true; body: WeatherContextOk } | { ok: false }> {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', 'metric');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(url.toString(), { signal: controller.signal });
  } catch {
    clearTimeout(timeout);
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) return { ok: false };

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false };
  }

  const rainfallIndex = rainfallIndexFromOpenWeatherCurrent(data);
  if (rainfallIndex == null) return { ok: false };

  return {
    ok: true,
    body: {
      available: true,
      rainfallIndex,
      precipMm1h: precipMm1hFromOpenWeather(data),
      description: descriptionFromOpenWeather(data),
      fetchedAt: new Date().toISOString(),
    },
  };
}
