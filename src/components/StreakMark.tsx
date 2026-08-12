import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export function StreakMark({ count, label, accessibilityLabel, compact = false }: { count: number; label: string; accessibilityLabel?: string; compact?: boolean }) {
  const theme = useTheme();
  return <View accessible accessibilityLabel={accessibilityLabel} style={{ minWidth: compact ? 58 : 72, minHeight: compact ? 58 : 72, borderRadius: radius.inner, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm }}>
    <View accessible={false} style={{ width: compact ? 18 : 22, height: compact ? 18 : 22, borderRadius: 999, borderWidth: 2, borderColor: theme.gold, borderTopColor: 'transparent', transform: [{ rotate: '-25deg' }] }} />
    <Text style={{ color: theme.ink, fontFamily: fonts.sansBold, fontSize: 12, marginTop: 2 }}>{count} {label}</Text>
  </View>;
}
