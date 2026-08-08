import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DEFAULT_PRAYER_NOTIFICATION_KEYS, prayerNotificationPlan, type PrayerNotificationKey, type PrayerReminderOffset } from './prayerTimes';

const CHANNEL_ID = 'prayer-times';
const IDENTIFIER_PREFIX = 'ihvan-prayer-';

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Namaz vakitleri',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

async function hasPermission() {
  const permission = await Notifications.getPermissionsAsync();
  return permission.status === 'granted';
}

export async function cancelPrayerNotifications() {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => item.identifier.startsWith(IDENTIFIER_PREFIX)).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

async function schedule(latitude: number, longitude: number, locationLabel: string, minutesBefore: PrayerReminderOffset, includedPrayers: readonly PrayerNotificationKey[]) {
  await cancelPrayerNotifications();
  const plan = prayerNotificationPlan(latitude, longitude, new Date(), 10, minutesBefore, includedPrayers);
  for (const item of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: item.identifier,
      content: {
        title: minutesBefore ? `${item.label} vaktine ${minutesBefore} dk kaldı` : `${item.label} vakti`,
        body: locationLabel,
        sound: 'default',
        data: { kind: 'prayer-time' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.time,
        channelId: CHANNEL_ID,
      },
    });
  }
  return plan.length;
}

export async function enablePrayerNotifications(latitude: number, longitude: number, locationLabel: string, minutesBefore: PrayerReminderOffset = 0, includedPrayers: readonly PrayerNotificationKey[] = DEFAULT_PRAYER_NOTIFICATION_KEYS) {
  if (Platform.OS === 'web') throw new Error('Vakit bildirimleri mobil uygulamada kullanılabilir.');
  await ensureChannel();
  let granted = await hasPermission();
  if (!granted) {
    const result = await Notifications.requestPermissionsAsync();
    granted = result.status === 'granted';
  }
  if (!granted) throw new Error('Bildirim izni verilmedi.');
  return schedule(latitude, longitude, locationLabel, minutesBefore, includedPrayers);
}

export async function refreshPrayerNotifications(latitude: number, longitude: number, locationLabel: string, minutesBefore: PrayerReminderOffset = 0, includedPrayers: readonly PrayerNotificationKey[] = DEFAULT_PRAYER_NOTIFICATION_KEYS) {
  if (Platform.OS === 'web') return false;
  await ensureChannel();
  if (!(await hasPermission())) return false;
  await schedule(latitude, longitude, locationLabel, minutesBefore, includedPrayers);
  return true;
}

export function configurePrayerNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
