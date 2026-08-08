export const RITUAL_STEPS = ['ayah', 'meaning', 'dua', 'dhikr'] as const;

export type RitualStep = (typeof RITUAL_STEPS)[number];

export function completeRitualStep(steps: readonly RitualStep[], step: RitualStep): RitualStep[] {
  return steps.includes(step) ? [...steps] : [...steps, step];
}

export function isRitualComplete(steps: readonly RitualStep[]): boolean {
  return RITUAL_STEPS.every((step) => steps.includes(step));
}
