import { Router } from 'express';
import { z } from 'zod';

import { stubFromHash } from '../inferenceStub.js';

const inferSchema = z.object({
  imageUri: z.string().min(1),
  lightingCondition: z.enum(['day', 'low_light', 'night']).optional(),
  fingerprintUri: z.string().optional(),
});

/** Public endpoint: matches client stub when API is configured (no real model yet). */
export function createInferenceRouter() {
  const r = Router();

  r.post('/', (req, res) => {
    const parsed = inferSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid inference body' });
      return;
    }
    const lighting = parsed.data.lightingCondition ?? 'day';
    const hashSource = parsed.data.fingerprintUri ?? parsed.data.imageUri;
    const result = stubFromHash(hashSource, lighting);
    res.json(result);
  });

  return r;
}
