import assert from 'node:assert/strict';
import test from 'node:test';
import { isRitualComplete } from './ritual.ts';

test('requires all four daily ritual steps', () => {
  assert.equal(isRitualComplete([]), false);
  assert.equal(isRitualComplete(['ayah', 'meaning', 'dua']), false);
  assert.equal(isRitualComplete(['ayah', 'meaning', 'dua', 'dhikr']), true);
});

test('does not require ritual steps to be in display order', () => {
  assert.equal(isRitualComplete(['dhikr', 'ayah', 'dua', 'meaning']), true);
});
