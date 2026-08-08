import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { QuranTextSize } from '@/lib/quranDisplay';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

const OPTIONS: { value: QuranTextSize; label: string }[] = [
  { value: 'small', label: 'Küçük' },
  { value: 'medium', label: 'Orta' },
  { value: 'large', label: 'Büyük' },
];

export function QuranTextSizeControl() {
  const t = useTheme();
  const value = useUserStore((state) => state.quranTextSize);
  const setValue = useUserStore((state) => state.setQuranTextSize);

  return <View style={{ marginTop: spacing.md }}>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 11, marginBottom: spacing.xs }}>Kur’an yazı boyutu</Text>
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: spacing.xs }}>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          accessibilityLabel={`Kur’an yazı boyutu ${option.label}`}
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
          <Text style={{ color: selected ? t.gold : t.inkSoft, fontFamily: selected ? fonts.sansBold : fonts.sansSemiBold, fontSize: 12 }}>{option.label}</Text>
        </Pressable>;
      })}
    </View>
  </View>;
}
