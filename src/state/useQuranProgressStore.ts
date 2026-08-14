import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { QURAN_SURAHS } from '@/data/quran';
import { mergeQuranReadAyahs, normalizeQuranAyahKey, normalizeQuranAyahKeys, normalizeQuranReadingGoal, normalizeQuranReadingPosition, recordAyahRead as recordReadingDay, retainQuranReadingState, type QuranReadingDays, type QuranReadingGoal, type QuranReadingPosition } from '@/lib/quranHabit';
import { normalizeQuranPlanDays, type QuranPlanDays } from '@/lib/quranPlan';

export type QuranPosition = QuranReadingPosition;

interface QuranProgressState {
  lastRead: QuranPosition | null;
  bookmarks: string[];
  readingDays: QuranReadingDays;
  readAyahs: string[];
  readingGoal: QuranReadingGoal;
  quranPlanDays: QuranPlanDays;
  setLastRead: (surah: number, ayah: number) => void;
  recordAyahRead: (surah: number, ayah: number, date?: Date) => void;
  markAyahRead: (surah: number, ayah: number, date?: Date) => void;
  setReadingGoal: (goal: QuranReadingGoal) => void;
  setQuranPlanDays: (days: QuranPlanDays) => void;
  toggleBookmark: (surah: number, ayah: number) => void;
  enforceRetention: () => void;
  clearProgress: () => void;
}

const surahAyahCounts = QURAN_SURAHS.map((surah) => surah.ayahCount);
const validKeyFor = (surah: unknown, ayah: unknown) => normalizeQuranAyahKey(surah, ayah, surahAyahCounts);

export const useQuranProgressStore = create<QuranProgressState>()(
  persist(
    (set) => ({
      lastRead: null,
      bookmarks: [],
      readingDays: {},
      readAyahs: [],
      readingGoal: 5,
      quranPlanDays: 60,
      setLastRead: (surah, ayah) => set(() => validKeyFor(surah, ayah)
        ? { lastRead: { surah, ayah, updatedAt: new Date().toISOString() } }
        : {}),
      recordAyahRead: (surah, ayah, date = new Date()) => set((state) => {
        const key = validKeyFor(surah, ayah);
        if (!key) return {};
        return {
          readingDays: recordReadingDay(state.readingDays, key, date),
          readAyahs: mergeQuranReadAyahs(state.readAyahs, state.readingDays, key, surahAyahCounts),
        };
      }),
      markAyahRead: (surah, ayah, date = new Date()) => set((state) => {
        const key = validKeyFor(surah, ayah);
        if (!key) return {};
        return {
          lastRead: { surah, ayah, updatedAt: date.toISOString() },
          readingDays: recordReadingDay(state.readingDays, key, date),
          readAyahs: mergeQuranReadAyahs(state.readAyahs, state.readingDays, key, surahAyahCounts),
        };
      }),
      setReadingGoal: (readingGoal) => set({ readingGoal: normalizeQuranReadingGoal(readingGoal) }),
      setQuranPlanDays: (quranPlanDays) => set({ quranPlanDays: normalizeQuranPlanDays(quranPlanDays) }),
      toggleBookmark: (surah, ayah) => set((state) => {
        const key = validKeyFor(surah, ayah);
        if (!key) return {};
        return { bookmarks: state.bookmarks.includes(key) ? state.bookmarks.filter((item) => item !== key) : [key, ...state.bookmarks] };
      }),
      enforceRetention: () => set((state) => retainQuranReadingState(state.readAyahs, state.readingDays, 90, new Date(), surahAyahCounts)),
      clearProgress: () => set({ lastRead: null, bookmarks: [], readingDays: {}, readAyahs: [] }),
    }),
    {
      name: 'ihvan-quran-progress',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<QuranProgressState>;
        const retained = retainQuranReadingState(persisted.readAyahs, persisted.readingDays, 90, new Date(), surahAyahCounts);
        return {
          ...currentState,
          ...persisted,
          ...retained,
          lastRead: normalizeQuranReadingPosition(persisted.lastRead, surahAyahCounts),
          bookmarks: normalizeQuranAyahKeys(persisted.bookmarks, surahAyahCounts),
          readingGoal: normalizeQuranReadingGoal(persisted.readingGoal),
          quranPlanDays: normalizeQuranPlanDays(persisted.quranPlanDays),
        };
      },
      onRehydrateStorage: () => (state) => state?.enforceRetention(),
    },
  ),
);
