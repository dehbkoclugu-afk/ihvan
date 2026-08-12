import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View, type ImageProps, type StyleProp, type ViewStyle } from 'react-native';
import { artSpecs, type AssetId } from '@/assets/registry';
import { useArtwork } from '@/hooks/useArtwork';
import { useTheme } from '@/hooks/useTheme';
import { radius as radii, spacing } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

export type ArtSlotVariant = 'bare' | 'row' | 'card' | 'hero';
export interface ArtSlotProps { id: AssetId; height?: number; fit?: ImageProps['resizeMode']; radius?: number; variant?: ArtSlotVariant; style?: StyleProp<ViewStyle>; children?: ReactNode }
const heights: Record<ArtSlotVariant, number> = { bare: 160, row: 104, card: 180, hero: 280 };
const scrims: Record<ArtSlotVariant, number> = { bare: 0, row: 0.18, card: 0.3, hero: 0.46 };

export function ArtSlot({ id, height, fit = 'cover', radius = radii.card, variant = 'card', style, children }: ArtSlotProps) {
  const theme = useTheme();
  const artwork = useArtwork();
  const source = artwork.source(id);
  return <View style={[styles.container, { height: height ?? heights[variant], borderRadius: radius, backgroundColor: theme.surfaceAlt, borderColor: theme.border }, style]}>
    {source ? <Image accessible={false} accessibilityIgnoresInvertColors importantForAccessibility="no-hide-descendants" resizeMode={fit} source={source} style={StyleSheet.absoluteFillObject} /> : <Fallback id={id} />}
    {scrims[variant] ? <View accessible={false} importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: artwork.scrim, opacity: scrims[variant] }]} /> : null}
    {children ? <View style={styles.content}>{children}</View> : null}
  </View>;
}

function Fallback({ id }: { id: AssetId }) {
  const theme = useTheme();
  return <View accessible={false} importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.fallback]}>
    <View style={[styles.arch, { borderColor: theme.border, backgroundColor: theme.goldSoft }]} />
    <View style={[styles.orb, { backgroundColor: theme.goldSoft }]} />
    {__DEV__ ? <Text style={[styles.debug, { color: theme.inkSoft }]}>{artSpecs[id].label}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', position: 'relative' },
  content: { flex: 1, padding: spacing.lg },
  fallback: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  arch: { width: '34%', height: '82%', borderWidth: 1, borderTopLeftRadius: 999, borderTopRightRadius: 999, opacity: 0.65, position: 'absolute', bottom: '-18%' },
  orb: { width: 96, height: 96, borderRadius: 48, opacity: 0.45, position: 'absolute', right: -28, top: -30 },
  debug: { backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: radii.pill, fontFamily: fonts.sansMedium, fontSize: 11, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
