import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeQuranReadAyahs, quranCompletedSectionCount, quranGoalPercent, quranNextUnreadKey, quranProgressFilterMatches, quranReadCount, quranReadingCoverage, quranReadingStreak, quranReadingSummary, quranSectionReadCounts, quranSurahReadCounts, recentQuranDayKeys, recentQuranReads, recordAyahRead } from './quranHabit.ts';

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

test('returns recent Quran reads newest day and newest ayah first', () => {
  const readingDays = { '2026-08-07': ['1:1'], '2026-08-08': ['2:1', '2:2'], '2026-08-06': ['3:1'] };
  assert.deepEqual(recentQuranReads(readingDays, 3), [
    { day: '2026-08-08', ayahKey: '2:2' },
    { day: '2026-08-08', ayahKey: '2:1' },
    { day: '2026-08-07', ayahKey: '1:1' },
  ]);
  assert.deepEqual(recentQuranReads(readingDays, 0), []);
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

test('merges permanent Quran coverage with existing reading history uniquely', () => {
  const readingDays = { '2026-08-08': ['1:1', '2:1'], '2026-08-07': ['1:1', '2:2'] };
  assert.deepEqual(mergeQuranReadAyahs(['1:1'], readingDays, '2:3'), ['1:1', '2:1', '2:2', '2:3']);
});

test('calculates unique Quran reading coverage without double counting history', () => {
  const readingDays = { '2026-08-08': ['1:1', '2:1'], '2026-08-07': ['1:1'] };
  assert.deepEqual(quranReadingCoverage(['1:1', '3:1'], readingDays, 10), { read: 3, total: 10, percent: 30 });
  assert.deepEqual(quranReadingCoverage(undefined, {}, 0), { read: 0, total: 0, percent: 0 });
});

test('counts unique read ayahs per surah and ignores invalid persisted keys', () => {
  const readingDays = { '2026-08-08': ['1:1', '2:1', '2:2', '2:99', 'bad'] };
  const counts = quranSurahReadCounts(['1:1', '1:2', '3:1', '0:1'], readingDays, [2, 3]);
  assert.deepEqual(counts, { 1: 2, 2: 2 });
});

test('counts read ayahs inside ordered Quran sections without double counting', () => {
  const keys = ['1:1', '1:2', '2:1', '2:2', '2:3'];
  const sections = [{ id: 1, start: 0, ayahCount: 2 }, { id: 2, start: 2, ayahCount: 3 }];
  const readingDays = { '2026-08-08': ['1:1', '2:2', 'not-in-quran'] };
  assert.deepEqual(quranSectionReadCounts(keys, ['1:1', '2:1'], readingDays, sections), { 1: 1, 2: 2 });
});

test('filters Quran sections by incomplete and complete progress', () => {
  assert.equal(quranProgressFilterMatches(0, 7, 'incomplete'), true);
  assert.equal(quranProgressFilterMatches(6, 7, 'incomplete'), true);
  assert.equal(quranProgressFilterMatches(7, 7, 'incomplete'), false);
  assert.equal(quranProgressFilterMatches(7, 7, 'complete'), true);
  assert.equal(quranProgressFilterMatches(0, 7, 'complete'), false);
  assert.equal(quranProgressFilterMatches(0, 0, 'all'), true);
});

test('counts only fully completed Quran sections', () => {
  const sections = [{ id: 1, ayahCount: 7 }, { id: 2, ayahCount: 286 }, { id: 3, ayahCount: 200 }];
  assert.equal(quranCompletedSectionCount({ 1: 7, 2: 285, 3: 201 }, sections), 2);
  assert.equal(quranCompletedSectionCount({}, sections), 0);
});

test('finds the next unread ayah after the current reading position and wraps once', () => {
  const keys = ['1:1', '1:2', '1:3', '2:1'];
  const readingDays = { '2026-08-08': ['1:3'] };
  assert.equal(quranNextUnreadKey(keys, ['1:1', '1:2'], readingDays, '1:2'), '2:1');
  assert.equal(quranNextUnreadKey(keys, ['1:1', '1:2', '2:1'], {}, '2:1'), '1:3');
  assert.equal(quranNextUnreadKey(keys, ['1:1'], {}), '1:2');
});

test('returns no next ayah when every ayah has been read', () => {
  const keys = ['1:1', '1:2'];
  assert.equal(quranNextUnreadKey(keys, ['1:1'], { '2026-08-08': ['1:2'] }, '1:1'), undefined);
  assert.equal(quranNextUnreadKey([], [], {}), undefined);
});
