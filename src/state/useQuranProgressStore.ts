import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { recordAyahRead, type QuranReadingDays, type QuranReadingGoal } from '@/lib/quranHabit';

export interface QuranPosition {
  surah: number;
  ayah: number;
  updatedAt: string;
}

interface QuranProgressState {
  lastRead: QuranPosition | null;
  bookmarks: string[];
  readingDays: QuranReadingDays;
  readingGoal: QuranReadingGoal;
  setLastRead: (surah: number, ayah: number) => void;
  markAyahRead: (surah: number, ayah: number, date?: Date) => void;
  setReadingGoal: (goal: QuranReadingGoal) => void;
  toggleBookmark: (surah: number, ayah: number) => void;
}

const keyFor = (surah: number, ayah: number) => `${surah}:${ayah}`;

export const useQuranProgressStore = create<QuranProgressState>()(
  persist(
    (set) => ({
      lastRead: null,
      bookmarks: [],
      readingDays: {},
      readingGoal: 5,
      setLastRead: (surah, ayah) => set({ lastRead: { surah, ayah, updatedAt: new Date().toISOString() } }),
      markAyahRead: (surah, ayah, date = new Date()) => set((state) => ({
        lastRead: { surah, ayah, updatedAt: date.toISOString() },
        readingDays: recordAyahRead(state.readingDays, keyFor(surah, ayah), date),
      })),
      setReadingGoal: (readingGoal) => set({ readingGoal }),
      toggleBookmark: (surah, ayah) => set((state) => {
        const key = keyFor(surah, ayah);
        return { bookmarks: state.bookmarks.includes(key) ? state.bookmarks.filter((item) => item !== key) : [key, ...state.bookmarks] };
      }),
    }),
    { name: 'ihvan-quran-progress', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
