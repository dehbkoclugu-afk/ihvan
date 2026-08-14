import { QURAN_SURAHS } from './quran.generated.ts';
import { QURAN_MEAL_EN, QURAN_MEAL_METADATA, QURAN_MEAL_TR } from './quranMeals.generated.ts';
import { activeSource, type SacredSource } from './contentPolicy.ts';
import type { QuranMealPreference } from '../lib/quranDisplay.ts';

export { QURAN_MEAL_METADATA };

export interface QuranMealAyah {
  surah: number;
  ayah: number;
  text: string;
  footnotes: string;
}

export interface QuranMealSearchResult extends QuranMealAyah {
  reference: string;
}

export function searchQuranMeals(query: string, preference: QuranMealPreference, limit = 20): QuranMealSearchResult[] {
  if (preference === 'none' || !Number.isInteger(limit) || limit < 1) return [];
  const locale = preference === 'tr' ? 'tr-TR' : 'en';
  const needle = query.trim().toLocaleLowerCase(locale);
  if (needle.length < 2) return [];
  const entries = preference === 'tr' ? QURAN_MEAL_TR : QURAN_MEAL_EN;
  const results: QuranMealSearchResult[] = [];
  for (const surah of QURAN_SURAHS) {
    for (let ayah = 1; ayah <= surah.ayahCount; ayah += 1) {
      const entry = entries[surah.start + ayah - 1];
      if (!entry?.[0].toLocaleLowerCase(locale).includes(needle)) continue;
      results.push({ surah: surah.id, ayah, text: entry[0], footnotes: entry[1], reference: `${surah.transliteration} ${surah.id}:${ayah}` });
      if (results.length >= limit) return results;
    }
  }
  return results;
}

export function getQuranMealSource(preference: QuranMealPreference): SacredSource | undefined {
  return preference === 'none' ? undefined : activeSource('translation', preference);
}

export function getQuranMealAyah(surah: number, ayah: number, preference: QuranMealPreference): QuranMealAyah | undefined {
  if (preference === 'none') return undefined;
  const meta = QURAN_SURAHS[surah - 1];
  if (!meta || !Number.isInteger(ayah) || ayah < 1 || ayah > meta.ayahCount) return undefined;
  const entry = (preference === 'tr' ? QURAN_MEAL_TR : QURAN_MEAL_EN)[meta.start + ayah - 1];
  return entry?.[0] ? { surah, ayah, text: entry[0], footnotes: entry[1] } : undefined;
}
