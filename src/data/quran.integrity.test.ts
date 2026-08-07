import assert from 'node:assert/strict';
import test from 'node:test';
import { getAyah, getSurahAyahs, QURAN_AYAHS, QURAN_SURAHS, TANZIL_TEXT_SHA256 } from './quran.generated.ts';
import { positionPercent } from '../lib/quranProgress.ts';

const EXPECTED_TANZIL_SHA256 = 'ea8143cafe8d62bb0081385c4e3885b287879377ad84149e4a0cec9f95178458';

test('bundles the complete Tanzil Uthmani Quran without count drift', () => {
  assert.equal(QURAN_SURAHS.length, 114);
  assert.equal(QURAN_AYAHS.length, 6236);
  assert.equal(QURAN_SURAHS.reduce((sum, surah) => sum + surah.ayahCount, 0), 6236);
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
