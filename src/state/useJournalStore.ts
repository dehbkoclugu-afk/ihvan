import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { normalizeReflectionEntries, normalizeReflectionText, updateReflectionEntries, type ReflectionEntry } from '@/lib/journal';

export type { ReflectionEntry } from '@/lib/journal';

interface JournalState {
  entries: ReflectionEntry[];
  add: (text: string) => void;
  update: (id: string, text: string) => void;
  remove: (id: string) => void;
  clearEntries: () => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      entries: [],
      add: (text) => set((state) => {
        const normalized = normalizeReflectionText(text);
        if (!normalized) return state;
        return { entries: [{ id: `${Date.now()}`, text: normalized, createdAt: new Date().toISOString() }, ...state.entries] };
      }),
      update: (id, text) => set((state) => ({ entries: updateReflectionEntries(state.entries, id, text) })),
      remove: (id) => set((s) => ({ entries: s.entries.filter((entry) => entry.id !== id) })),
      clearEntries: () => set({ entries: [] }),
    }),
    {
      name: 'ihvan-journal',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<JournalState>;
        return { ...currentState, ...persisted, entries: normalizeReflectionEntries(persisted.entries) };
      },
    },
  ),
);
