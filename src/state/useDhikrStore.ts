import { create } from 'zustand';

interface DhikrState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useDhikrStore = create<DhikrState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  reset: () => set({ count: 0 }),
}));
