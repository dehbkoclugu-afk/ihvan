import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { dayKey } from '@/lib/dates';
import { incrementDailyDhikr } from '@/lib/dhikr';

interface DhikrState {
  day: string | null;
  count: number;
  increment: () => void;
  reset: () => void;
  clearHistory: () => void;
}

export const useDhikrStore = create<DhikrState>()(
  persist(
    (set) => ({
      day: null,
      count: 0,
      increment: () => set((state) => incrementDailyDhikr(state.day, state.count)),
      reset: () => set({ day: dayKey(), count: 0 }),
      clearHistory: () => set({ day: null, count: 0 }),
    }),
    { name: 'ihvan-dhikr', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
