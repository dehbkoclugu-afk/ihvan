import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export function ProgressBar({ percent, height = 5, style }: { percent: number; height?: number; style?: StyleProp<ViewStyle> }) {
  const colors = useTheme();
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }} style={[{ height, borderRadius: height / 2, overflow: 'hidden', backgroundColor: colors.surfaceAlt }, style]}><View style={{ width: `${value}%`, height: '100%', borderRadius: height / 2, backgroundColor: colors.gold }} /></View>;
}
