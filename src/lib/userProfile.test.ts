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
  }), {
    onboarded: false,
    name: 'Umut Can',
    themePreference: 'system',
    quranTextSize: 'large',
    language: 'system',
  });
  assert.deepEqual(normalizeUserPreferences(null), {
    onboarded: false,
    name: '',
    themePreference: 'system',
    quranTextSize: 'medium',
    language: 'system',
  });
});

test('normalizes missing and invalid application language to system', () => {
  assert.equal(normalizeUserPreferences({}).language, 'system');
  assert.equal(normalizeUserPreferences({ language: 'de' }).language, 'system');
  assert.equal(normalizeUserPreferences({ language: 'ar' }).language, 'ar');
});
