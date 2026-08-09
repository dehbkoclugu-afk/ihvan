import { dayKey } from './dates.ts';

export const DAILY_DHIKR_TARGET = 33;

export interface DailyDhikrCount {
  day: string;
  count: number;
}

export type DhikrHistory = Record<string, number>;

export function normalizeDhikrCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function normalizeDhikrHistory(history: unknown): DhikrHistory {
  if (!history || typeof history !== 'object' || Array.isArray(history)) return {};
  return Object.fromEntries(
    Object.entries(history).map(([day, count]) => [day, normalizeDhikrCount(count)]),
  );
}

export function recentDhikrDayKeys(days: number, now = new Date()): string[] {
  if (days <= 0) return [];
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    return dayKey(date);
  });
}

export function dhikrHistoryWithLegacy(history: DhikrHistory = {}, storedDay: string | null, count: number): DhikrHistory {
  if (!storedDay || count <= 0 || (history[storedDay] ?? 0) >= count) return history;
  return { ...history, [storedDay]: Math.max(0, count) };
}

export function pruneDhikrHistory(history: unknown, keepDays = 90, now = new Date()): DhikrHistory {
  const keep = new Set(recentDhikrDayKeys(keepDays, now));
  return Object.fromEntries(Object.entries(normalizeDhikrHistory(history)).filter(([key]) => keep.has(key)));
}

export function retainDhikrState(
  storedDay: unknown,
  count: unknown,
  history: unknown = {},
  keepDays = 90,
  now = new Date(),
): { day: string | null; count: number; history: DhikrHistory } {
  const keep = new Set(recentDhikrDayKeys(keepDays, now));
  const retainedDay = typeof storedDay === 'string' && keep.has(storedDay) ? storedDay : null;
  const retainedCount = retainedDay ? normalizeDhikrCount(count) : 0;
  const withLegacy = dhikrHistoryWithLegacy(normalizeDhikrHistory(history), retainedDay, retainedCount);
  return {
    day: retainedDay,
    count: retainedCount,
    history: pruneDhikrHistory(withLegacy, keepDays, now),
  };
}

export function dhikrSummary(history: DhikrHistory, days: number, now = new Date()) {
  const counts = recentDhikrDayKeys(days, now).map((key) => normalizeDhikrCount(history[key]));
  return {
    total: counts.reduce((sum, value) => sum + value, 0),
    activeDays: counts.filter((value) => value > 0).length,
    targetDays: counts.filter((value) => isDailyDhikrTargetReached(value)).length,
  };
}

export function dhikrTargetStreak(history: DhikrHistory, days = 90, now = new Date()) {
  const reached = recentDhikrDayKeys(days, now).map((key) => isDailyDhikrTargetReached(history[key] ?? 0));
  const currentStart = reached[0] ? 0 : 1;
  let current = 0;
  for (let index = currentStart; index < reached.length && reached[index]; index += 1) current += 1;
  let best = 0;
  let run = 0;
  for (const complete of reached) {
    run = complete ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { current, best };
}

export function dhikrCountForDay(storedDay: string | null, count: number, date = new Date()): number {
  return storedDay === dayKey(date) ? normalizeDhikrCount(count) : 0;
}

export function incrementDailyDhikr(storedDay: string | null, count: number, date = new Date()): DailyDhikrCount {
  const today = dayKey(date);
  return {
    day: today,
    count: storedDay === today ? normalizeDhikrCount(count) + 1 : 1,
  };
}

export function isDailyDhikrTargetReached(count: number, target = DAILY_DHIKR_TARGET): boolean {
  return target > 0 && count >= target;
}
