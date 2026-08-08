import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { dayKey } from '@/lib/dates';
import { prunePrayerCompletions, type PrayerCompletions, type TrackedPrayerKey } from '@/lib/prayerTracking';

interface PrayerTrackingState {
  completions: PrayerCompletions;
  togglePrayer: (prayer: TrackedPrayerKey, date?: Date) => void;
  clearTracking: () => void;
}

export const usePrayerTrackingStore = create<PrayerTrackingState>()(
  persist(
    (set) => ({
      completions: {},
      togglePrayer: (prayer, date = new Date()) => set((state) => {
        const key = dayKey(date);
        const current = state.completions[key] ?? [];
        const next = current.includes(prayer) ? current.filter((item) => item !== prayer) : [...current, prayer];
        return { completions: prunePrayerCompletions({ ...state.completions, [key]: next }, 90, date) };
      }),
      clearTracking: () => set({ completions: {} }),
    }),
    { name: 'ihvan-prayer-tracking', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
