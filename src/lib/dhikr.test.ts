import assert from 'node:assert/strict';
import test from 'node:test';
import { dhikrCountForDay, incrementDailyDhikr, isDailyDhikrTargetReached } from './dhikr.ts';

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
