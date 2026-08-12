export interface UserDataExportInput {
  profile: {
    name: string;
    themePreference: string;
    quranTextSize: string;
    language: string;
    quranMeal: string;
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
  dhikr: { day: string | null; count: number; history: Record<string, number> };
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

export function userDataExportFileName(exportedAt = new Date()): string {
  const timestamp = Number.isFinite(exportedAt.getTime()) ? exportedAt.toISOString() : new Date(0).toISOString();
  return `ihvan-verilerim-${timestamp.replace(/[:.]/g, '-')}.json`;
}

export function serializeUserDataExport(snapshot: ReturnType<typeof buildUserDataExport>): string {
  return JSON.stringify(snapshot, null, 2);
}

export function buildUserDataExport(input: UserDataExportInput, exportedAt = new Date()) {
  return {
    format: 'ihvan-user-data',
    version: 1,
    exportedAt: exportedAt.toISOString(),
    ...input,
  };
}
