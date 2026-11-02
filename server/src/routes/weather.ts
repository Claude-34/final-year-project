import { Router } from 'express';
import { z } from 'zod';

import type { Env } from '../env.js';
import { fetchOpenWeatherContext } from '../weatherProvider.js';

const querySchema = z.object({
  lat: z.coerce.number().finite().gte(-90).lte(90),
  lon: z.coerce.number().finite().gte(-180).lte(180),
});

export function createWeatherRouter(env: Env) {
  const r = Router();

  r.get('/context', async (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid lat or lon' });
      return;
    }

    const { lat, lon } = parsed.data;
    const key = env.WEATHER_API_KEY?.trim();
    if (!key) {
      res.status(200).json({ available: false as const, reason: 'not_configured' as const });
      return;
    }

    const result = await fetchOpenWeatherContext(lat, lon, key);
    if (!result.ok) {
      res.status(502).json({ message: 'Weather provider unavailable' });
      return;
    }

    res.status(200).json(result.body);
  });

  return r;
}
