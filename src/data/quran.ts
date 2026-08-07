import {
  QURAN_AYAHS,
  QURAN_SURAHS,
  getAyah,
  getSurahAyahs,
  type QuranAyah,
  type QuranSurah,
} from './quran.generated';

export { QURAN_AYAHS, QURAN_SURAHS, getAyah, getSurahAyahs };
export type { QuranAyah, QuranSurah };

export interface DailyAyah extends QuranAyah {
  id: string;
  reference: string;
}

// A small editorial rotation of verse references. The Arabic is never copied here:
// it always comes verbatim from the generated Tanzil Uthmani dataset.
const DAILY_REFERENCES = [
  [94, 5],
  [13, 28],
  [2, 286],
] as const;

export function ayahReference(ayah: Pick<QuranAyah, 'surah' | 'ayah'>): string {
  const surah = QURAN_SURAHS[ayah.surah - 1];
  return `${surah?.transliteration ?? ayah.surah} ${ayah.surah}:${ayah.ayah}`;
}

export function dailyAyah(date = new Date()): DailyAyah {
  const seed = Math.floor(date.getTime() / 86_400_000);
  const [surah, ayah] = DAILY_REFERENCES[seed % DAILY_REFERENCES.length];
  const source = getAyah(surah, ayah);

  if (!source) throw new Error(`Bundled Quran ayah missing: ${surah}:${ayah}`);

  return {
    ...source,
    id: `${surah}:${ayah}`,
    reference: ayahReference(source),
  };
}
