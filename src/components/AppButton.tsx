import { ActivityIndicator, Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { selectionFeedback } from '@/services/haptics';
import { fonts } from '@/theme/typography';
import { radius, spacing, touch } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function AppButton({ label, onPress, variant = 'primary', disabled = false, loading = false, accessibilityLabel, style }: { label: string; onPress: () => void; variant?: Variant; disabled?: boolean; loading?: boolean; accessibilityLabel?: string; style?: StyleProp<ViewStyle> }) {
  const colors = useTheme();
  const inactive = disabled || loading;
  const background = inactive ? colors.surfaceAlt : variant === 'primary' ? colors.gold : variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.surface : 'transparent';
  const foreground = inactive ? colors.inkFaint : variant === 'primary' ? colors.onGold : variant === 'danger' ? '#FFFFFF' : variant === 'ghost' ? colors.gold : colors.ink;
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel ?? label}
    accessibilityState={{ disabled: inactive, busy: loading }}
    disabled={inactive}
    onPress={() => { selectionFeedback(); onPress(); }}
    style={({ pressed }) => [{ minHeight: touch.minimum, borderRadius: radius.pill, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: background, borderWidth: variant === 'secondary' ? 1 : 0, borderColor: colors.border, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}
  >{loading ? <ActivityIndicator color={foreground} /> : <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: foreground, fontFamily: fonts.sansBold, fontSize: 14 }}>{label}</Text>}</Pressable>;
}
