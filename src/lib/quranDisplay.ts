export type QuranTextSize = 'small' | 'medium' | 'large';
export const QURAN_MEAL_PREFERENCES = ['none', 'tr', 'en'] as const;
export type QuranMealPreference = typeof QURAN_MEAL_PREFERENCES[number];

export function normalizeQuranMealPreference(value: unknown): QuranMealPreference {
  return value === 'tr' || value === 'en' ? value : 'none';
}

export const QURAN_TEXT_METRICS: Record<QuranTextSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 25, lineHeight: 46 },
  medium: { fontSize: 29, lineHeight: 52 },
  large: { fontSize: 34, lineHeight: 60 },
};
