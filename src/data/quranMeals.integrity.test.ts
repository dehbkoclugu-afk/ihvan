import assert from 'node:assert/strict';
import test from 'node:test';
import { SACRED_SOURCES } from './contentPolicy.ts';
import { getQuranMealAyah, getQuranMealSource, QURAN_MEAL_METADATA, searchQuranMeals } from './quranMeals.ts';
import { QURAN_MEAL_EN, QURAN_MEAL_TR } from './quranMeals.generated.ts';
import { normalizeQuranMealPreference } from '../lib/quranDisplay.ts';

test('bundles complete reviewed QuranEnc translation snapshots', () => {
  assert.equal(QURAN_MEAL_TR.length, 6236);
  assert.equal(QURAN_MEAL_EN.length, 6236);
  assert.ok(QURAN_MEAL_TR.every(([text, footnotes]) => text.trim().length > 0 && typeof footnotes === 'string'));
  assert.ok(QURAN_MEAL_EN.every(([text, footnotes]) => text.trim().length > 0 && typeof footnotes === 'string'));
  assert.deepEqual(QURAN_MEAL_METADATA.map(({ id, version, sha256 }) => ({ id, version, sha256 })), [
    { id: 'tr', version: '1.0.4', sha256: '577ab9743a9cfae3235bc2393ed85cf3133c39c29bb32d16c7dc733a4d68d89e' },
    { id: 'en', version: '1.0.19', sha256: '77e2ede3d8e6d6b5c6e16ff78eda2d2b6cc0a6b7489c94a5dde4f7481f5fdee8' },
  ]);
  assert.equal(QURAN_MEAL_TR.filter(([, footnotes]) => footnotes.length > 0).length, 29);
  assert.equal(QURAN_MEAL_EN.filter(([, footnotes]) => footnotes.length > 0).length, 2215);
});

test('looks up translations by explicit Quran coordinate', () => {
  assert.equal(getQuranMealAyah(1, 1, 'tr')?.text, 'Bismillâhirrahmânirrahîm');
  assert.equal(getQuranMealAyah(1, 1, 'en')?.text, 'In the name of Allah, the Most Compassionate, the Most Merciful.');
  assert.match(getQuranMealAyah(1, 2, 'en')?.text ?? '', /Allah\[1\]/u);
  assert.match(getQuranMealAyah(1, 2, 'en')?.footnotes ?? '', /^\[1\] Allah is God/u);
  assert.equal(getQuranMealAyah(114, 6, 'tr')?.surah, 114);
  assert.equal(getQuranMealAyah(0, 1, 'tr'), undefined);
  assert.equal(getQuranMealAyah(1, 8, 'en'), undefined);
  assert.equal(getQuranMealAyah(1, 1, 'none'), undefined);
});

test('activates only human-authored, attributed translation sources', () => {
  for (const language of ['tr', 'en'] as const) {
    const source = getQuranMealSource(language);
    assert.equal(source?.humanAuthored, true);
    assert.equal(source?.machineTranslated, false);
    assert.equal(source?.status, 'active');
    assert.ok(source?.license);
    assert.ok(source?.version);
  }
  assert.equal(SACRED_SOURCES.some((source) => source.kind === 'translation' && source.status === 'pending-license'), false);
});

test('searches the selected human-authored meal without changing its text', () => {
  const result = searchQuranMeals('merhamet', 'tr', 5);
  assert.ok(result.length > 0 && result.length <= 5);
  assert.ok(result.every((item) => getQuranMealAyah(item.surah, item.ayah, 'tr')?.text === item.text));
  assert.deepEqual(searchQuranMeals('merhamet', 'none'), []);
  assert.deepEqual(searchQuranMeals('a', 'tr'), []);
});

test('normalizes persisted meal preferences independently', () => {
  assert.equal(normalizeQuranMealPreference('tr'), 'tr');
  assert.equal(normalizeQuranMealPreference('en'), 'en');
  assert.equal(normalizeQuranMealPreference('ar'), 'none');
  assert.equal(normalizeQuranMealPreference(undefined), 'none');
});
