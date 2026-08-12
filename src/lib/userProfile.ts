import { normalizeQuranMealPreference, type QuranMealPreference } from './quranDisplay.ts';

export interface UserPreferences {
  onboarded: boolean;
  name: string;
  themePreference: 'dawn' | 'vigil' | 'system';
  quranTextSize: 'small' | 'medium' | 'large';
  language: 'system' | 'tr' | 'en' | 'ar';
  quranMeal: QuranMealPreference;
}

export function normalizeUserName(value: unknown, maxLength = 50): string {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim().slice(0, Math.max(0, maxLength))
    : '';
}

export function normalizeUserPreferences(value: unknown): UserPreferences {
  const candidate = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  const themePreference = candidate.themePreference === 'dawn' || candidate.themePreference === 'vigil'
    ? candidate.themePreference
    : 'system';
  const quranTextSize = candidate.quranTextSize === 'small' || candidate.quranTextSize === 'large'
    ? candidate.quranTextSize
    : 'medium';
  const language = candidate.language === 'tr' || candidate.language === 'en' || candidate.language === 'ar'
    ? candidate.language
    : 'system';
  return {
    onboarded: candidate.onboarded === true,
    name: normalizeUserName(candidate.name),
    themePreference,
    quranTextSize,
    language,
    quranMeal: normalizeQuranMealPreference(candidate.quranMeal),
  };
}
