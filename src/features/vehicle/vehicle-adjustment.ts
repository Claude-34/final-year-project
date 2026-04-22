import type { Severity } from '@/types/pothole';

export type VehicleType = 'motorcycle' | 'car' | 'truck';

/** Same defect = higher relative danger for two-wheelers (stub multipliers). */
export function vehicleRiskMultiplier(vehicle: VehicleType): number {
  if (vehicle === 'motorcycle') return 1.28;
  if (vehicle === 'truck') return 0.92;
  return 1;
}

export function adjustedVehicleDamageRisk(base: number, vehicle: VehicleType): number {
  return Math.min(1, base * vehicleRiskMultiplier(vehicle));
}

/** Demo speed cap copy — not navigation. */
export function recommendedSpeedKmh(severity: Severity, vehicle: VehicleType): number {
  let base = severity === 'high' ? 20 : severity === 'medium' ? 35 : 50;
  if (vehicle === 'motorcycle') base = Math.max(15, base - 8);
  if (vehicle === 'truck') base = Math.min(55, base + 5);
  return base;
}

export type DamageMessageKey =
  | 'vehicle.damage.low'
  | 'vehicle.damage.medium'
  | 'vehicle.damage.high'
  | 'vehicle.damage.highSuspension';

export function damageMessageKey(severity: Severity, vehicle: VehicleType): DamageMessageKey {
  if (severity === 'high') {
    return vehicle === 'motorcycle' ? 'vehicle.damage.high' : 'vehicle.damage.highSuspension';
  }
  if (severity === 'medium') return 'vehicle.damage.medium';
  return 'vehicle.damage.low';
}
