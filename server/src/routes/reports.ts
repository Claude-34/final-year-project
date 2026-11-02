import { Router } from 'express';
import type { z } from 'zod';

import type { Env } from '../env.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
import { reportDataSchema } from '../types/report.js';

const reportSchema = reportDataSchema;

export function createReportsRouter(env: Env) {
  const r = Router();
  const auth = requireAuth(env);

  r.post('/', auth, async (req: AuthedRequest, res) => {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid report payload' });
      return;
    }
    const userId = req.userId!;
    const body = parsed.data as z.infer<typeof reportSchema> & Record<string, unknown>;
    const existing = await prisma.report.findUnique({ where: { id: body.id } });
    if (existing && existing.userId !== userId) {
      res.status(409).json({ message: 'Report id already exists for another user' });
      return;
    }
    const data = { ...body, reportedBy: userId };

    await prisma.report.upsert({
      where: { id: body.id },
      create: { id: body.id, userId, data },
      update: { data, userId },
    });

    res.status(201).json({ id: body.id });
  });

  r.get('/', auth, async (req: AuthedRequest, res) => {
    const rows = await prisma.report.findMany({
      where: { userId: req.userId! },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(rows.map((row) => row.data));
  });

  r.get('/:id', auth, async (req: AuthedRequest, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
      res.status(400).json({ message: 'Missing report id' });
      return;
    }
    const row = await prisma.report.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!row) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    res.json(row.data);
  });

  return r;
}
