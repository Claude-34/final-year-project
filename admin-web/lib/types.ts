export type ReportStatus = 'reported' | 'verified' | 'assigned' | 'in_progress' | 'repaired';
export type Severity = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface AdminStats {
  total: number;
  open: number;
  highPriority: number;
  assigned: number;
  repaired: number;
  byStatus: Record<ReportStatus, number>;
}

export interface PotholeReport {
  id: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  detectedAt: string;
  severity: Severity;
  confidence: number;
  priorityScore: number;
  status: ReportStatus;
  reportedBy: string;
  assignedCrew?: string;
  notes?: string;
  reporter?: { id: string; name: string; email: string };
  createdAt?: string;
  updatedAt?: string;
}
