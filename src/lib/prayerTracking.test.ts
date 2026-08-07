import assert from 'node:assert/strict';
import test from 'node:test';
import { prayerCompletionPercent, prayerPercentFor, prunePrayerCompletions, recentDayKeys } from './prayerTracking.ts';

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

test('calculates completion for one prayer over a window', () => {
  assert.equal(prayerPercentFor({
    '2026-08-08': ['fajr', 'isha'],
    '2026-08-07': ['fajr'],
    '2026-08-06': ['isha'],
  }, 'fajr', 4, now), 50);
  assert.equal(prayerPercentFor({}, 'isha', 0, now), 0);
});

test('prunes completion history outside the retention window', () => {
  assert.deepEqual(prunePrayerCompletions({
    '2026-08-08': ['fajr'],
    '2026-08-07': ['isha'],
    '2026-08-06': ['dhuhr'],
  }, 2, now), {
    '2026-08-08': ['fajr'],
    '2026-08-07': ['isha'],
  });
});
