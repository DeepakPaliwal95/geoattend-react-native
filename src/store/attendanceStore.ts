import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendanceRecord } from '../types/attendance';

export interface AttendanceState {
  records: AttendanceRecord[];
  hasHydrated: boolean;
  addAttendance: (record: AttendanceRecord) => void;
  hasCheckedInToday: (date?: string) => boolean;
  getTodayRecord: () => AttendanceRecord | undefined;
  clearAttendance: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

/**
 * Zustand store managing attendance records with AsyncStorage persistence.
 * Storage key: 'geoattend-attendance'
 * Only 'records' are persisted to storage; runtime flags are not persisted.
 */
export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      records: [],
      hasHydrated: false,

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated });
      },

      addAttendance: (record: AttendanceRecord) => {
        // Prevent duplicate check-in record for the same calendar date
        const exists = get().records.some(r => r.date === record.date);
        if (exists) {
          return;
        }
        set(state => ({
          records: [record, ...state.records],
        }));
      },

      hasCheckedInToday: (date?: string) => {
        const targetDate = date || new Date().toISOString().split('T')[0];
        return get().records.some(record => record.date === targetDate);
      },

      getTodayRecord: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().records.find(record => record.date === today);
      },

      clearAttendance: () => {
        set({ records: [] });
      },
    }),
    {
      name: 'geoattend-attendance',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ records: state.records }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
