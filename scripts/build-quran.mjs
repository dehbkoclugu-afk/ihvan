import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const TEXT_SOURCE = new URL('../vendor/tanzil-quran-uthmani.txt', import.meta.url);
const META_SOURCE = new URL('../vendor/tanzil-quran-data.xml', import.meta.url);
const OUTPUT = new URL('../src/data/quran.generated.ts', import.meta.url);
const EXPECTED_AYAH_COUNT = 6236;
const EXPECTED_SURAH_COUNT = 114;

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  if (!match) throw new Error(`Missing ${name} in ${tag}`);
  return decodeXml(match[1]);
}

const [rawText, rawMeta] = await Promise.all([
  readFile(TEXT_SOURCE, 'utf8'),
  readFile(META_SOURCE, 'utf8'),
]);

const ayahLines = rawText.split(/\r?\n/).filter((line) => /^\d+\|\d+\|/.test(line));
if (ayahLines.length !== EXPECTED_AYAH_COUNT) {
  throw new Error(`Expected ${EXPECTED_AYAH_COUNT} ayahs, found ${ayahLines.length}`);
}

const ayahs = ayahLines.map((line) => {
  const match = line.match(/^(\d+)\|(\d+)\|(.*)$/u);
  if (!match) throw new Error(`Invalid Tanzil ayah line: ${line.slice(0, 40)}`);
  return { surah: Number(match[1]), ayah: Number(match[2]), text: match[3] };
});

const surahTags = rawMeta.match(/<sura index="\d+"[^>]*\/>/g) ?? [];
if (surahTags.length !== EXPECTED_SURAH_COUNT) {
  throw new Error(`Expected ${EXPECTED_SURAH_COUNT} surahs, found ${surahTags.length}`);
}

const surahs = surahTags.map((tag) => ({
  id: Number(attribute(tag, 'index')),
  ayahCount: Number(attribute(tag, 'ayas')),
  start: Number(attribute(tag, 'start')),
  arabicName: attribute(tag, 'name'),
  transliteration: attribute(tag, 'tname'),
  revelationPlace: attribute(tag, 'type') === 'Medinan' ? 'medinan' : 'meccan',
}));

for (const surah of surahs) {
  const count = ayahs.filter((ayah) => ayah.surah === surah.id).length;
  if (count !== surah.ayahCount) {
    throw new Error(`Surah ${surah.id}: metadata=${surah.ayahCount}, text=${count}`);
  }
}

const textSha256 = createHash('sha256').update(ayahLines.join('\n'), 'utf8').digest('hex');
const notice = rawText.split(/\r?\n/).filter((line) => line.startsWith('#')).join('\n');

const generated = `/**
 * GENERATED FILE — DO NOT EDIT QURAN TEXT BY HAND.
 * Source: Tanzil Project, Uthmani text, https://tanzil.net
 * License: Creative Commons Attribution 3.0
 * Verbatim distribution only. CHANGING THE QURAN TEXT IS NOT ALLOWED.
 */

export interface QuranAyah { surah: number; ayah: number; text: string }
export interface QuranSurah { id: number; ayahCount: number; start: number; arabicName: string; transliteration: string; revelationPlace: 'meccan' | 'medinan' }

export const TANZIL_TEXT_SHA256 = ${JSON.stringify(textSha256)};
export const TANZIL_NOTICE = ${JSON.stringify(notice)};
export const QURAN_SURAHS: QuranSurah[] = ${JSON.stringify(surahs)};
export const QURAN_AYAHS: QuranAyah[] = ${JSON.stringify(ayahs)};

export function getSurahAyahs(surahId: number): QuranAyah[] {
  const surah = QURAN_SURAHS[surahId - 1];
  if (!surah || surah.id !== surahId) return [];
  return QURAN_AYAHS.slice(surah.start, surah.start + surah.ayahCount);
}

export function getAyah(surah: number, ayah: number): QuranAyah | undefined {
  const meta = QURAN_SURAHS[surah - 1];
  if (!meta || ayah < 1 || ayah > meta.ayahCount) return undefined;
  return QURAN_AYAHS[meta.start + ayah - 1];
}
`;

await writeFile(OUTPUT, generated, 'utf8');
console.log(`Generated ${ayahs.length} ayahs / ${surahs.length} surahs / sha256 ${textSha256}`);
