import { getAyah } from './quran.generated';
import { ayahReference } from './quran';

const QURANIC_DUA_REFERENCES = [
  { surah: 2, ayah: 201 },
  { surah: 3, ayah: 8 },
  { surah: 25, ayah: 74 },
] as const;

export function dailyDua(date = new Date()) {
  const seed = Math.floor(date.getTime() / 86_400_000);
  const ref = QURANIC_DUA_REFERENCES[seed % QURANIC_DUA_REFERENCES.length];
  const source = getAyah(ref.surah, ref.ayah);

  if (!source) throw new Error(`Bundled Quran dua ayah missing: ${ref.surah}:${ref.ayah}`);

  return {
    title: 'Kur’an’dan dua',
    arabic: source.text,
    reference: ayahReference(source),
  };
}

export const DHIKR = [
  { title: 'Sübhanallah', target: 33 },
  { title: 'Elhamdülillah', target: 33 },
  { title: 'Allahu Ekber', target: 33 },
];
