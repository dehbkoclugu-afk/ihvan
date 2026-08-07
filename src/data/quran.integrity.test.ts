import assert from 'node:assert/strict';
import test from 'node:test';
import { getAyah, getJuzAyahs, getSurahAyahs, QURAN_AYAHS, QURAN_JUZS, QURAN_SURAHS, TANZIL_TEXT_SHA256 } from './quran.generated.ts';
import { positionPercent } from '../lib/quranProgress.ts';

const EXPECTED_TANZIL_SHA256 = 'ea8143cafe8d62bb0081385c4e3885b287879377ad84149e4a0cec9f95178458';

test('bundles the complete Tanzil Uthmani Quran without count drift', () => {
  assert.equal(QURAN_SURAHS.length, 114);
  assert.equal(QURAN_AYAHS.length, 6236);
  assert.equal(QURAN_SURAHS.reduce((sum, surah) => sum + surah.ayahCount, 0), 6236);
});

test('derives all 30 juz boundaries from the Tanzil metadata', () => {
  assert.equal(QURAN_JUZS.length, 30);
  assert.equal(QURAN_JUZS.reduce((sum, juz) => sum + juz.ayahCount, 0), 6236);
  assert.deepEqual([QURAN_JUZS[0].startSurah, QURAN_JUZS[0].startAyah], [1, 1]);
  assert.deepEqual([QURAN_JUZS[1].startSurah, QURAN_JUZS[1].startAyah], [2, 142]);
  assert.deepEqual([QURAN_JUZS[29].startSurah, QURAN_JUZS[29].startAyah], [78, 1]);
  assert.deepEqual(getJuzAyahs(30)[0], getAyah(78, 1));
  assert.equal(getJuzAyahs(31).length, 0);
});

test('matches the reviewed Tanzil source fingerprint', () => {
  assert.equal(TANZIL_TEXT_SHA256, EXPECTED_TANZIL_SHA256);
});

test('indexes surahs and ayahs deterministically', () => {
  assert.equal(getSurahAyahs(1).length, 7);
  assert.equal(getSurahAyahs(2).length, 286);
  assert.equal(getAyah(1, 1)?.surah, 1);
  assert.equal(getAyah(114, 6)?.ayah, 6);
  assert.equal(getAyah(115, 1), undefined);
});

test('maps valid reading positions to a bounded mushaf percentage', () => {
  assert.equal(positionPercent(0, 1, 7, 6236), 0.1);
  assert.equal(positionPercent(6230, 6, 6, 6236), 100);
  assert.equal(positionPercent(0, 8, 7, 6236), 0);
});
