export type QuranTextSize = 'small' | 'medium' | 'large';

export const QURAN_TEXT_METRICS: Record<QuranTextSize, { fontSize: number; lineHeight: number }> = {
  small: { fontSize: 25, lineHeight: 46 },
  medium: { fontSize: 29, lineHeight: 52 },
  large: { fontSize: 34, lineHeight: 60 },
};
