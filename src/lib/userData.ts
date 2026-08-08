export interface UserDataExportInput {
  profile: {
    name: string;
    themePreference: string;
    quranTextSize: string;
  };
  prayerTracking: { completions: Record<string, string[]> };
  quranProgress: {
    lastRead: { surah: number; ayah: number; updatedAt: string } | null;
    bookmarks: string[];
    readingDays: Record<string, string[]>;
    readAyahs: string[];
    readingGoal: number;
  };
  journal: { entries: { id: string; text: string; createdAt: string }[] };
  dhikr: { day: string | null; count: number };
  ritual: {
    count: number;
    bestCount: number;
    lastTickDay: string | null;
    doneDay: string | null;
    doneSteps: string[];
  };
  prayerSettings: {
    notificationsEnabled: boolean;
    reminderMinutesBefore: number;
    notificationPrayers: string[];
  };
}

export function buildUserDataExport(input: UserDataExportInput, exportedAt = new Date()) {
  return {
    format: 'ihvan-user-data',
    version: 1,
    exportedAt: exportedAt.toISOString(),
    ...input,
  };
}
