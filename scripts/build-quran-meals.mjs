import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const ARABIC_SOURCE = new URL('../vendor/tanzil-quran-uthmani.txt', import.meta.url);
const OUTPUT = new URL('../src/data/quranMeals.generated.ts', import.meta.url);
const EXPECTED_COUNT = 6236;
const SOURCES = [
  {
    id: 'tr',
    key: 'turkish_rwwad',
    language: 'Turkish',
    title: 'Turkish Translation — Rowwad Translation Center',
    version: '1.0.4',
    sha256: '577ab9743a9cfae3235bc2393ed85cf3133c39c29bb32d16c7dc733a4d68d89e',
    url: 'https://quranenc.com/en/browse/turkish_rwwad',
    file: new URL('../vendor/quranenc/turkish_rwwad-v1.0.4.sqlite', import.meta.url),
  },
  {
    id: 'en',
    key: 'english_rwwad',
    language: 'English',
    title: 'English Translation — Rowwad Translation Center',
    version: '1.0.19',
    sha256: '77e2ede3d8e6d6b5c6e16ff78eda2d2b6cc0a6b7489c94a5dde4f7481f5fdee8',
    url: 'https://quranenc.com/en/browse/english_rwwad',
    file: new URL('../vendor/quranenc/english_rwwad-v1.0.19.sqlite', import.meta.url),
  },
];

const arabic = await readFile(ARABIC_SOURCE, 'utf8');
const coordinates = arabic.split(/\r?\n/).filter((line) => /^\d+\|\d+\|/u.test(line)).map((line) => {
  const match = line.match(/^(\d+)\|(\d+)\|/u);
  if (!match) throw new Error(`Invalid Arabic coordinate: ${line.slice(0, 40)}`);
  return `${Number(match[1])}:${Number(match[2])}`;
});

if (coordinates.length !== EXPECTED_COUNT || new Set(coordinates).size !== EXPECTED_COUNT) {
  throw new Error(`Arabic Quran coordinate drift: ${coordinates.length}`);
}

const generatedSources = [];
for (const source of SOURCES) {
  const raw = await readFile(source.file);
  const sha256 = createHash('sha256').update(raw).digest('hex');
  if (sha256 !== source.sha256) throw new Error(`${source.key}: unexpected SHA-256 ${sha256}`);

  const database = new DatabaseSync(fileURLToPath(source.file), { readOnly: true });
  const schema = database.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'translations'").get()?.sql;
  if (typeof schema !== 'string' || !schema.includes('"translation"') || !schema.includes('"footnotes"')) {
    database.close();
    throw new Error(`${source.key}: unexpected SQLite schema`);
  }

  const rows = database.prepare('SELECT id, sura, aya, translation, footnotes FROM translations ORDER BY id').all();
  database.close();
  if (rows.length !== EXPECTED_COUNT) throw new Error(`${source.key}: expected ${EXPECTED_COUNT} translations`);

  const seen = new Set();
  const entries = rows.map((item, index) => {
    const coordinate = `${Number(item.sura)}:${Number(item.aya)}`;
    if (seen.has(coordinate)) throw new Error(`${source.key}: duplicate ${coordinate}`);
    seen.add(coordinate);
    if (coordinate !== coordinates[index]) {
      throw new Error(`${source.key}: coordinate ${coordinate} does not match ${coordinates[index]} at index ${index}`);
    }
    if (Number(item.id) !== index + 1) throw new Error(`${source.key}: unexpected row id ${item.id} at ${coordinate}`);
    if (typeof item.translation !== 'string' || !item.translation.trim()) throw new Error(`${source.key}: blank ${coordinate}`);
    if (typeof item.footnotes !== 'string') throw new Error(`${source.key}: invalid footnotes at ${coordinate}`);
    if (item.translation !== item.translation.normalize('NFC') || item.footnotes !== item.footnotes.normalize('NFC')) {
      throw new Error(`${source.key}: non-NFC source content at ${coordinate}`);
    }
    return [item.translation, item.footnotes];
  });

  generatedSources.push({ ...source, entries });
}

const metadata = generatedSources.map(({ id, key, language, title, version, sha256, url }) => ({
  id,
  key,
  language,
  title,
  source: 'QuranEnc.com',
  url,
  version,
  sha256,
}));
const generated = `/**
 * GENERATED FILE — DO NOT EDIT MEAL TEXT OR FOOTNOTES BY HAND.
 * Human-authored translations of Quran meanings from QuranEnc.com.
 * Content must be redistributed without modification, addition, or deletion.
 */

export interface QuranMealMetadata { id: 'tr' | 'en'; key: string; language: string; title: string; source: string; url: string; version: string; sha256: string }
export type QuranMealEntry = readonly [text: string, footnotes: string];

export const QURAN_MEAL_METADATA: readonly QuranMealMetadata[] = ${JSON.stringify(metadata)};
export const QURAN_MEAL_TR: readonly QuranMealEntry[] = ${JSON.stringify(generatedSources.find((source) => source.id === 'tr').entries)};
export const QURAN_MEAL_EN: readonly QuranMealEntry[] = ${JSON.stringify(generatedSources.find((source) => source.id === 'en').entries)};
`;

await writeFile(OUTPUT, generated, 'utf8');
console.log(`Generated ${generatedSources.length} QuranEnc meals × ${EXPECTED_COUNT} ayahs with verbatim footnotes`);
