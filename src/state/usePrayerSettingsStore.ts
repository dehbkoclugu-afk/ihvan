import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PrayerReminderOffset } from '@/services/prayerTimes';

interface PrayerSettingsState {
  notificationsEnabled: boolean;
  reminderMinutesBefore: PrayerReminderOffset;
  setNotificationsEnabled: (value: boolean) => void;
  setReminderMinutesBefore: (value: PrayerReminderOffset) => void;
}

export const usePrayerSettingsStore = create<PrayerSettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: false,
      reminderMinutesBefore: 0,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setReminderMinutesBefore: (reminderMinutesBefore) => set({ reminderMinutesBefore }),
    }),
    { name: 'ihvan-prayer-settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
