import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { QURAN_SURAHS, getSurahAyahs } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function SurahDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahId = Number(id);
  const surah = QURAN_SURAHS.find((item) => item.id === surahId);
  if (!surah) return <Screen><Text style={{ color: t.ink }}>Sûre bulunamadı.</Text></Screen>;
  const ayahs = getSurahAyahs(surahId);

  return <Screen>
    <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <View style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: t.ink, fontSize: 34, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 30, marginTop: spacing.sm }}>{surah.transliteration}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginTop: 5 }}>{surah.revelationPlace === 'meccan' ? 'Mekke' : 'Medine'} · {surah.ayahCount} ayet</Text></View>
    <View style={{ backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.xl }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 }}>Şimdilik yalnızca doğrulanmış Arapça metin gösteriliyor. Meal ve tefsir için makine çevirisi kullanılmayacak.</Text></View>
    <View style={{ marginTop: spacing.lg }}>{ayahs.map((ayah) => <View key={`${ayah.surah}:${ayah.ayah}`} style={{ paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: t.border }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 12 }}>{ayah.ayah}</Text></View>
      <Text selectable style={{ color: t.ink, fontSize: 29, lineHeight: 52, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
    </View>)}</View>
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: spacing.xl }}>Kaynak: Tanzil Project · Uthmani Quran Text · CC BY 3.0</Text>
  </Screen>;
}
