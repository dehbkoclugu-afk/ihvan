import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { AyahCard } from '@/components/AyahCard';
import { Screen } from '@/components/Screen';
import { DAILY_AYAHS, FEATURED_SURAHS } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function SurahDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahId = Number(id);
  const surah = FEATURED_SURAHS.find((item) => item.id === surahId);
  const previews = DAILY_AYAHS.filter((ayah) => ayah.surahId === surahId);
  if (!surah) return <Screen><Text style={{ color: t.ink }}>Sûre bulunamadı.</Text></Screen>;
  return <Screen>
    <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <View style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: t.ink, fontSize: 34, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 30, marginTop: spacing.sm }}>{surah.name}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginTop: 5 }}>{surah.place} · {surah.verses} ayet</Text></View>
    {previews.length ? <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>{previews.map((ayah) => <AyahCard key={ayah.id} ayah={ayah} />)}</View> : <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl, marginTop: spacing.xxl }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 }}>Tam metin veri paketi hazırlanıyor</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22, marginTop: spacing.sm }}>Yanlış veya üretilmiş kutsal metin göstermemek için bu prototip yalnızca doğrulanmış başlangıç ayetlerini paketliyor.</Text></View>}
  </Screen>;
}
