import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, nextStreak, dayOfYear, greetingFor } from './dates.ts';

test('dayKey formats local date', () => {
  assert.equal(dayKey(new Date(2026, 6, 21)), '2026-07-21');
});

test('nextStreak increments after consecutive day', () => {
  const today = new Date(2026, 6, 21);
  assert.equal(nextStreak('2026-07-20', 4, today), 5);
});

test('nextStreak is idempotent same day', () => {
  const today = new Date(2026, 6, 21);
  assert.equal(nextStreak('2026-07-21', 4, today), 4);
});

test('nextStreak resets after gap', () => {
  const today = new Date(2026, 6, 21);
  assert.equal(nextStreak('2026-07-18', 9, today), 1);
  assert.equal(nextStreak(null, 0, today), 1);
});

test('dayOfYear rotates content', () => {
  assert.equal(dayOfYear(new Date(2026, 0, 1)), 0);
  assert.equal(dayOfYear(new Date(2026, 0, 31)), 30);
});

test('greetingFor buckets hours', () => {
  assert.equal(greetingFor(6), 'morning');
  assert.equal(greetingFor(13), 'afternoon');
  assert.equal(greetingFor(21), 'evening');
});
