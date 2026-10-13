import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, CleanResult, Report, Severity, Volunteer } from './types';
import { hashImageData } from './utils';

interface ReportStore extends AppState {
  loaded: boolean;              // true once the first server snapshot has arrived
  currentVolunteerName: string; // name of current session volunteer (kept in this browser only)

  // Actions — all writes go through the API, which returns the fresh state
  fetchState: () => Promise<void>;
  addReport: (report: { lat: number; lng: number; imageUrl: string; severity: Severity }) => Promise<void>;
  claimReport: (id: string, volunteerName: string) => Promise<void>;
  markCleaned: (id: string, afterImageUrl: string) => Promise<CleanResult>;
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

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [] as Report[],
      activity: [],
      volunteers: [],
      imageHashes: [],
      loaded: false,
      currentVolunteerName: '',

      setCurrentVolunteer: (name) => set({ currentVolunteerName: name }),

      fetchState: async () => {
        const state = await api<AppState>('/api/state');
        set({ ...state, loaded: true });
      },

      addReport: async ({ imageUrl, ...rest }) => {
        const { state } = await api<{ state: AppState }>('/api/reports', { ...rest, image: imageUrl });
        set({ ...state, loaded: true });
      },

      claimReport: async (id, volunteerName) => {
        const { state } = await api<{ state: AppState }>(`/api/reports/${id}/claim`, { volunteerName });
        set({ ...state, loaded: true, currentVolunteerName: volunteerName });
      },

      markCleaned: async (id, afterImageUrl) => {
        const { result, state } = await api<{ result: CleanResult; state: AppState }>(
          `/api/reports/${id}/clean`,
          { image: afterImageUrl }
        );
        set({ ...state, loaded: true });
        return result;
      },

      totalReported: () => get().reports.length,
      inProgress: () => get().reports.filter((r) => r.status === 'in-progress').length,
      cleaned: () => get().reports.filter((r) => r.status === 'cleaned').length,
      highSeverity: () => get().reports.filter((r) => r.severity === 'high' && r.status !== 'cleaned').length,
      getLeaderboard: () => [...get().volunteers].sort((a, b) => b.totalPoints - a.totalPoints),
      getVolunteerById: (id) => get().volunteers.find((v) => v.id === id),
      getVolunteerByName: (name) => get().volunteers.find((v) => v.name === name),
      isImageDuplicate: (imageDataUrl) => get().imageHashes.includes(hashImageData(imageDataUrl)),
    }),
    {
      // New key: the old 'cleanx-store' held a full local copy of the data, which the DB now owns
      name: 'cleanx-session',
      partialize: (state) => ({ currentVolunteerName: state.currentVolunteerName }),
    }
  )
);
