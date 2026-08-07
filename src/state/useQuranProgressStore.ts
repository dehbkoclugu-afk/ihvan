import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface QuranPosition {
  surah: number;
  ayah: number;
  updatedAt: string;
}

interface QuranProgressState {
  lastRead: QuranPosition | null;
  bookmarks: string[];
  setLastRead: (surah: number, ayah: number) => void;
  toggleBookmark: (surah: number, ayah: number) => void;
}

const keyFor = (surah: number, ayah: number) => `${surah}:${ayah}`;

export const useQuranProgressStore = create<QuranProgressState>()(
  persist(
    (set) => ({
      lastRead: null,
      bookmarks: [],
      setLastRead: (surah, ayah) => set({ lastRead: { surah, ayah, updatedAt: new Date().toISOString() } }),
      toggleBookmark: (surah, ayah) => set((state) => {
        const key = keyFor(surah, ayah);
        return { bookmarks: state.bookmarks.includes(key) ? state.bookmarks.filter((item) => item !== key) : [key, ...state.bookmarks] };
      }),
    }),
    { name: 'ihvan-quran-progress', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
