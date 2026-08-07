/** Pure date helpers for streaks and daily content rotation (local time). */

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(d: Date = new Date()): string {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return dayKey(y);
}

/** 0-based day of year, used to rotate 365-day content. */
export function dayOfYear(d: Date = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export function greetingFor(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Given the last day the streak was ticked and the current streak count,
 * returns the new count for a tick happening "today".
 */
export function nextStreak(
  lastTickDay: string | null,
  count: number,
  today: Date = new Date(),
): number {
  const todayK = dayKey(today);
  if (lastTickDay === todayK) return count; // already ticked
  if (lastTickDay === yesterdayKey(today)) return count + 1;
  return 1; // broken or first day
}
