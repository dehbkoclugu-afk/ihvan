import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_PRAYER_NOTIFICATION_KEYS, normalizePrayerNotificationSettings, type PrayerNotificationKey, type PrayerReminderOffset } from '@/services/prayerTimes';

interface PrayerSettingsState {
  notificationsEnabled: boolean;
  reminderMinutesBefore: PrayerReminderOffset;
  notificationPrayers: PrayerNotificationKey[];
  setNotificationsEnabled: (value: boolean) => void;
  setReminderMinutesBefore: (value: PrayerReminderOffset) => void;
  toggleNotificationPrayer: (prayer: PrayerNotificationKey) => void;
}

export const usePrayerSettingsStore = create<PrayerSettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: false,
      reminderMinutesBefore: 0,
      notificationPrayers: [...DEFAULT_PRAYER_NOTIFICATION_KEYS],
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setReminderMinutesBefore: (reminderMinutesBefore) => set({ reminderMinutesBefore }),
      toggleNotificationPrayer: (prayer) => set((state) => ({
        notificationPrayers: state.notificationPrayers.includes(prayer)
          ? state.notificationPrayers.filter((item) => item !== prayer)
          : [...state.notificationPrayers, prayer],
      })),
    }),
    {
      name: 'ihvan-prayer-settings',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState as Partial<PrayerSettingsState>,
        ...normalizePrayerNotificationSettings(persistedState),
      }),
    },
  ),
);
