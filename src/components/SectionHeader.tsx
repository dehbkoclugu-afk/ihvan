import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/tokens';

export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ marginTop: spacing.xxl, marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18 }}>{title}</Text>{right}</View>;
}
