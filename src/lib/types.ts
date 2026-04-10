export type Severity = 'low' | 'medium' | 'high';
export type Status = 'reported' | 'in-progress' | 'cleaned';

export const SEVERITY_POINTS: Record<Severity, number> = {
  low: 10,
  medium: 25,
  high: 50,
};

export interface Report {
  id: string;
  lat: number;
  lng: number;
  imageUrl: string;
  severity: Severity;
  status: Status;
  timestamp: number;
  claimedBy?: string;
  volunteerId?: string;
  cleanedAt?: number;
  afterImageUrl?: string;
}

export interface Volunteer {
  id: string;
  name: string;
  cleanupCount: number;
  totalPoints: number;
  lastCleanup?: number;
  duplicateAttempts: number;
  flagged: boolean;
}

// Structured activity entry — enables i18n at render time
export type ActivityType = 'report_submitted' | 'report_claimed' | 'report_cleaned' | 'image_duplicate' | 'account_flagged';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  params: Record<string, string>;
  reportId: string;
  timestamp: number;
  // Legacy fallback — old entries stored as plain text
  action?: string;
}
