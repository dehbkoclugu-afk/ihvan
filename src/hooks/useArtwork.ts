import { useCallback } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { getArtworkPair, type AssetId } from '@/assets/registry';
import { useThemeName } from '@/hooks/useTheme';

const colors = {
  dawn: { foreground: '#FFFCF6', foregroundMuted: 'rgba(255,252,246,0.76)', scrim: '#0E1220' },
  vigil: { foreground: '#F7F2E9', foregroundMuted: 'rgba(247,242,233,0.74)', scrim: '#05080F' },
} as const;

export function useArtwork() {
  const scheme = useThemeName();
  const source = useCallback((id: AssetId): ImageSourcePropType | null => getArtworkPair(id)?.[scheme] ?? null, [scheme]);
  return { scheme, source, ...colors[scheme] };
}
