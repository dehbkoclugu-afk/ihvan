import type { ArtworkPair, AssetId } from './registry.shared';
export { ART_IDS, artSpecs } from './registry.shared';
export type { ArtworkPair, AssetId, ArtSpec } from './registry.shared';

export const themedArtRegistry: Record<AssetId, ArtworkPair> = {
  'I1-brand-mark': { dawn: require('../../assets/brand-mark.png'), vigil: require('../../assets/brand-mark.png') },
  'I2-welcome-hero': { dawn: require('./art/I2-welcome-hero-dawn.webp'), vigil: require('./art/I2-welcome-hero-vigil.webp') },
  'I3-daily-ayah': { dawn: require('./art/I3-daily-ayah-dawn.webp'), vigil: require('./art/I3-daily-ayah-vigil.webp') },
  'I4-continue-quran': { dawn: require('./art/I4-continue-quran-dawn.webp'), vigil: require('./art/I4-continue-quran-vigil.webp') },
  'I5-prayer-times': { dawn: require('./art/I5-worship-dawn.webp'), vigil: require('./art/I5-worship-vigil.webp') },
  'I6-qibla': { dawn: require('./art/I5-worship-dawn.webp'), vigil: require('./art/I5-worship-vigil.webp') },
  'I7-dhikr': { dawn: require('./art/I5-worship-dawn.webp'), vigil: require('./art/I5-worship-vigil.webp') },
  'I8-dua': { dawn: require('./art/I5-worship-dawn.webp'), vigil: require('./art/I5-worship-vigil.webp') },
  'I9-night-reflection': { dawn: require('./art/I9-reflection-dawn.webp'), vigil: require('./art/I9-reflection-vigil.webp') },
  'I10-journal-empty': { dawn: require('./art/I9-reflection-dawn.webp'), vigil: require('./art/I9-reflection-vigil.webp') },
  'I11-journal-compose': { dawn: require('./art/I9-reflection-dawn.webp'), vigil: require('./art/I9-reflection-vigil.webp') },
  'I12-paywall-hero': { dawn: require('./art/I12-premium-dawn.webp'), vigil: require('./art/I12-premium-vigil.webp') },
};

export function getArtworkPair(id: AssetId): ArtworkPair | null {
  return Object.prototype.hasOwnProperty.call(themedArtRegistry, id) ? themedArtRegistry[id] : null;
}
