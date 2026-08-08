import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeName } from '@/theme/tokens';
import type { QuranTextSize } from '@/lib/quranDisplay';

interface UserState {
  onboarded: boolean;
  name: string;
  themePreference: ThemeName | 'system';
  quranTextSize: QuranTextSize;
  setOnboarded: (value: boolean) => void;
  setName: (value: string) => void;
  setThemePreference: (value: ThemeName | 'system') => void;
  setQuranTextSize: (value: QuranTextSize) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboarded: false,
      name: '',
      themePreference: 'system',
      quranTextSize: 'medium',
      setOnboarded: (onboarded) => set({ onboarded }),
      setName: (name) => set({ name }),
      setThemePreference: (themePreference) => set({ themePreference }),
      setQuranTextSize: (quranTextSize) => set({ quranTextSize }),
    }),
    { name: 'ihvan-user', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
