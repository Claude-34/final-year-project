import type { Severity } from '@/types/pothole';

export type LatLng = { latitude: number; longitude: number };

export type PotholeAlongRoute = LatLng & { id: string; severity: Severity };

export type RouteAlternative = {
  id: string;
  coordinates: LatLng[];
  nearPotholeCount: number;
  exposureScore: number;
  recommended: boolean;
};

const EARTH_M = 6371000;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return EARTH_M * c;
}

function bearingDeg(from: LatLng, to: LatLng): number {
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (((θ * 180) / Math.PI) + 360) % 360;
}

function destinationPoint(from: LatLng, bearing: number, distanceM: number): LatLng {
  const δ = distanceM / EARTH_M;
  const θ = (bearing * Math.PI) / 180;
  const φ1 = (from.latitude * Math.PI) / 180;
  const λ1 = (from.longitude * Math.PI) / 180;
  const sinφ1 = Math.sin(φ1);
  const cosφ1 = Math.cos(φ1);
  const sinδ = Math.sin(δ);
  const cosδ = Math.cos(δ);
  const sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);
  const y = Math.sin(θ) * sinδ * cosφ1;
  const x = cosδ - sinφ1 * sinφ2;
  const λ2 = λ1 + Math.atan2(y, x);
  return {
    latitude: (φ2 * 180) / Math.PI,
    longitude: ((((λ2 * 180) / Math.PI) + 540) % 360) - 180,
  };
}

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

function buildCurvedRoute(
  from: LatLng,
  to: LatLng,
  steps: number,
  side: 'none' | 'left' | 'right',
  amplitudeM: number,
): LatLng[] {
  const out: LatLng[] = [];
  const mainBr = bearingDeg(from, to);
  const perp = side === 'left' ? mainBr - 90 : side === 'right' ? mainBr + 90 : mainBr;

  for (let i = 0; i < steps; i++) {
    const t = i / Math.max(1, steps - 1);
    const base = lerp(from, to, t);
    if (side === 'none' || amplitudeM <= 0) {
      out.push(base);
      continue;
    }
    const bend = amplitudeM * Math.sin(Math.PI * t);
    out.push(destinationPoint(base, perp, bend));
  }
  return out;
}

const NEAR_ROUTE_M = 82;

export type RouteComputeOptions = {
  /** Heavily penalize **high** severity potholes so detours win more often (demo routing). */
  avoidSeverePotholes?: boolean;
};

function severityPenalty(severity: Severity, avoidSevere: boolean) {
  if (!avoidSevere) {
    const base: Record<Severity, number> = { high: 5, medium: 2, low: 1 };
    return base[severity];
  }
  const strong: Record<Severity, number> = { high: 24, medium: 3, low: 1 };
  return strong[severity];
}

function scoreRouteAgainstPotholes(
  path: LatLng[],
  potholes: PotholeAlongRoute[],
  avoidSevere: boolean,
) {
  const seen = new Set<string>();
  let exposureScore = 0;

  for (const pt of path) {
    for (const h of potholes) {
      if (seen.has(h.id)) continue;
      if (haversineMeters(pt, h) < NEAR_ROUTE_M) {
        seen.add(h.id);
        exposureScore += severityPenalty(h.severity, avoidSevere);
      }
    }
  }

  return { nearPotholeCount: seen.size, exposureScore };
}

/**
 * Builds three candidate paths (straight “main” and two lateral detours) and ranks pothole exposure.
 * This is a **demo** substitute for a real routing engine + road network; plug in Directions API later.
 */
export function computeRouteAlternatives(
  from: LatLng,
  to: LatLng,
  potholes: PotholeAlongRoute[],
  options: RouteComputeOptions = {},
): RouteAlternative[] {
  const avoidSevere = options.avoidSeverePotholes === true;
  const dist = haversineMeters(from, to);
  const baseAmp = Math.min(220, Math.max(90, dist * 0.22));
  /** Wider lateral detours when avoiding severe — demo paths must diverge enough to change exposure. */
  const amplitude = avoidSevere ? Math.min(420, baseAmp * 1.75) : baseAmp;

  const raw = [
    {
      id: 'main',
      coordinates: buildCurvedRoute(from, to, 42, 'none', 0),
    },
    {
      id: 'detour_a',
      coordinates: buildCurvedRoute(from, to, 42, 'left', amplitude),
    },
    {
      id: 'detour_b',
      coordinates: buildCurvedRoute(from, to, 42, 'right', amplitude),
    },
  ];

  const scored = raw.map((r) => {
    const { nearPotholeCount, exposureScore } = scoreRouteAgainstPotholes(
      r.coordinates,
      potholes,
      avoidSevere,
    );
    return {
      ...r,
      nearPotholeCount,
      exposureScore,
      recommended: false,
    };
  });

  let best = Infinity;
  for (const r of scored) {
    if (r.exposureScore < best) best = r.exposureScore;
  }

  return scored.map((r) => ({
    ...r,
    recommended: r.exposureScore === best,
  }));
}
