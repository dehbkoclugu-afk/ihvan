import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { rowDirection, textAlignment } from '@/i18n/direction';
import { useT } from '@/i18n';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/tokens';

export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const t = useTheme();
  const { locale } = useT();
  return <View style={{ marginTop: spacing.xxl, marginBottom: spacing.md, flexDirection: rowDirection(locale), justifyContent: 'space-between', alignItems: 'center', gap: spacing.md }}><Text style={{ flex: 1, color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, textAlign: textAlignment(locale) }}>{title}</Text>{right ? <View style={{ flexShrink: 0 }}>{right}</View> : null}</View>;
}
