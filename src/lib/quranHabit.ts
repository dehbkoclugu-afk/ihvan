import { dayKey } from './dates.ts';

export type QuranReadingDays = Record<string, string[]>;
export type QuranReadingGoal = 5 | 10 | 20;
export type QuranProgressFilter = 'all' | 'incomplete' | 'complete';

export function mergeQuranReadAyahs(readAyahs: readonly string[] | undefined, readingDays: QuranReadingDays, ayahKey?: string): string[] {
  const keys = new Set(readAyahs ?? []);
  for (const dailyKeys of Object.values(readingDays)) {
    for (const key of dailyKeys) keys.add(key);
  }
  if (ayahKey) keys.add(ayahKey);
  return [...keys];
}

export function quranReadingCoverage(readAyahs: readonly string[] | undefined, readingDays: QuranReadingDays, totalAyahs = 6236): { read: number; total: number; percent: number } {
  const read = mergeQuranReadAyahs(readAyahs, readingDays).length;
  const total = Math.max(0, totalAyahs);
  const boundedRead = Math.min(read, total);
  return {
    read: boundedRead,
    total,
    percent: total ? Math.round((boundedRead / total) * 1000) / 10 : 0,
  };
}

export function quranProgressFilterMatches(readCount: number, totalCount: number, filter: QuranProgressFilter): boolean {
  if (filter === 'all') return true;
  const complete = totalCount > 0 && readCount >= totalCount;
  return filter === 'complete' ? complete : !complete;
}

export function quranCompletedSectionCount(
  readCounts: Readonly<Record<number, number>>,
  sections: readonly { id: number; ayahCount: number }[],
): number {
  return sections.filter((section) => section.ayahCount > 0 && (readCounts[section.id] ?? 0) >= section.ayahCount).length;
}

export function quranSurahReadCounts(
  readAyahs: readonly string[] | undefined,
  readingDays: QuranReadingDays,
  surahAyahCounts: readonly number[],
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const key of mergeQuranReadAyahs(readAyahs, readingDays)) {
    const match = key.match(/^(\d+):(\d+)$/);
    if (!match) continue;
    const surah = Number(match[1]);
    const ayah = Number(match[2]);
    const ayahCount = surahAyahCounts[surah - 1];
    if (!ayahCount || ayah < 1 || ayah > ayahCount) continue;
    counts[surah] = (counts[surah] ?? 0) + 1;
  }
  return counts;
}

export function quranSectionReadCounts(
  orderedAyahKeys: readonly string[],
  readAyahs: readonly string[] | undefined,
  readingDays: QuranReadingDays,
  sections: readonly { id: number; start: number; ayahCount: number }[],
): Record<number, number> {
  const read = new Set(mergeQuranReadAyahs(readAyahs, readingDays));
  const counts: Record<number, number> = {};
  for (const section of sections) {
    const start = Math.max(0, Math.floor(section.start));
    const end = Math.min(orderedAyahKeys.length, start + Math.max(0, Math.floor(section.ayahCount)));
    let count = 0;
    for (let index = start; index < end; index += 1) {
      if (read.has(orderedAyahKeys[index])) count += 1;
    }
    if (count) counts[section.id] = count;
  }
  return counts;
}

export function quranNextUnreadKey(
  orderedAyahKeys: readonly string[],
  readAyahs: readonly string[] | undefined,
  readingDays: QuranReadingDays,
  startAfterKey?: string,
): string | undefined {
  if (!orderedAyahKeys.length) return undefined;
  const read = new Set(mergeQuranReadAyahs(readAyahs, readingDays));

  const startIndex = startAfterKey ? orderedAyahKeys.indexOf(startAfterKey) : -1;
  for (let offset = 1; offset <= orderedAyahKeys.length; offset += 1) {
    const key = orderedAyahKeys[(startIndex + offset) % orderedAyahKeys.length];
    if (!read.has(key)) return key;
  }
  return undefined;
}

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
