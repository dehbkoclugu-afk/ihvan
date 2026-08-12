import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { rowDirection, textAlignment } from '@/i18n/direction';
import type { QuranTextSize } from '@/lib/quranDisplay';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

const OPTIONS: { value: QuranTextSize; key: 'quranTextSize.small' | 'quranTextSize.medium' | 'quranTextSize.large' }[] = [
  { value: 'small', key: 'quranTextSize.small' },
  { value: 'medium', key: 'quranTextSize.medium' },
  { value: 'large', key: 'quranTextSize.large' },
];

export function QuranTextSizeControl() {
  const t = useTheme();
  const { locale, t: translate } = useT();
  const value = useUserStore((state) => state.quranTextSize);
  const setValue = useUserStore((state) => state.setQuranTextSize);

  return <View style={{ marginTop: spacing.md }}>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 11, marginBottom: spacing.xs, textAlign: textAlignment(locale) }}>{translate('quranTextSize.title')}</Text>
    <View accessibilityRole="radiogroup" style={{ flexDirection: rowDirection(locale), gap: spacing.xs }}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        const label = translate(option.key);
        return <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          accessibilityLabel={translate('quranTextSize.optionA11y', { size: label })}
          onPress={() => setValue(option.value)}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: selected ? t.gold : t.border,
            backgroundColor: selected ? t.goldSoft : t.surface,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: selected ? t.gold : t.inkSoft, fontFamily: selected ? fonts.sansBold : fonts.sansSemiBold, fontSize: 12 }}>{label}</Text>
        </Pressable>;
      })}
    </View>
  </View>;
}
