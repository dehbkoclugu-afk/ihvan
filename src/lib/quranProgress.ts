export function positionPercent(startIndex: number, ayahNumber: number, ayahCount: number, totalAyahs: number): number {
  if (ayahNumber < 1 || ayahNumber > ayahCount || totalAyahs < 1) return 0;
  const absolutePosition = startIndex + ayahNumber;
  return Math.max(0.1, Math.round((absolutePosition / totalAyahs) * 1000) / 10);
}
