import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUserDataExport } from './userData.ts';

test('buildUserDataExport exports personal progress without bundled Quran text', () => {
  const result = buildUserDataExport({
    profile: { name: 'Umut', themePreference: 'dawn', quranTextSize: 'medium' },
    prayerTracking: { completions: { '2026-08-08': ['fajr'] } },
    quranProgress: {
      lastRead: { surah: 2, ayah: 255, updatedAt: '2026-08-08T06:00:00.000Z' },
      bookmarks: ['2:255'],
      readingDays: { '2026-08-08': ['2:255'] },
      readAyahs: ['2:255'],
      readingGoal: 5,
    },
    journal: { entries: [{ id: '1', text: 'Notum', createdAt: '2026-08-08T06:00:00.000Z' }] },
    dhikr: { day: '2026-08-08', count: 12 },
    ritual: { count: 1, bestCount: 3, lastTickDay: '2026-08-08', doneDay: '2026-08-08', doneSteps: ['quran'] },
    prayerSettings: { notificationsEnabled: true, reminderMinutesBefore: 10, notificationPrayers: ['fajr'] },
  }, new Date('2026-08-08T10:00:00.000Z'));

  assert.equal(result.format, 'ihvan-user-data');
  assert.equal(result.version, 1);
  assert.equal(result.exportedAt, '2026-08-08T10:00:00.000Z');
  assert.deepEqual(result.quranProgress.bookmarks, ['2:255']);
  assert.equal('quranText' in result, false);
  assert.equal(JSON.stringify(result).includes('arabicText'), false);
});
