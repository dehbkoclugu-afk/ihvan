import assert from 'node:assert/strict';
import test from 'node:test';
import { isPrayerDayComplete, normalizePrayerCompletions, prayerCompletionPercent, prayerCompletionStreak, prayerDayFilterMatches, prayerPercentFor, prunePrayerCompletions, recentDayKeys, type PrayerCompletions } from './prayerTracking.ts';

const now = new Date(2026, 7, 8, 12);

test('builds recent local day keys newest first', () => {
  assert.deepEqual(recentDayKeys(3, now), ['2026-08-08', '2026-08-07', '2026-08-06']);
});

test('calculates prayer completion over a seven-day window', () => {
  assert.equal(prayerCompletionPercent({
    '2026-08-08': ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'],
    '2026-08-07': ['fajr', 'dhuhr'],
  }, 7, now), 20);
  assert.equal(prayerCompletionPercent({}, 7, now), 0);
});

test('ignores duplicate and malformed persisted prayers in completion metrics', () => {
  const persisted = { '2026-08-08': ['fajr', 'fajr', 'dhuhr', 'invalid'] } as unknown as PrayerCompletions;
  assert.deepEqual(normalizePrayerCompletions(persisted['2026-08-08']), ['fajr', 'dhuhr']);
  assert.equal(prayerCompletionPercent(persisted, 1, now), 40);
});

test('calculates completion for one prayer over a window', () => {
  assert.equal(prayerPercentFor({
    '2026-08-08': ['fajr', 'isha'],
    '2026-08-07': ['fajr'],
    '2026-08-06': ['isha'],
  }, 'fajr', 4, now), 50);
  assert.equal(prayerPercentFor({}, 'isha', 0, now), 0);
});

test('prunes completion history outside the retention window', () => {
  const persisted = {
    '2026-08-08': ['fajr'],
    '2026-08-07': ['isha', 'isha', 'invalid'],
    '2026-08-06': ['dhuhr'],
  } as unknown as PrayerCompletions;
  assert.deepEqual(prunePrayerCompletions(persisted, 2, now), {
    '2026-08-08': ['fajr'],
    '2026-08-07': ['isha'],
  });
});

test('requires all five distinct prayers for a complete prayer day', () => {
  assert.equal(isPrayerDayComplete(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']), true);
  assert.equal(isPrayerDayComplete(['fajr', 'dhuhr', 'asr', 'maghrib']), false);
  assert.equal(isPrayerDayComplete(['fajr', 'fajr', 'dhuhr', 'asr', 'maghrib']), false);
});

test('filters prayer days by incomplete and complete state', () => {
  const complete = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
  assert.equal(prayerDayFilterMatches(complete, 'complete'), true);
  assert.equal(prayerDayFilterMatches(complete, 'incomplete'), false);
  assert.equal(prayerDayFilterMatches(['fajr', 'dhuhr'], 'incomplete'), true);
  assert.equal(prayerDayFilterMatches([], 'all'), true);
});

test('calculates current and best five-prayer streaks', () => {
  const full = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
  const completions = {
    '2026-08-08': [...full],
    '2026-08-07': [...full],
    '2026-08-05': [...full],
    '2026-08-04': [...full],
    '2026-08-03': [...full],
  };
  assert.deepEqual(prayerCompletionStreak(completions, 7, now), { current: 2, best: 3 });
});

test('keeps yesterday full-prayer streak active until a whole day is missed', () => {
  const full = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
  const completions = { '2026-08-07': [...full], '2026-08-06': [...full] };
  assert.deepEqual(prayerCompletionStreak(completions, 4, now), { current: 2, best: 2 });
  assert.deepEqual(prayerCompletionStreak(completions, 5, new Date(2026, 7, 9, 12)), { current: 0, best: 2 });
});
