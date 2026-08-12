import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPLICATION_LOCALE_TAGS,
  resolveApplicationLocale,
  resolveLanguagePreference,
} from './applicationLocales.ts';

test('ships exactly Turkish, English, and Arabic', () => {
  assert.deepEqual(APPLICATION_LOCALE_TAGS, ['tr', 'en', 'ar']);
});
test('resolves supported BCP-47 locales and falls back to English', () => {
  assert.equal(resolveApplicationLocale('tr-TR', 'tr'), 'tr');
  assert.equal(resolveApplicationLocale('EN_us', 'en'), 'en');
  assert.equal(resolveApplicationLocale('ar-Arab-EG', 'ar'), 'ar');
  assert.equal(resolveApplicationLocale(undefined, 'tr-TR'), 'tr');
  assert.equal(resolveApplicationLocale('de-DE', 'de'), 'en');
  assert.equal(resolveApplicationLocale(null, null), 'en');
});

test('manual preference wins over the device locale', () => {
  assert.equal(resolveLanguagePreference('ar', { languageTag: 'tr-TR' }), 'ar');
  assert.equal(resolveLanguagePreference('system', { languageTag: 'tr-TR' }), 'tr');
});
