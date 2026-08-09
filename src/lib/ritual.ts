export const RITUAL_STEPS = ['ayah', 'meaning', 'dua', 'dhikr'] as const;

export type RitualStep = (typeof RITUAL_STEPS)[number];

export interface RitualProgress {
  count: number;
  bestCount: number;
  lastTickDay: string | null;
  doneDay: string | null;
  doneSteps: RitualStep[];
}

function normalizeStreakCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function normalizeDay(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function normalizeRitualSteps(steps: unknown): RitualStep[] {
  if (!Array.isArray(steps)) return [];
  const selected = new Set(steps.filter((step): step is RitualStep => RITUAL_STEPS.includes(step as RitualStep)));
  return RITUAL_STEPS.filter((step) => selected.has(step));
}

export function normalizeRitualProgress(progress: unknown): RitualProgress {
  const candidate = progress && typeof progress === 'object' && !Array.isArray(progress)
    ? progress as Record<string, unknown>
    : {};
  const count = normalizeStreakCount(candidate.count);
  const doneDay = normalizeDay(candidate.doneDay);
  return {
    count,
    bestCount: Math.max(count, normalizeStreakCount(candidate.bestCount)),
    lastTickDay: normalizeDay(candidate.lastTickDay),
    doneDay,
    doneSteps: doneDay ? normalizeRitualSteps(candidate.doneSteps) : [],
  };
}

export function completeRitualStep(steps: readonly RitualStep[], step: RitualStep): RitualStep[] {
  return steps.includes(step) ? [...steps] : [...steps, step];
}

export function isRitualComplete(steps: readonly RitualStep[]): boolean {
  return RITUAL_STEPS.every((step) => steps.includes(step));
}
