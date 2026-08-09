import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from 'adhan';

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

const labels: Record<PrayerKey, string> = {
  fajr: 'İmsak',
  sunrise: 'Güneş',
  dhuhr: 'Öğle',
  asr: 'İkindi',
  maghrib: 'Akşam',
  isha: 'Yatsı',
};

const prayerKeys: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function prayerDay(latitude: number, longitude: number, date = new Date()): PrayerDay {
  const coordinates = new Coordinates(latitude, longitude);
  const times = new PrayerTimes(coordinates, date, CalculationMethod.Turkey());

  return {
    moments: prayerKeys.map((key) => ({
      key,
      label: labels[key],
      time: times[key],
      isPrayer: key !== 'sunrise',
    })),
    qibla: Qibla(coordinates),
    methodLabel: 'Adhan Turkey · Diyanet yöntemi yaklaşımı',
  };
}

export function nextPrayer(latitude: number, longitude: number, now = new Date()): PrayerMoment {
  const today = prayerDay(latitude, longitude, now).moments.filter((moment) => moment.isPrayer);
  const next = today.find((moment) => moment.time.getTime() > now.getTime());
  if (next) return next;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const first = prayerDay(latitude, longitude, tomorrow).moments.find((moment) => moment.key === 'fajr');
  if (!first) throw new Error('Tomorrow fajr could not be calculated');
  return first;
}

export function formatPrayerTime(date: Date, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);
}

export function formatPrayerCountdown(target: Date, now = new Date()): string {
  const remainingMinutes = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 60_000));
  if (!remainingMinutes) return 'şimdi';
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  if (!hours) return `${minutes} dk`;
  return minutes ? `${hours} sa ${minutes} dk` : `${hours} sa`;
}

export function compassTurn(qibla: number, heading: number): number {
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
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(from);
    date.setDate(date.getDate() + offset);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    for (const moment of prayerDay(latitude, longitude, date).moments) {
      const notificationTime = new Date(moment.time.getTime() - minutesBefore * 60_000);
      if (!moment.isPrayer || !included.has(moment.key) || notificationTime.getTime() <= from.getTime()) continue;
      plan.push({ identifier: `ihvan-prayer-${dateKey}-${moment.key}`, label: moment.label, time: notificationTime });
    }
  }
  return plan;
}
