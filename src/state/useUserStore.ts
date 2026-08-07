import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeName } from '@/theme/tokens';

interface UserState {
  onboarded: boolean;
  name: string;
  themePreference: ThemeName | 'system';
  setOnboarded: (value: boolean) => void;
  setName: (value: string) => void;
  setThemePreference: (value: ThemeName | 'system') => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboarded: false,
      name: '',
      themePreference: 'system',
      setOnboarded: (onboarded) => set({ onboarded }),
      setName: (name) => set({ name }),
      setThemePreference: (themePreference) => set({ themePreference }),
    }),
    { name: 'ihvan-user', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
