import type { DuplicateNearbyInfo } from '@/features/detection/detection.types';
import { listReports } from '@/features/reports/reports.service';
import { haversineMeters } from '@/utils/geo';

const NEAR_DUP_M = 38;

/**
 * Warn if a report already exists within ~38 m (demo — tune for your GIS).
 */
export async function findDuplicateNearby(
  latitude?: number,
  longitude?: number,
): Promise<DuplicateNearbyInfo | null> {
  if (latitude == null || longitude == null || (latitude === 0 && longitude === 0)) {
    return null;
  }

  const reports = await listReports();
  let best: DuplicateNearbyInfo | null = null;

  for (const r of reports) {
    const d = haversineMeters(
      { lat: latitude, lon: longitude },
      { lat: r.latitude, lon: r.longitude },
    );
    if (d < NEAR_DUP_M && (!best || d < best.distanceM)) {
      best = { reportId: r.id, distanceM: Math.round(d) };
    }
  }

  return best;
}
