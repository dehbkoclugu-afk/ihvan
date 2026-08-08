import { dayKey } from './dates.ts';

export type QuranReadingDays = Record<string, string[]>;
export type QuranReadingGoal = 5 | 10 | 20;

export function recentQuranDayKeys(days: number, now = new Date()): string[] {
  return Array.from({ length: Math.max(0, days) }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    return dayKey(date);
  });
}

export function recordAyahRead(readingDays: QuranReadingDays, ayahKey: string, date = new Date(), keepDays = 90): QuranReadingDays {
  const today = dayKey(date);
  const current = readingDays[today] ?? [];
  const next = current.includes(ayahKey) ? current : [...current, ayahKey];
  const keep = new Set(recentQuranDayKeys(keepDays, date));
  return Object.fromEntries(Object.entries({ ...readingDays, [today]: next }).filter(([key]) => keep.has(key)));
}

export function quranReadCount(readingDays: QuranReadingDays, date = new Date()): number {
  return readingDays[dayKey(date)]?.length ?? 0;
}

export function quranGoalPercent(readCount: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, readCount) / goal) * 100));
}

export function quranReadingSummary(readingDays: QuranReadingDays, days: number, now = new Date()): { ayahs: number; activeDays: number } {
  const counts = recentQuranDayKeys(days, now).map((key) => readingDays[key]?.length ?? 0);
  return {
    ayahs: counts.reduce((sum, count) => sum + count, 0),
    activeDays: counts.filter((count) => count > 0).length,
  };
}

export function quranReadingStreak(readingDays: QuranReadingDays, days = 90, now = new Date()): { current: number; best: number } {
  const active = recentQuranDayKeys(days, now).map((key) => (readingDays[key]?.length ?? 0) > 0);
  const currentStart = active[0] ? 0 : 1;
  let current = 0;
  for (let index = currentStart; index < active.length && active[index]; index += 1) current += 1;

  let best = 0;
  let run = 0;
  for (const isActive of active) {
    run = isActive ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { current, best };
}
