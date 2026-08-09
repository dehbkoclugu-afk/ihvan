import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mergeQuranReadAyahs, recordAyahRead as recordReadingDay, retainQuranReadingState, type QuranReadingDays, type QuranReadingGoal } from '@/lib/quranHabit';

export interface QuranPosition {
  surah: number;
  ayah: number;
  updatedAt: string;
}

interface QuranProgressState {
  lastRead: QuranPosition | null;
  bookmarks: string[];
  readingDays: QuranReadingDays;
  readAyahs: string[];
  readingGoal: QuranReadingGoal;
  setLastRead: (surah: number, ayah: number) => void;
  recordAyahRead: (surah: number, ayah: number, date?: Date) => void;
  markAyahRead: (surah: number, ayah: number, date?: Date) => void;
  setReadingGoal: (goal: QuranReadingGoal) => void;
  toggleBookmark: (surah: number, ayah: number) => void;
  enforceRetention: () => void;
  clearProgress: () => void;
}

const keyFor = (surah: number, ayah: number) => `${surah}:${ayah}`;

export const useQuranProgressStore = create<QuranProgressState>()(
  persist(
    (set) => ({
      lastRead: null,
      bookmarks: [],
      readingDays: {},
      readAyahs: [],
      readingGoal: 5,
      setLastRead: (surah, ayah) => set({ lastRead: { surah, ayah, updatedAt: new Date().toISOString() } }),
      recordAyahRead: (surah, ayah, date = new Date()) => set((state) => {
        const key = keyFor(surah, ayah);
        return {
          readingDays: recordReadingDay(state.readingDays, key, date),
          readAyahs: mergeQuranReadAyahs(state.readAyahs, state.readingDays, key),
        };
      }),
      markAyahRead: (surah, ayah, date = new Date()) => set((state) => {
        const key = keyFor(surah, ayah);
        return {
          lastRead: { surah, ayah, updatedAt: date.toISOString() },
          readingDays: recordReadingDay(state.readingDays, key, date),
          readAyahs: mergeQuranReadAyahs(state.readAyahs, state.readingDays, key),
        };
      }),
      setReadingGoal: (readingGoal) => set({ readingGoal }),
      toggleBookmark: (surah, ayah) => set((state) => {
        const key = keyFor(surah, ayah);
        return { bookmarks: state.bookmarks.includes(key) ? state.bookmarks.filter((item) => item !== key) : [key, ...state.bookmarks] };
      }),
      enforceRetention: () => set((state) => retainQuranReadingState(state.readAyahs, state.readingDays)),
      clearProgress: () => set({ lastRead: null, bookmarks: [], readingDays: {}, readAyahs: [] }),
    }),
    {
      name: 'ihvan-quran-progress',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<QuranProgressState>;
        const retained = retainQuranReadingState(persisted.readAyahs, persisted.readingDays ?? {});
        return { ...currentState, ...persisted, ...retained };
      },
      onRehydrateStorage: () => (state) => state?.enforceRetention(),
    },
  ),
);
