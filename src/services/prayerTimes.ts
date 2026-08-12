import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from 'adhan';
import type { AppLocale } from '../i18n/applicationLocales.ts';
import { translationFor } from '../i18n/translations.ts';

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type PrayerNotificationKey = Exclude<PrayerKey, 'sunrise'>;

export const DEFAULT_PRAYER_NOTIFICATION_KEYS: PrayerNotificationKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export interface PrayerMoment {
  key: PrayerKey;
  label: string;
  time: Date;
  isPrayer: boolean;
}

export interface PrayerDay {
  moments: PrayerMoment[];
  qibla: number;
  methodLabel: string;
}

export interface PrayerNotificationPlanItem {
  identifier: string;
  key: PrayerNotificationKey;
  label: string;
  time: Date;
}

export type PrayerReminderOffset = 0 | 5 | 10 | 15 | 30;

export interface PrayerNotificationSettings {
  notificationsEnabled: boolean;
  reminderMinutesBefore: PrayerReminderOffset;
  notificationPrayers: PrayerNotificationKey[];
}

const reminderOffsets: readonly PrayerReminderOffset[] = [0, 5, 10, 15, 30];

export function normalizePrayerNotificationSettings(value: unknown): PrayerNotificationSettings {
  const candidate = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const selected = Array.isArray(candidate.notificationPrayers)
    ? new Set(candidate.notificationPrayers)
    : new Set(DEFAULT_PRAYER_NOTIFICATION_KEYS);
  const notificationPrayers = DEFAULT_PRAYER_NOTIFICATION_KEYS.filter((key) => selected.has(key));
  const reminderMinutesBefore = reminderOffsets.includes(candidate.reminderMinutesBefore as PrayerReminderOffset)
    ? candidate.reminderMinutesBefore as PrayerReminderOffset
    : 0;
  return {
    notificationsEnabled: candidate.notificationsEnabled === true && notificationPrayers.length > 0,
    reminderMinutesBefore,
    notificationPrayers,
  };
}

const prayerKeys: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function isValidPrayerCoordinates(latitude: unknown, longitude: unknown): boolean {
  return typeof latitude === 'number'
    && Number.isFinite(latitude)
    && latitude >= -90
    && latitude <= 90
    && typeof longitude === 'number'
    && Number.isFinite(longitude)
    && longitude >= -180
    && longitude <= 180;
}

export function prayerDay(latitude: number, longitude: number, date = new Date(), locale: AppLocale = 'tr'): PrayerDay {
  if (!isValidPrayerCoordinates(latitude, longitude) || !Number.isFinite(date.getTime())) {
    throw new Error(translationFor(locale, 'prayerTimes.invalidInput'));
  }
  const coordinates = new Coordinates(latitude, longitude);
  const times = new PrayerTimes(coordinates, date, CalculationMethod.Turkey());

  return {
    moments: prayerKeys.map((key) => ({
      key,
      label: translationFor(locale, `prayer.${key}`),
      time: times[key],
      isPrayer: key !== 'sunrise',
    })),
    qibla: Qibla(coordinates),
    methodLabel: translationFor(locale, 'prayerTimes.method'),
  };
}

export function nextPrayer(latitude: number, longitude: number, now = new Date(), locale: AppLocale = 'tr'): PrayerMoment {
  const today = prayerDay(latitude, longitude, now, locale).moments.filter((moment) => moment.isPrayer);
  const next = today.find((moment) => moment.time.getTime() > now.getTime());
  if (next) return next;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const first = prayerDay(latitude, longitude, tomorrow, locale).moments.find((moment) => moment.key === 'fajr');
  if (!first) throw new Error('Tomorrow fajr could not be calculated');
  return first;
}

export function formatPrayerTime(date: Date, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone, locale: AppLocale = 'tr'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);
}

export function formatPrayerCountdown(target: Date, now = new Date(), locale: AppLocale = 'tr'): string {
  const remainingMinutes = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 60_000));
  if (!remainingMinutes) return translationFor(locale, 'prayerTimes.countdownNow');
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  if (!hours) return translationFor(locale, 'prayerTimes.countdownMinutes', { minutes });
  return minutes
    ? translationFor(locale, 'prayerTimes.countdownHoursMinutes', { hours, minutes })
    : translationFor(locale, 'prayerTimes.countdownHours', { hours });
}

export function compassTurn(qibla: number, heading: number): number {
  if (!Number.isFinite(qibla) || !Number.isFinite(heading)) return 0;
  return ((qibla - heading) % 360 + 360) % 360;
}

export function prayerNotificationPlan(
  latitude: number,
  longitude: number,
  from = new Date(),
  days = 10,
  minutesBefore: PrayerReminderOffset = 0,
  includedPrayers: readonly PrayerNotificationKey[] = DEFAULT_PRAYER_NOTIFICATION_KEYS,
): PrayerNotificationPlanItem[] {
  const plan: PrayerNotificationPlanItem[] = [];
  const included = new Set<PrayerKey>(includedPrayers);
  const boundedDays = Number.isFinite(days) ? Math.min(10, Math.max(0, Math.floor(days))) : 0;
  for (let offset = 0; offset < boundedDays; offset += 1) {
    const date = new Date(from);
    date.setDate(date.getDate() + offset);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    for (const moment of prayerDay(latitude, longitude, date).moments) {
      const notificationTime = new Date(moment.time.getTime() - minutesBefore * 60_000);
      if (!moment.isPrayer || moment.key === 'sunrise' || !included.has(moment.key) || notificationTime.getTime() <= from.getTime()) continue;
      plan.push({ identifier: `ihvan-prayer-${dateKey}-${moment.key}`, key: moment.key, label: moment.label, time: notificationTime });
    }
  }
  return plan;
}
