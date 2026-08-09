import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { dayKey } from '@/lib/dates';
import { dhikrHistoryWithLegacy, incrementDailyDhikr, pruneDhikrHistory, retainDhikrState, type DhikrHistory } from '@/lib/dhikr';

interface DhikrState {
  day: string | null;
  count: number;
  history: DhikrHistory;
  increment: () => void;
  reset: () => void;
  enforceRetention: () => void;
  clearHistory: () => void;
}

export const useDhikrStore = create<DhikrState>()(
  persist(
    (set) => ({
      day: null,
      count: 0,
      history: {},
      increment: () => set((state) => {
        const next = incrementDailyDhikr(state.day, state.count);
        const history = dhikrHistoryWithLegacy(state.history ?? {}, state.day, state.count);
        return { ...next, history: pruneDhikrHistory({ ...history, [next.day]: next.count }) };
      }),
      reset: () => set((state) => {
        const today = dayKey();
        const history = dhikrHistoryWithLegacy(state.history ?? {}, state.day, state.count);
        return { day: today, count: 0, history: pruneDhikrHistory({ ...history, [today]: 0 }) };
      }),
      enforceRetention: () => set((state) => retainDhikrState(state.day, state.count, state.history ?? {})),
      clearHistory: () => set({ day: null, count: 0, history: {} }),
    }),
    {
      name: 'ihvan-dhikr',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<DhikrState>;
        const retained = retainDhikrState(persisted.day ?? null, persisted.count ?? 0, persisted.history ?? {});
        return { ...currentState, ...persisted, ...retained };
      },
      onRehydrateStorage: () => (state) => state?.enforceRetention(),
    },
  ),
);
