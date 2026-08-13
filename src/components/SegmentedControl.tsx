import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { rowDirection } from '@/i18n/direction';
import { selectionFeedback } from '@/services/haptics';
import { fonts } from '@/theme/typography';
import { radius, spacing, touch } from '@/theme/tokens';

export interface SegmentOption<T extends string | number> { value: T; label: string; accessibilityLabel?: string }

export function SegmentedControl<T extends string | number>({ value, options, onChange, disabled = false, style }: { value: T; options: readonly SegmentOption<T>[]; onChange: (value: T) => void; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  const colors = useTheme();
  const { locale } = useT();
  return <View accessibilityRole="radiogroup" style={[{ flexDirection: rowDirection(locale), gap: spacing.sm }, style]}>
    {options.map((option) => {
      const selected = option.value === value;
      return <Pressable
        key={String(option.value)}
        accessibilityRole="radio"
        accessibilityLabel={option.accessibilityLabel ?? option.label}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={() => { selectionFeedback(); onChange(option.value); }}
        style={({ pressed }) => ({
          flex: 1,
          minWidth: 0,
          minHeight: touch.minimum,
          paddingHorizontal: spacing.sm,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: selected ? colors.gold : colors.border,
          backgroundColor: selected ? colors.gold : colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={{ color: selected ? colors.onGold : disabled ? colors.inkFaint : colors.inkSoft, fontFamily: selected ? fonts.sansBold : fonts.sansSemiBold, fontSize: 13 }}>{option.label}</Text>
      </Pressable>;
    })}
  </View>;
}
