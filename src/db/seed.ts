import type { ActivityType, Report, Volunteer } from "@/lib/types";

const HOUR = 3600000;

type SeedActivity = { type: ActivityType; params: Record<string, string>; reportId: string; hoursAgo: number };

// Realistic Chennai demo data, inserted the first time the database is empty.
// Times are relative to the moment of seeding.
export function buildSeed(now = Date.now()) {
  const reports: Report[] = [
    { id: "rpt-001", lat: 13.05, lng: 80.2824, imageUrl: "/demo/marina-beach.jpg", severity: "high", status: "reported", timestamp: now - HOUR * 2 },
    { id: "rpt-002", lat: 13.0418, lng: 80.2341, imageUrl: "/demo/t-nagar.jpg", severity: "medium", status: "reported", timestamp: now - HOUR * 5 },
    {
      id: "rpt-003", lat: 13.0012, lng: 80.2565, imageUrl: "/demo/adyar.jpg", severity: "low", status: "in-progress",
      timestamp: now - HOUR * 8, claimedBy: "Arjun Kumar", volunteerId: "vol-001",
    },
    { id: "rpt-004", lat: 13.0339, lng: 80.2707, imageUrl: "/demo/mylapore.jpg", severity: "high", status: "reported", timestamp: now - HOUR * 1 },
    {
      id: "rpt-005", lat: 13.085, lng: 80.2101, imageUrl: "/demo/anna-nagar.jpg", severity: "medium", status: "cleaned",
      timestamp: now - HOUR * 24, claimedBy: "Priya Sharma", volunteerId: "vol-002",
      cleanedAt: now - HOUR * 12, afterImageUrl: "/demo/anna-nagar.jpg",
    },
    { id: "rpt-006", lat: 13.0674, lng: 80.2376, imageUrl: "/demo/egmore.jpg", severity: "low", status: "reported", timestamp: now - HOUR * 3 },
    {
      id: "rpt-007", lat: 13.1143, lng: 80.2871, imageUrl: "/demo/royapuram.jpg", severity: "high", status: "in-progress",
      timestamp: now - HOUR * 6, claimedBy: "Suresh Raina", volunteerId: "vol-004",
    },
  ];

  const volunteers: Volunteer[] = [
    { id: "vol-001", name: "Arjun Kumar", cleanupCount: 3, totalPoints: 85, lastCleanup: now - HOUR * 10, duplicateAttempts: 0, flagged: false },
    { id: "vol-002", name: "Priya Sharma", cleanupCount: 5, totalPoints: 135, lastCleanup: now - HOUR * 12, duplicateAttempts: 0, flagged: false },
    { id: "vol-003", name: "Rahul Verma", cleanupCount: 2, totalPoints: 60, lastCleanup: now - HOUR * 48, duplicateAttempts: 0, flagged: false },
    { id: "vol-004", name: "Suresh Raina", cleanupCount: 1, totalPoints: 50, lastCleanup: now - HOUR * 4, duplicateAttempts: 0, flagged: false },
    { id: "vol-005", name: "Anjali Menon", cleanupCount: 4, totalPoints: 110, lastCleanup: now - HOUR * 18, duplicateAttempts: 0, flagged: false },
  ];

  const activity: SeedActivity[] = [
    { type: "report_submitted", params: { severity: "high", location: "Marina Beach" }, reportId: "rpt-001", hoursAgo: 2 },
    { type: "report_submitted", params: { severity: "medium", location: "T. Nagar" }, reportId: "rpt-002", hoursAgo: 5 },
    { type: "report_claimed", params: { reportShort: "003", volunteerName: "Arjun Kumar" }, reportId: "rpt-003", hoursAgo: 7 },
    { type: "report_submitted", params: { severity: "high", location: "Mylapore" }, reportId: "rpt-004", hoursAgo: 1 },
    { type: "report_cleaned", params: { reportShort: "005", volunteerName: "Priya Sharma", points: "25" }, reportId: "rpt-005", hoursAgo: 12 },
    { type: "report_submitted", params: { severity: "low", location: "Egmore" }, reportId: "rpt-006", hoursAgo: 3 },
    { type: "report_claimed", params: { reportShort: "007", volunteerName: "Suresh Raina" }, reportId: "rpt-007", hoursAgo: 4 },
  ];

  return {
    reports,
    volunteers,
    activity: activity.map((a, i) => ({
      id: `act-seed-${i + 1}`,
      type: a.type,
      params: a.params,
      reportId: a.reportId,
      timestamp: now - HOUR * a.hoursAgo,
    })),
  };
}
