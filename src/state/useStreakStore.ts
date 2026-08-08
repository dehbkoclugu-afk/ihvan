import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { dayKey, nextStreak } from '@/lib/dates';
import { completeRitualStep, isRitualComplete, type RitualStep } from '@/lib/ritual';

export type { RitualStep } from '@/lib/ritual';

interface StreakState {
  count: number;
  bestCount: number;
  lastTickDay: string | null;
  doneDay: string | null;
  doneSteps: RitualStep[];
  tickToday: () => void;
  toggleStep: (step: RitualStep) => void;
  completeStep: (step: RitualStep) => void;
  clearProgress: () => void;
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      count: 0,
      bestCount: 0,
      lastTickDay: null,
      doneDay: null,
      doneSteps: [],
      tickToday: () => {
        const state = get();
        const today = dayKey();
        if (state.lastTickDay === today) return;
        const count = nextStreak(state.lastTickDay, state.count);
        set({ count, bestCount: Math.max(state.bestCount, count), lastTickDay: today });
      },
      toggleStep: (step) => {
        const today = dayKey();
        const state = get();
        const current = state.doneDay === today ? state.doneSteps : [];
        const doneSteps = current.includes(step) ? current.filter((s) => s !== step) : [...current, step];
        set({ doneDay: today, doneSteps });
        if (isRitualComplete(doneSteps)) get().tickToday();
      },
      completeStep: (step) => {
        const today = dayKey();
        const state = get();
        const current = state.doneDay === today ? state.doneSteps : [];
        if (current.includes(step)) return;
        const doneSteps = completeRitualStep(current, step);
        set({ doneDay: today, doneSteps });
        if (isRitualComplete(doneSteps)) get().tickToday();
      },
      clearProgress: () => set({ count: 0, bestCount: 0, lastTickDay: null, doneDay: null, doneSteps: [] }),
    }),
    { name: 'ihvan-streak', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
