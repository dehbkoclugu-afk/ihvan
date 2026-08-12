import type { ArtworkPair, AssetId } from './registry.shared.ts';
export * from './registry.shared.ts';

export const themedArtRegistry: Record<AssetId, ArtworkPair> = Object.fromEntries(
  (['I1-brand-mark', 'I2-welcome-hero', 'I3-daily-ayah', 'I4-continue-quran', 'I5-prayer-times', 'I6-qibla', 'I7-dhikr', 'I8-dua', 'I9-night-reflection', 'I10-journal-empty', 'I11-journal-compose', 'I12-paywall-hero'] as AssetId[])
    .map((id) => [id, { dawn: null, vigil: null }]),
) as Record<AssetId, ArtworkPair>;

export function getArtworkPair(id: AssetId): ArtworkPair | null {
  return Object.prototype.hasOwnProperty.call(themedArtRegistry, id) ? themedArtRegistry[id] : null;
}
