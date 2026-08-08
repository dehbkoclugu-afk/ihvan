import assert from 'node:assert/strict';
import test from 'node:test';
import { quranGoalPercent, quranReadCount, quranReadingStreak, quranReadingSummary, recentQuranDayKeys, recordAyahRead } from './quranHabit.ts';

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

test('summarizes Quran reading over a bounded recent window', () => {
  const readingDays = { '2026-08-08': ['2:1', '2:2'], '2026-08-07': [], '2026-08-06': ['1:1'], '2026-08-01': ['3:1'] };
  assert.deepEqual(recentQuranDayKeys(3, now), ['2026-08-08', '2026-08-07', '2026-08-06']);
  assert.deepEqual(quranReadingSummary(readingDays, 3, now), { ayahs: 3, activeDays: 2 });
});

test('calculates current and best Quran reading streaks', () => {
  const readingDays = {
    '2026-08-08': ['2:1'],
    '2026-08-07': ['2:2'],
    '2026-08-06': ['2:3'],
    '2026-08-04': ['3:1'],
    '2026-08-03': ['3:2'],
    '2026-08-02': ['3:3'],
    '2026-08-01': ['3:4'],
  };
  assert.deepEqual(quranReadingStreak(readingDays, 8, now), { current: 3, best: 4 });
});

test('keeps yesterday Quran streak active until today is missed', () => {
  const yesterdayActive = { '2026-08-07': ['1:1'], '2026-08-06': ['1:2'] };
  const stale = { ...yesterdayActive, '2026-08-05': [], '2026-08-04': ['1:3'] };
  assert.deepEqual(quranReadingStreak(yesterdayActive, 4, now), { current: 2, best: 2 });
  assert.deepEqual(quranReadingStreak(stale, 5, new Date(2026, 7, 9, 12)), { current: 0, best: 2 });
});
