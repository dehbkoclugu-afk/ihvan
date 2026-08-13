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
export interface ArtFocalPoint { x: number; y: number }
export interface ArtSpec { label: string; size: `${number}x${number}`; focalPoint: ArtFocalPoint }

export const artSpecs: Record<AssetId, ArtSpec> = {
  'I1-brand-mark': { label: 'İhvan brand mark', size: '1254x1254', focalPoint: { x: 0.5, y: 0.5 } },
  'I2-welcome-hero': { label: 'Welcome mihrab light', size: '1024x1536', focalPoint: { x: 0.5, y: 0.43 } },
  'I3-daily-ayah': { label: 'Daily ayah atmosphere', size: '1662x946', focalPoint: { x: 0.55, y: 0.52 } },
  'I4-continue-quran': { label: 'Continue Quran', size: '1777x885', focalPoint: { x: 0.35, y: 0.62 } },
  'I5-prayer-times': { label: 'Prayer times', size: '1536x1024', focalPoint: { x: 0.25, y: 0.68 } },
  'I6-qibla': { label: 'Qibla direction', size: '1536x1024', focalPoint: { x: 0.25, y: 0.68 } },
  'I7-dhikr': { label: 'Dhikr', size: '1536x1024', focalPoint: { x: 0.28, y: 0.67 } },
  'I8-dua': { label: 'Dua', size: '1536x1024', focalPoint: { x: 0.25, y: 0.62 } },
  'I9-night-reflection': { label: 'Night reflection', size: '1536x1024', focalPoint: { x: 0.66, y: 0.67 } },
  'I10-journal-empty': { label: 'Journal empty state', size: '1536x1024', focalPoint: { x: 0.66, y: 0.67 } },
  'I11-journal-compose': { label: 'Journal composition', size: '1536x1024', focalPoint: { x: 0.66, y: 0.67 } },
  'I12-paywall-hero': { label: 'Premium architectural light', size: '1024x1536', focalPoint: { x: 0.5, y: 0.45 } },
};
