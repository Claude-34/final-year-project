import { Router } from 'express';
import { z } from 'zod';

import type { Env } from '../env.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
import { parseReportData, reportStatusSchema } from '../types/report.js';

const patchSchema = z.object({
  status: reportStatusSchema.optional(),
  assignedCrew: z.string().min(1).optional(),
  notes: z.string().optional(),
});

export function createAdminRouter(env: Env) {
  const r = Router();
  const auth = requireAuth(env);
  const adminOnly = requireRole('admin');

  r.use(auth, adminOnly);

  r.get('/stats', async (_req, res) => {
    const rows = await prisma.report.findMany({ select: { data: true } });
    const reports = rows.map((row) => parseReportData(row.data)).filter((r): r is NonNullable<typeof r> => r != null);

    const open = reports.filter((r) => r.status !== 'repaired').length;
    const high = reports.filter((r) => r.severity === 'high' || r.priorityScore >= 0.72).length;
    const assigned = reports.filter((r) => r.status === 'assigned' || r.status === 'in_progress').length;
    const repaired = reports.filter((r) => r.status === 'repaired').length;

    res.json({
      total: reports.length,
      open,
      highPriority: high,
      assigned,
      repaired,
      byStatus: {
        reported: reports.filter((r) => r.status === 'reported').length,
        verified: reports.filter((r) => r.status === 'verified').length,
        assigned: reports.filter((r) => r.status === 'assigned').length,
        in_progress: reports.filter((r) => r.status === 'in_progress').length,
        repaired: reports.filter((r) => r.status === 'repaired').length,
      },
    });
  });

  r.get('/reports/map', async (_req, res) => {
    const rows = await prisma.report.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, data: true },
    });
    const points = rows
      .map((row) => {
        const data = parseReportData(row.data);
        if (!data) return null;
        return {
          id: row.id,
          latitude: data.latitude,
          longitude: data.longitude,
          severity: data.severity,
          status: data.status,
          priorityScore: data.priorityScore,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p != null);
    res.json(points);
  });

  r.get('/reports', async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const severity = typeof req.query.severity === 'string' ? req.query.severity : undefined;
    const minPriority =
      typeof req.query.minPriority === 'string' ? Number(req.query.minPriority) : undefined;

    const rows = await prisma.report.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    let reports = rows
      .map((row) => {
        const data = parseReportData(row.data);
        if (!data) return null;
        return {
          ...data,
          reporter: row.user,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r != null);

    if (status) reports = reports.filter((r) => r.status === status);
    if (severity) reports = reports.filter((r) => r.severity === severity);
    if (minPriority != null && !Number.isNaN(minPriority)) {
      reports = reports.filter((r) => r.priorityScore >= minPriority);
    }

    res.json(reports);
  });

  r.get('/reports/:id', async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
      res.status(400).json({ message: 'Missing report id' });
      return;
    }
    const row = await prisma.report.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!row) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    const data = parseReportData(row.data);
    if (!data) {
      res.status(500).json({ message: 'Invalid report data' });
      return;
    }
    res.json({
      ...data,
      reporter: row.user,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  });

  r.patch('/reports/:id', async (req: AuthedRequest, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) {
      res.status(400).json({ message: 'Missing report id' });
      return;
    }
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid patch body' });
      return;
    }

    const row = await prisma.report.findUnique({ where: { id } });
    if (!row) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    const current = (row.data as Record<string, unknown>) ?? {};
    const next = {
      ...current,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.assignedCrew ? { assignedCrew: parsed.data.assignedCrew } : {}),
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
    };

    await prisma.report.update({
      where: { id },
      data: { data: next },
    });

    res.json(next);
  });

  return r;
}
