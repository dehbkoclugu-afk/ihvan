import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { QURAN_SURAHS, getAyah } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { QURAN_TEXT_METRICS } from '@/lib/quranDisplay';
import { useUserStore } from '@/state/useUserStore';

export default function Bookmarks() {
  const t = useTheme();
  const { bookmarks, toggleBookmark } = useQuranProgressStore();
  const metrics = QURAN_TEXT_METRICS[useUserStore((state) => state.quranTextSize)];
  const ayahs = useMemo(() => bookmarks.map((key) => {
    const [surah, ayah] = key.split(':').map(Number);
    return getAyah(surah, ayah);
  }).filter((ayah): ayah is NonNullable<typeof ayah> => Boolean(ayah)), [bookmarks]);

  return <Screen>
    <Pressable accessibilityLabel="Geri" onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.xl }}>Yer imleri</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 21, marginTop: 6 }}>{ayahs.length ? `${ayahs.length} kayıtlı ayet` : 'Henüz kayıtlı ayetin yok.'}</Text>

    {!ayahs.length ? <View style={{ backgroundColor: t.surface, borderRadius: radius.card, padding: spacing.xxl, alignItems: 'center', marginTop: spacing.xxl }}><Ionicons name="bookmark-outline" size={30} color={t.gold} /><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, marginTop: spacing.md }}>Okurken saklamak istediğin ayetlere yer imi ekleyebilirsin.</Text><Pressable onPress={() => router.replace('/(tabs)/quran')} style={{ backgroundColor: t.gold, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: 11, marginTop: spacing.lg }}><Text style={{ color: t.onGold, fontFamily: fonts.sansBold }}>Kur’an’a git</Text></Pressable></View> : <View style={{ gap: spacing.md, marginTop: spacing.xl }}>{ayahs.map((ayah) => {
      const surah = QURAN_SURAHS[ayah.surah - 1];
      const reference = `${surah.transliteration} · ${ayah.surah}:${ayah.ayah}`;
      return <View key={`${ayah.surah}:${ayah.ayah}`} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="bookmark" size={17} color={t.gold} /><Text style={{ flex: 1, color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 12, marginLeft: spacing.sm }}>{reference}</Text><Pressable accessibilityLabel={`${reference} yer imini kaldır`} hitSlop={8} onPress={() => toggleBookmark(ayah.surah, ayah.ayah)} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: t.goldSoft }}><Ionicons name="trash-outline" size={17} color={t.gold} /></Pressable></View>
        <Text selectable style={{ color: t.ink, fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
        <Pressable onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${ayah.surah}`, ayah: `${ayah.ayah}` } })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: spacing.md, opacity: pressed ? 0.65 : 1 })}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>Sûrede aç</Text><Ionicons name="arrow-forward" size={15} color={t.gold} style={{ marginLeft: 5 }} /></Pressable>
      </View>;
    })}</View>}

    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: spacing.xl }}>Arapça Kur’an metni: Tanzil Project · Uthmani Quran Text · CC BY 3.0 · verbatim</Text>
  </Screen>;
}
