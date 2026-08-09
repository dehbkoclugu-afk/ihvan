import assert from 'node:assert/strict';
import test from 'node:test';
import { completeRitualStep, isRitualComplete, normalizeRitualProgress, normalizeRitualSteps } from './ritual.ts';

test('requires all four daily ritual steps', () => {
  assert.equal(isRitualComplete([]), false);
  assert.equal(isRitualComplete(['ayah', 'meaning', 'dua']), false);
  assert.equal(isRitualComplete(['ayah', 'meaning', 'dua', 'dhikr']), true);
});

test('does not require ritual steps to be in display order', () => {
  assert.equal(isRitualComplete(['dhikr', 'ayah', 'dua', 'meaning']), true);
});

test('completes one ritual step idempotently', () => {
  assert.deepEqual(completeRitualStep(['ayah'], 'dhikr'), ['ayah', 'dhikr']);
  assert.deepEqual(completeRitualStep(['ayah', 'dhikr'], 'dhikr'), ['ayah', 'dhikr']);
});

test('normalizes persisted ritual steps to canonical unique values', () => {
  assert.deepEqual(normalizeRitualSteps(['dhikr', 'ayah', 'ayah', 'invalid', null]), ['ayah', 'dhikr']);
  assert.deepEqual(normalizeRitualSteps('ayah'), []);
});

test('repairs malformed persisted ritual streak state', () => {
  assert.deepEqual(normalizeRitualProgress({
    count: 4.8,
    bestCount: 2,
    lastTickDay: 'invalid',
    doneDay: '2026-08-09',
    doneSteps: ['dua', 'dua', 'bogus'],
  }), {
    count: 4,
    bestCount: 4,
    lastTickDay: null,
    doneDay: '2026-08-09',
    doneSteps: ['dua'],
  });
  assert.deepEqual(normalizeRitualProgress({ count: Number.POSITIVE_INFINITY, doneSteps: ['ayah'] }), {
    count: 0,
    bestCount: 0,
    lastTickDay: null,
    doneDay: null,
    doneSteps: [],
  });
});
