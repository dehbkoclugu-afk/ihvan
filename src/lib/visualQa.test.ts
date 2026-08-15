import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveVisualQaConfig, VISUAL_QA_TARGET_ROUTES } from './visualQa.ts';

test('normalizes the visual QA deep-link configuration', () => {
  assert.deepEqual(resolveVisualQaConfig({
    locale: 'ar',
    theme: 'vigil',
    quranTextSize: 'large',
    target: 'paywall',
  }), {
    locale: 'ar',
    theme: 'vigil',
    quranTextSize: 'large',
    target: 'paywall',
  });
});

test('uses safe defaults for unsupported visual QA values', () => {
  assert.deepEqual(resolveVisualQaConfig({
    locale: ['de'],
    theme: 'sepia',
    quranTextSize: 'huge',
    target: 'data-reset',
  }), {
    locale: 'en',
    theme: 'dawn',
    quranTextSize: 'medium',
    target: 'today',
  });
});

test('keeps the Android smoke targets explicit and finite', () => {
  assert.deepEqual(Object.keys(VISUAL_QA_TARGET_ROUTES), [
    'onboarding',
    'today',
    'quran',
    'worship',
    'journal',
    'profile',
    'paywall',
  ]);
});
