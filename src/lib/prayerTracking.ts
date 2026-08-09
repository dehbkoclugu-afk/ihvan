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
export type PrayerDayFilter = 'all' | 'incomplete' | 'complete';

export function normalizePrayerCompletions(completed: unknown): TrackedPrayerKey[] {
  if (!Array.isArray(completed)) return [];
  const selected = new Set(completed.filter((value): value is string => typeof value === 'string'));
  return TRACKED_PRAYERS.filter((prayer) => selected.has(prayer.key)).map((prayer) => prayer.key);
}

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
  const completed = keys.reduce((sum, key) => sum + normalizePrayerCompletions(completions[key]).length, 0);
  return Math.round((completed / (keys.length * TRACKED_PRAYERS.length)) * 100);
}

export function prayerPercentFor(completions: PrayerCompletions, prayer: TrackedPrayerKey, days = 30, now = new Date()): number {
  const keys = recentDayKeys(days, now);
  if (!keys.length) return 0;
  const completed = keys.reduce((sum, key) => sum + (normalizePrayerCompletions(completions[key]).includes(prayer) ? 1 : 0), 0);
  return Math.round((completed / keys.length) * 100);
}

export function isPrayerDayComplete(completed: unknown = []): boolean {
  const normalized = normalizePrayerCompletions(completed);
  return TRACKED_PRAYERS.every((prayer) => normalized.includes(prayer.key));
}

export function prayerDayFilterMatches(completed: unknown = [], filter: PrayerDayFilter): boolean {
  if (filter === 'all') return true;
  const complete = isPrayerDayComplete(completed);
  return filter === 'complete' ? complete : !complete;
}

export function prayerCompletionStreak(completions: PrayerCompletions, days = 90, now = new Date()): { current: number; best: number } {
  const complete = recentDayKeys(days, now).map((key) => isPrayerDayComplete(completions[key]));
  const currentStart = complete[0] ? 0 : 1;
  let current = 0;
  for (let index = currentStart; index < complete.length && complete[index]; index += 1) current += 1;

  let best = 0;
  let run = 0;
  for (const isComplete of complete) {
    run = isComplete ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { current, best };
}

export function prunePrayerCompletions(completions: PrayerCompletions, keepDays = 90, now = new Date()): PrayerCompletions {
  const keep = new Set(recentDayKeys(keepDays, now));
  return Object.fromEntries(
    Object.entries(completions)
      .filter(([key]) => keep.has(key))
      .map(([key, completed]) => [key, normalizePrayerCompletions(completed)]),
  );
}
