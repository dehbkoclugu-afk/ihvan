import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ReflectionEntry { id: string; text: string; createdAt: string }

interface JournalState {
  entries: ReflectionEntry[];
  add: (text: string) => void;
  remove: (id: string) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      add: (text) => set((s) => ({ entries: [{ id: `${Date.now()}`, text: text.trim(), createdAt: new Date().toISOString() }, ...s.entries] })),
      remove: (id) => set((s) => ({ entries: s.entries.filter((entry) => entry.id !== id) })),
    }),
    { name: 'ihvan-journal', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
