import assert from 'node:assert/strict';
import test from 'node:test';
import ar from './locales/ar.ts';
import en from './locales/en.ts';
import tr from './locales/tr.ts';
import { translationFor } from './translations.ts';

const dictionaries = { en, tr, ar };
const sourceKeys = Object.keys(en).sort();
const tokens = (value: string) =>
  [...value.matchAll(/\{\{\s*[\w.-]+\s*\}\}/g)].map((match) => match[0].replace(/\s/g, '')).sort();

for (const [locale, dictionary] of Object.entries(dictionaries)) {
  test(`${locale} has exact key parity and valid values`, () => {
    assert.deepEqual(Object.keys(dictionary).sort(), sourceKeys);
    for (const key of sourceKeys) {
      const value = dictionary[key as keyof typeof dictionary];
      assert.equal(typeof value, 'string');
      assert.ok(value.trim(), `${locale}.${key}`);
      assert.doesNotMatch(value, /TODO|TRANSLATE_ME|MISSING_TRANSLATION/i);
      assert.deepEqual(tokens(value), tokens(en[key as keyof typeof en]), `${locale}.${key}`);
    }
  });
}

test('interpolates named values and keeps missing markers visible', () => {
  assert.equal(translationFor('en', 'common.of', { current: 2, total: 5 }), '2 of 5');
  assert.equal(translationFor('en', 'common.of', { current: 2 }), '2 of {{total}}');
});
