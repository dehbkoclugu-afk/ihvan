import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { DAILY_DUA, DHIKR } from '@/data/duas';
import { useTheme } from '@/hooks/useTheme';
import { useDhikrStore } from '@/state/useDhikrStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Worship() {
  const t = useTheme();
  const { count, increment, reset } = useDhikrStore();
  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>İbadet</Text>
    <SectionHeader title={DAILY_DUA.title} />
    <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl }}><Text style={{ color: t.ink, fontSize: 30, lineHeight: 48, textAlign: 'right', writingDirection: 'rtl' }}>{DAILY_DUA.arabic}</Text><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, marginTop: spacing.md }}>{DAILY_DUA.reference}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22, marginTop: spacing.sm }}>{DAILY_DUA.note}</Text></View>
    <SectionHeader title="Zikir sayacı" right={<Pressable onPress={reset}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold }}>Sıfırla</Text></Pressable>} />
    <Pressable onPress={increment} style={({ pressed }) => ({ height: 190, backgroundColor: t.goldSoft, borderRadius: radius.hero, borderWidth: 1, borderColor: t.gold, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 58 }}>{count}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium, marginTop: 6 }}>dokun ve say</Text></Pressable>
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>{DHIKR.map((item) => <View key={item.title} style={{ flex: 1, paddingVertical: spacing.md, backgroundColor: t.surface, borderRadius: radius.inner, alignItems: 'center' }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{item.title}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>{item.target}</Text></View>)}</View>
    <SectionHeader title="Yakında" />
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22 }}>Konuma göre namaz vakitleri, kıble ve sesli sûre deneyimi bu çekirdeğin sıradaki native katmanı.</Text>
  </Screen>;
}
