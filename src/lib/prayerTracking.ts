import { dayKey } from './dates.ts';

export const TRACKED_PRAYERS = [
  { key: 'fajr', label: 'Sabah' },
  { key: 'dhuhr', label: 'Öğle' },
  { key: 'asr', label: 'İkindi' },
  { key: 'maghrib', label: 'Akşam' },
  { key: 'isha', label: 'Yatsı' },
] as const;

export type TrackedPrayerKey = (typeof TRACKED_PRAYERS)[number]['key'];
export type PrayerCompletions = Record<string, TrackedPrayerKey[]>;

export function recentDayKeys(days: number, now = new Date()): string[] {
  if (days <= 0) return [];
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    return dayKey(date);
  });
}

export function prayerCompletionPercent(completions: PrayerCompletions, days = 7, now = new Date()): number {
  const keys = recentDayKeys(days, now);
  if (!keys.length) return 0;
  const completed = keys.reduce((sum, key) => sum + Math.min(completions[key]?.length ?? 0, TRACKED_PRAYERS.length), 0);
  return Math.round((completed / (keys.length * TRACKED_PRAYERS.length)) * 100);
}

export function prayerPercentFor(completions: PrayerCompletions, prayer: TrackedPrayerKey, days = 30, now = new Date()): number {
  const keys = recentDayKeys(days, now);
  if (!keys.length) return 0;
  const completed = keys.reduce((sum, key) => sum + (completions[key]?.includes(prayer) ? 1 : 0), 0);
  return Math.round((completed / keys.length) * 100);
}

export function prunePrayerCompletions(completions: PrayerCompletions, keepDays = 90, now = new Date()): PrayerCompletions {
  const keep = new Set(recentDayKeys(keepDays, now));
  return Object.fromEntries(Object.entries(completions).filter(([key]) => keep.has(key)));
}
