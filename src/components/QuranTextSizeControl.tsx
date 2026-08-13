import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { textAlignment } from '@/i18n/direction';
import type { QuranTextSize } from '@/lib/quranDisplay';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/tokens';
import { SegmentedControl } from './SegmentedControl';

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
    <SegmentedControl value={value} onChange={setValue} options={OPTIONS.map((option) => { const label = translate(option.key); return { value: option.value, label, accessibilityLabel: translate('quranTextSize.optionA11y', { size: label }) }; })} />
  </View>;
}
