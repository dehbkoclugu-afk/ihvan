import assert from 'node:assert/strict';
import test from 'node:test';
import { dhikrCountForDay, dhikrHistoryWithLegacy, dhikrSummary, dhikrTargetStreak, incrementDailyDhikr, isDailyDhikrTargetReached, pruneDhikrHistory } from './dhikr.ts';

const today = new Date(2026, 7, 8, 12);

test('keeps the current local-day dhikr count', () => {
  assert.equal(dhikrCountForDay('2026-08-08', 17, today), 17);
  assert.deepEqual(incrementDailyDhikr('2026-08-08', 17, today), { day: '2026-08-08', count: 18 });
});

test('starts a fresh dhikr count after the local day changes', () => {
  assert.equal(dhikrCountForDay('2026-08-07', 33, today), 0);
  assert.deepEqual(incrementDailyDhikr('2026-08-07', 33, today), { day: '2026-08-08', count: 1 });
});

test('does not surface a negative persisted count', () => {
  assert.equal(dhikrCountForDay('2026-08-08', -4, today), 0);
  assert.deepEqual(incrementDailyDhikr('2026-08-08', -4, today), { day: '2026-08-08', count: 1 });
});

test('recognizes the daily dhikr target without an off-by-one', () => {
  assert.equal(isDailyDhikrTargetReached(32), false);
  assert.equal(isDailyDhikrTargetReached(33), true);
  assert.equal(isDailyDhikrTargetReached(34), true);
});

test('carries legacy daily count into history without lowering a newer value', () => {
  assert.deepEqual(dhikrHistoryWithLegacy({}, '2026-08-08', 17), { '2026-08-08': 17 });
  assert.deepEqual(dhikrHistoryWithLegacy({ '2026-08-08': 20 }, '2026-08-08', 17), { '2026-08-08': 20 });
});

test('summarizes dhikr totals and target days', () => {
  assert.deepEqual(dhikrSummary({ '2026-08-08': 33, '2026-08-07': 12, '2026-08-06': 40 }, 7, today), { total: 85, activeDays: 3, targetDays: 2 });
});

test('requires the full target for current and best dhikr streaks', () => {
  const history = { '2026-08-08': 12, '2026-08-07': 33, '2026-08-06': 34, '2026-08-05': 2, '2026-08-04': 33 };
  assert.deepEqual(dhikrTargetStreak(history, 7, today), { current: 2, best: 2 });
});

test('prunes dhikr history outside retention', () => {
  assert.deepEqual(pruneDhikrHistory({ '2026-08-08': 33, '2026-08-07': 1, '2026-08-06': 9 }, 2, today), { '2026-08-08': 33, '2026-08-07': 1 });
});
