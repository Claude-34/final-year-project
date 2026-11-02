import { z } from 'zod';

export const reportStatusSchema = z.enum(['reported', 'verified', 'assigned', 'in_progress', 'repaired']);
export const severitySchema = z.enum(['low', 'medium', 'high']);

export const reportDataSchema = z
  .object({
    id: z.string().min(1),
    imageUrl: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    detectedAt: z.string(),
    severity: severitySchema,
    confidence: z.number(),
    priorityScore: z.number(),
    status: reportStatusSchema,
    reportedBy: z.string(),
    assignedCrew: z.string().optional(),
  })
  .passthrough();

export type ReportData = z.infer<typeof reportDataSchema>;

export function parseReportData(data: unknown): ReportData | null {
  const parsed = reportDataSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
