import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PrayerSettingsState {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
}

export const usePrayerSettingsStore = create<PrayerSettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: false,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    { name: 'ihvan-prayer-settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
