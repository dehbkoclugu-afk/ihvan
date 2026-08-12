export const QURAN_PLAN_DAYS = [30, 60, 90] as const;
export type QuranPlanDays = typeof QURAN_PLAN_DAYS[number];
export const normalizeQuranPlanDays = (value: unknown): QuranPlanDays => value === 30 || value === 90 ? value : 60;
export function quranPlanSummary(read: unknown, total: unknown, days: unknown) {
  const safeTotal = Number.isInteger(total) && Number(total) > 0 ? Number(total) : 6236;
  const safeRead = Number.isFinite(read) ? Math.min(safeTotal, Math.max(0, Math.floor(Number(read)))) : 0;
  const safeDays = normalizeQuranPlanDays(days);
  const remaining = safeTotal - safeRead;
  return { total: safeTotal, read: safeRead, remaining, days: safeDays, dailyTarget: remaining ? Math.ceil(remaining / safeDays) : 0, percent: Math.round((safeRead / safeTotal) * 1000) / 10 };
}
