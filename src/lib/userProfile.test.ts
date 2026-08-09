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
  }), {
    onboarded: false,
    name: 'Umut Can',
    themePreference: 'system',
    quranTextSize: 'large',
  });
  assert.deepEqual(normalizeUserPreferences(null), {
    onboarded: false,
    name: '',
    themePreference: 'system',
    quranTextSize: 'medium',
  });
});
