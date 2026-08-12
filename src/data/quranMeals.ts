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
