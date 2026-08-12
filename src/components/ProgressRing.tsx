import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { clampProgress } from '@/components/progress';
import { useTheme } from '@/hooks/useTheme';
export { clampProgress } from '@/components/progress';

export interface ProgressRingProps { done: number; total: number; size?: number; strokeWidth?: number; color?: string; trackColor?: string; label?: string; summary?: string; style?: StyleProp<ViewStyle>; children?: ReactNode }
export function ProgressRing({ done, total, size = 76, strokeWidth = 6, color, trackColor, label, summary, style, children }: ProgressRingProps) {
  const theme = useTheme();
  const progress = clampProgress(done, total);
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const safeDone = safeTotal * progress;
  const count = Math.max(8, Math.min(24, Math.round(safeTotal) || 8));
  const filled = Math.round(progress * count);
  return <View accessibilityLabel={label} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: Math.max(1, safeTotal), now: safeDone, text: summary ?? `${safeDone}/${safeTotal}` }} style={[styles.ring, { width: size, height: size }, style]}>
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { borderColor: trackColor ?? theme.border, borderWidth: strokeWidth, borderRadius: size / 2 }]} />
    {Array.from({ length: count }, (_, index) => <View key={index} pointerEvents="none" style={[StyleSheet.absoluteFillObject, { transform: [{ rotate: `${(360 / count) * index}deg` }] }]}><View style={{ position: 'absolute', top: 0, left: size / 2 - strokeWidth / 2, width: strokeWidth, height: Math.max(strokeWidth * 1.6, 8), borderRadius: strokeWidth, backgroundColor: index < filled ? color ?? theme.gold : 'transparent' }} /></View>)}
    {children ? <View pointerEvents="none" style={styles.center}>{children}</View> : null}
  </View>;
}
const styles = StyleSheet.create({ ring: { alignItems: 'center', justifyContent: 'center', position: 'relative' }, center: { alignItems: 'center', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 } });
