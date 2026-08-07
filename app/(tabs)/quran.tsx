import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { FEATURED_SURAHS } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Quran() {
  const t = useTheme();
  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>Kur’an</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22, marginTop: 6 }}>Arapça metni merkeze alan sakin okuma alanı.</Text>
    <SectionHeader title="Öne çıkan sûreler" />
    <View style={{ gap: spacing.sm }}>{FEATURED_SURAHS.map((surah) => <Pressable key={surah.id} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${surah.id}` } })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: radius.inner, opacity: pressed ? 0.75 : 1 })}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold }}>{surah.id}</Text></View>
      <View style={{ flex: 1, marginLeft: spacing.md }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 }}>{surah.name}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, marginTop: 2 }}>{surah.place} · {surah.verses} ayet</Text></View>
      <Text style={{ color: t.ink, fontSize: 20, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Ionicons name="chevron-forward" size={17} color={t.inkFaint} style={{ marginLeft: spacing.sm }} />
    </Pressable>)}</View>
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.xl }}>Tam mushaf, meal, tefsir ve ses paketi doğrulanmış içerik kaynağıyla yayın öncesinde bağlanacak.</Text>
  </Screen>;
}
