import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { translate } from '@/i18n';
import { createSerialTaskQueue } from '@/lib/serialTaskQueue';
import { DEFAULT_PRAYER_NOTIFICATION_KEYS, prayerNotificationPlan, type PrayerNotificationKey, type PrayerReminderOffset } from './prayerTimes';

const CHANNEL_ID = 'prayer-times';
const IDENTIFIER_PREFIX = 'ihvan-prayer-';
const enqueueNotificationMutation = createSerialTaskQueue();

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: translate('prayerNotification.channelName'),
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

async function hasPermission() {
  const permission = await Notifications.getPermissionsAsync();
  return permission.status === 'granted';
}

async function cancelPrayerNotificationsNow() {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter((item) => item.identifier.startsWith(IDENTIFIER_PREFIX)).map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export function cancelPrayerNotifications() {
  return enqueueNotificationMutation(cancelPrayerNotificationsNow);
}

async function schedule(latitude: number, longitude: number, locationLabel: string, minutesBefore: PrayerReminderOffset, includedPrayers: readonly PrayerNotificationKey[]) {
  if (!includedPrayers.length) throw new Error(translate('prayerNotification.selectPrayer'));
  await cancelPrayerNotificationsNow();
  const plan = prayerNotificationPlan(latitude, longitude, new Date(), 10, minutesBefore, includedPrayers);
  const scheduledIdentifiers: string[] = [];
  try {
    for (const item of plan) {
      const prayer = translate(`prayer.${item.key}`);
      await Notifications.scheduleNotificationAsync({
        identifier: item.identifier,
        content: {
          title: minutesBefore
            ? translate('prayerNotification.titleBefore', { prayer, minutes: minutesBefore })
            : translate('prayerNotification.titleExact', { prayer }),
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
      scheduledIdentifiers.push(item.identifier);
    }
  } catch (cause) {
    // A failed batch must not leave an invisible partial reminder schedule.
    await Promise.allSettled(scheduledIdentifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)));
    throw cause;
  }
  return plan.length;
}

export async function enablePrayerNotifications(latitude: number, longitude: number, locationLabel: string, minutesBefore: PrayerReminderOffset = 0, includedPrayers: readonly PrayerNotificationKey[] = DEFAULT_PRAYER_NOTIFICATION_KEYS) {
  if (Platform.OS === 'web') throw new Error(translate('prayerNotification.mobileOnly'));
  await ensureChannel();
  let granted = await hasPermission();
  if (!granted) {
    const result = await Notifications.requestPermissionsAsync();
    granted = result.status === 'granted';
  }
  if (!granted) throw new Error(translate('prayerNotification.permissionDenied'));
  return enqueueNotificationMutation(() => schedule(latitude, longitude, locationLabel, minutesBefore, includedPrayers));
}

export async function refreshPrayerNotifications(latitude: number, longitude: number, locationLabel: string, minutesBefore: PrayerReminderOffset = 0, includedPrayers: readonly PrayerNotificationKey[] = DEFAULT_PRAYER_NOTIFICATION_KEYS) {
  if (Platform.OS === 'web') return false;
  await ensureChannel();
  if (!(await hasPermission())) return false;
  await enqueueNotificationMutation(() => schedule(latitude, longitude, locationLabel, minutesBefore, includedPrayers));
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
