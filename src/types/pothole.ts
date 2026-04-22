export type Severity = 'low' | 'medium' | 'high';

export type RoadType = 'local' | 'secondary' | 'highway';

export type TrafficDensity = 'low' | 'medium' | 'high';

/** Municipal repair pipeline — extend on your backend. */
export type ReportStatus = 'reported' | 'verified' | 'assigned' | 'in_progress' | 'repaired';

export type DamageKind = 'pothole' | 'crack' | 'surface_wear' | 'erosion' | 'flooded_pothole';

export interface PotholeReport {
  id: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  address?: string;
  detectedAt: string;
  severity: Severity;
  confidence: number;
  /** Estimated width in metres (CV / engineer estimate). */
  widthEstimate?: number;
  /** Estimated depth in centimetres. */
  depthEstimate?: number;
  /** 0–1 likelihood of vehicle damage if hit at speed (model stub). */
  vehicleDamageRisk?: number;
  damageKind?: DamageKind;
  priorityScore: number;
  roadType?: RoadType;
  trafficDensity?: TrafficDensity;
  status: ReportStatus;
  reportedBy: string;
  notes?: string;
  /** Crowd validation (stub). */
  validationUpvotes?: number;
  validationDownvotes?: number;
  /** Nearby confirmed reports in radius — boosts priority when clustered. */
  reportCountNearby?: number;
  nearSchool?: boolean;
  nearHospital?: boolean;
  /** Stub: years since last resurfacing — feeds predictive risk. */
  roadAgeYears?: number;
}
