import type { ImageSourcePropType } from 'react-native';

export const ART_IDS = [
  'I1-brand-mark',
  'I2-welcome-hero',
  'I3-daily-ayah',
  'I4-continue-quran',
  'I5-prayer-times',
  'I6-qibla',
  'I7-dhikr',
  'I8-dua',
  'I9-night-reflection',
  'I10-journal-empty',
  'I11-journal-compose',
  'I12-paywall-hero',
] as const;

export type AssetId = (typeof ART_IDS)[number];
export interface ArtworkPair { dawn: ImageSourcePropType | null; vigil: ImageSourcePropType | null }
export interface ArtSpec { label: string; size: `${number}x${number}` }

export const artSpecs: Record<AssetId, ArtSpec> = {
  'I1-brand-mark': { label: 'İhvan brand mark', size: '512x512' },
  'I2-welcome-hero': { label: 'Welcome mihrab light', size: '1200x1600' },
  'I3-daily-ayah': { label: 'Daily ayah atmosphere', size: '1200x960' },
  'I4-continue-quran': { label: 'Continue Quran', size: '1200x720' },
  'I5-prayer-times': { label: 'Prayer times', size: '800x600' },
  'I6-qibla': { label: 'Qibla direction', size: '800x600' },
  'I7-dhikr': { label: 'Dhikr', size: '800x600' },
  'I8-dua': { label: 'Dua', size: '800x600' },
  'I9-night-reflection': { label: 'Night reflection', size: '1200x720' },
  'I10-journal-empty': { label: 'Journal empty state', size: '800x600' },
  'I11-journal-compose': { label: 'Journal composition', size: '800x600' },
  'I12-paywall-hero': { label: 'Premium architectural light', size: '1200x960' },
};
