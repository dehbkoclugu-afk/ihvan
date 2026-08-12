import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeUserName, normalizeUserPreferences } from './userProfile.ts';

test('normalizes optional profile names consistently', () => {
  assert.equal(normalizeUserName('  Umut   Can  '), 'Umut Can');
  assert.equal(normalizeUserName('   '), '');
  assert.equal(normalizeUserName('abcdefgh', 5), 'abcde');
});

test('normalizes persisted onboarding and display preferences', () => {
  assert.deepEqual(normalizeUserPreferences({
    onboarded: 'true',
    name: '  Umut   Can  ',
    themePreference: 'unknown',
    quranTextSize: 'large',
    language: 'system',
    quranMeal: 'tr',
  }), {
    onboarded: false,
    name: 'Umut Can',
    themePreference: 'system',
    quranTextSize: 'large',
    language: 'system',
    quranMeal: 'tr',
  });
  assert.deepEqual(normalizeUserPreferences(null), {
    onboarded: false,
    name: '',
    themePreference: 'system',
    quranTextSize: 'medium',
    language: 'system',
    quranMeal: 'none',
  });
});

test('normalizes missing and invalid application language to system', () => {
  assert.equal(normalizeUserPreferences({}).language, 'system');
  assert.equal(normalizeUserPreferences({ language: 'de' }).language, 'system');
  assert.equal(normalizeUserPreferences({ language: 'ar' }).language, 'ar');
});

test('normalizes meal independently from application language', () => {
  assert.equal(normalizeUserPreferences({ language: 'ar', quranMeal: 'tr' }).quranMeal, 'tr');
  assert.equal(normalizeUserPreferences({ language: 'tr', quranMeal: 'en' }).quranMeal, 'en');
  assert.equal(normalizeUserPreferences({ language: 'en', quranMeal: 'ar' }).quranMeal, 'none');
  assert.equal(normalizeUserPreferences({}).quranMeal, 'none');
});
