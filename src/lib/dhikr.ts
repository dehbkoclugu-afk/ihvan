import { dayKey } from './dates.ts';

export const DAILY_DHIKR_TARGET = 33;

export interface DailyDhikrCount {
  day: string;
  count: number;
}

export function dhikrCountForDay(storedDay: string | null, count: number, date = new Date()): number {
  return storedDay === dayKey(date) ? Math.max(0, count) : 0;
}

export function incrementDailyDhikr(storedDay: string | null, count: number, date = new Date()): DailyDhikrCount {
  const today = dayKey(date);
  return {
    day: today,
    count: storedDay === today ? Math.max(0, count) + 1 : 1,
  };
}

export function isDailyDhikrTargetReached(count: number, target = DAILY_DHIKR_TARGET): boolean {
  return target > 0 && count >= target;
}
