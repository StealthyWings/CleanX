import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Report, ActivityEntry, ActivityType, Severity, Status, Volunteer, SEVERITY_POINTS } from './types';
import { generateId, hashImageData } from './utils';

// 5 preloaded realistic Chennai dummy reports
const DUMMY_REPORTS: Report[] = [
  {
    id: 'rpt-001',
    lat: 13.0500,
    lng: 80.2824,
    imageUrl: '/demo/marina-beach.jpg',
    severity: 'high',
    status: 'reported',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'rpt-002',
    lat: 13.0418,
    lng: 80.2341,
    imageUrl: '/demo/t-nagar.jpg',
    severity: 'medium',
    status: 'reported',
    timestamp: Date.now() - 3600000 * 5,
  },
  {
    id: 'rpt-003',
    lat: 13.0012,
    lng: 80.2565,
    imageUrl: '/demo/adyar.jpg',
    severity: 'low',
    status: 'in-progress',
    timestamp: Date.now() - 3600000 * 8,
    claimedBy: 'Arjun Kumar',
    volunteerId: 'vol-001',
  },
  {
    id: 'rpt-004',
    lat: 13.0339,
    lng: 80.2707,
    imageUrl: '/demo/mylapore.jpg',
    severity: 'high',
    status: 'reported',
    timestamp: Date.now() - 3600000 * 1,
  },
  {
    id: 'rpt-005',
    lat: 13.0850,
    lng: 80.2101,
    imageUrl: '/demo/anna-nagar.jpg',
    severity: 'medium',
    status: 'cleaned',
    timestamp: Date.now() - 3600000 * 24,
    claimedBy: 'Priya Sharma',
    volunteerId: 'vol-002',
    cleanedAt: Date.now() - 3600000 * 12,
    afterImageUrl: '/demo/anna-nagar.jpg',
  },
];

const DUMMY_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-001',
    name: 'Arjun Kumar',
    cleanupCount: 3,
    totalPoints: 85,
    lastCleanup: Date.now() - 3600000 * 10,
    duplicateAttempts: 0,
    flagged: false,
  },
  {
    id: 'vol-002',
    name: 'Priya Sharma',
    cleanupCount: 5,
    totalPoints: 135,
    lastCleanup: Date.now() - 3600000 * 12,
    duplicateAttempts: 0,
    flagged: false,
  },
  {
    id: 'vol-003',
    name: 'Rahul Verma',
    cleanupCount: 2,
    totalPoints: 60,
    lastCleanup: Date.now() - 3600000 * 48,
    duplicateAttempts: 0,
    flagged: false,
  },
];

function makeActivity(type: ActivityType, params: Record<string, string>, reportId: string): ActivityEntry {
  return {
    id: generateId(),
    type,
    params,
    reportId,
    timestamp: Date.now(),
  };
}

const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: generateId(),
    type: 'report_submitted',
    params: { severity: 'high', location: 'Marina Beach' },
    reportId: 'rpt-001',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: generateId(),
    type: 'report_submitted',
    params: { severity: 'medium', location: 'T. Nagar' },
    reportId: 'rpt-002',
    timestamp: Date.now() - 3600000 * 5,
  },
  {
    id: generateId(),
    type: 'report_claimed',
    params: { reportShort: '003', volunteerName: 'Arjun Kumar' },
    reportId: 'rpt-003',
    timestamp: Date.now() - 3600000 * 7,
  },
  {
    id: generateId(),
    type: 'report_submitted',
    params: { severity: 'high', location: 'Mylapore' },
    reportId: 'rpt-004',
    timestamp: Date.now() - 3600000 * 1,
  },
  {
    id: generateId(),
    type: 'report_cleaned',
    params: { reportShort: '005', volunteerName: 'Priya Sharma', points: '25' },
    reportId: 'rpt-005',
    timestamp: Date.now() - 3600000 * 12,
  },
];

interface ReportStore {
  reports: Report[];
  activity: ActivityEntry[];
  volunteers: Volunteer[];
  imageHashes: string[];       // stored hashes of all uploaded after-images
  currentVolunteerName: string; // name of current session volunteer

  // Actions
  addReport: (report: Omit<Report, 'id' | 'status' | 'timestamp'>) => void;
  claimReport: (id: string, volunteerName: string) => void;
  markCleaned: (id: string, afterImageUrl: string) => 'success' | 'duplicate' | 'flagged';
  setCurrentVolunteer: (name: string) => void;

  // Computed
  totalReported: () => number;
  inProgress: () => number;
  cleaned: () => number;
  highSeverity: () => number;
  getLeaderboard: () => Volunteer[];
  getVolunteerById: (id: string) => Volunteer | undefined;
  getVolunteerByName: (name: string) => Volunteer | undefined;
  isImageDuplicate: (imageDataUrl: string) => boolean;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: DUMMY_REPORTS,
      activity: INITIAL_ACTIVITY,
      volunteers: DUMMY_VOLUNTEERS,
      imageHashes: [],
      currentVolunteerName: '',

      setCurrentVolunteer: (name) => set({ currentVolunteerName: name }),

      addReport: (partial) => {
        const report: Report = {
          ...partial,
          id: `rpt-${generateId()}`,
          status: 'reported',
          timestamp: Date.now(),
        };
        const entry = makeActivity(
          'report_submitted',
          { severity: report.severity },
          report.id
        );
        set((state) => ({
          reports: [report, ...state.reports],
          activity: [entry, ...state.activity],
        }));
      },

      claimReport: (id, volunteerName) => {
        // Find or create volunteer
        const state = get();
        let volunteer = state.volunteers.find((v) => v.name === volunteerName);
        let newVolunteers = [...state.volunteers];

        if (!volunteer) {
          volunteer = {
            id: `vol-${generateId()}`,
            name: volunteerName,
            cleanupCount: 0,
            totalPoints: 0,
            duplicateAttempts: 0,
            flagged: false,
          };
          newVolunteers = [...newVolunteers, volunteer];
        }

        // Save the volunteer name to session
        set({
          currentVolunteerName: volunteerName,
          reports: state.reports.map((r) =>
            r.id === id
              ? { ...r, status: 'in-progress' as Status, claimedBy: volunteerName, volunteerId: volunteer!.id }
              : r
          ),
          volunteers: newVolunteers,
          activity: [
            makeActivity('report_claimed', {
              reportShort: id.slice(-3),
              volunteerName,
            }, id),
            ...state.activity,
          ],
        });
      },

      markCleaned: (id, afterImageUrl) => {
        const state = get();
        const report = state.reports.find((r) => r.id === id);
        if (!report || report.status !== 'in-progress' || !report.volunteerId) return 'success';

        // --- Image deduplication check ---
        const hash = hashImageData(afterImageUrl);
        if (state.imageHashes.includes(hash)) {
          // Find the volunteer and increment their duplicate attempts
          const vol = state.volunteers.find((v) => v.id === report.volunteerId);
          const newDupeCount = (vol?.duplicateAttempts ?? 0) + 1;
          const shouldFlag = newDupeCount >= 3;

          const newActivity: ActivityEntry[] = [
            makeActivity('image_duplicate', {
              volunteerName: report.claimedBy || 'Unknown',
              reportShort: id.slice(-3),
            }, id),
          ];

          if (shouldFlag) {
            newActivity.unshift(
              makeActivity('account_flagged', {
                volunteerName: report.claimedBy || 'Unknown',
              }, id)
            );
          }

          set({
            volunteers: state.volunteers.map((v) =>
              v.id === report.volunteerId
                ? { ...v, duplicateAttempts: newDupeCount, flagged: shouldFlag || v.flagged }
                : v
            ),
            activity: [...newActivity, ...state.activity],
          });

          return shouldFlag ? 'flagged' : 'duplicate';
        }

        // --- All good, mark as cleaned and award points ---
        const points = SEVERITY_POINTS[report.severity];

        set({
          imageHashes: [...state.imageHashes, hash],
          reports: state.reports.map((r) =>
            r.id === id
              ? { ...r, status: 'cleaned' as Status, cleanedAt: Date.now(), afterImageUrl }
              : r
          ),
          volunteers: state.volunteers.map((v) =>
            v.id === report.volunteerId
              ? {
                  ...v,
                  cleanupCount: v.cleanupCount + 1,
                  totalPoints: v.totalPoints + points,
                  lastCleanup: Date.now(),
                }
              : v
          ),
          activity: [
            makeActivity('report_cleaned', {
              reportShort: id.slice(-3),
              volunteerName: report.claimedBy || 'Unknown',
              points: String(points),
            }, id),
            ...state.activity,
          ],
        });

        return 'success';
      },

      totalReported: () => get().reports.length,
      inProgress: () => get().reports.filter((r) => r.status === 'in-progress').length,
      cleaned: () => get().reports.filter((r) => r.status === 'cleaned').length,
      highSeverity: () => get().reports.filter((r) => r.severity === 'high' && r.status !== 'cleaned').length,
      getLeaderboard: () => [...get().volunteers].sort((a, b) => b.totalPoints - a.totalPoints),
      getVolunteerById: (id) => get().volunteers.find((v) => v.id === id),
      getVolunteerByName: (name) => get().volunteers.find((v) => v.name === name),
      isImageDuplicate: (imageDataUrl) => {
        const hash = hashImageData(imageDataUrl);
        return get().imageHashes.includes(hash);
      },
    }),
    {
      name: 'cleanx-store',
      // Only persist data, not functions
      partialize: (state) => ({
        reports: state.reports,
        activity: state.activity,
        volunteers: state.volunteers,
        imageHashes: state.imageHashes,
        currentVolunteerName: state.currentVolunteerName,
      }),
    }
  )
);
