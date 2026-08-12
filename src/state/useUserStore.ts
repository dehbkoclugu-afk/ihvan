import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeName } from '@/theme/tokens';
import type { QuranTextSize } from '@/lib/quranDisplay';
import { normalizeUserPreferences } from '@/lib/userProfile';
import type { LanguagePreference } from '@/i18n/applicationLocales';

interface UserState {
  onboarded: boolean;
  name: string;
  themePreference: ThemeName | 'system';
  quranTextSize: QuranTextSize;
  language: LanguagePreference;
  setOnboarded: (value: boolean) => void;
  setName: (value: string) => void;
  setThemePreference: (value: ThemeName | 'system') => void;
  setQuranTextSize: (value: QuranTextSize) => void;
  setLanguage: (value: LanguagePreference) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboarded: false,
      name: '',
      themePreference: 'system',
      quranTextSize: 'medium',
      language: 'system',
      setOnboarded: (onboarded) => set({ onboarded }),
      setName: (name) => set({ name }),
      setThemePreference: (themePreference) => set({ themePreference }),
      setQuranTextSize: (quranTextSize) => set({ quranTextSize }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'ihvan-user',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState as Partial<UserState>,
        ...normalizeUserPreferences(persistedState),
      }),
    },
  ),
);
