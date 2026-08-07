import assert from 'node:assert/strict';
import test from 'node:test';
import { quranGoalPercent, quranReadCount, recordAyahRead } from './quranHabit.ts';

const now = new Date(2026, 7, 8, 12);

test('records unique ayahs for the local day', () => {
  const once = recordAyahRead({}, '2:255', now);
  const twice = recordAyahRead(once, '2:255', now);
  const next = recordAyahRead(twice, '2:256', now);
  assert.deepEqual(next['2026-08-08'], ['2:255', '2:256']);
  assert.equal(quranReadCount(next, now), 2);
});

test('prunes Quran reading records outside retention', () => {
  const result = recordAyahRead({ '2026-08-07': ['1:1'], '2026-08-06': ['1:2'] }, '1:3', now, 2);
  assert.deepEqual(result, { '2026-08-07': ['1:1'], '2026-08-08': ['1:3'] });
});

test('caps daily Quran goal progress at one hundred percent', () => {
  assert.equal(quranGoalPercent(3, 5), 60);
  assert.equal(quranGoalPercent(8, 5), 100);
  assert.equal(quranGoalPercent(3, 0), 0);
});
