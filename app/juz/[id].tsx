import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { QURAN_JUZS, QURAN_SURAHS, getJuzAyahs } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function JuzDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const juzId = Number(id);
  const juz = QURAN_JUZS.find((item) => item.id === juzId);
  const { lastRead, bookmarks, setLastRead, toggleBookmark } = useQuranProgressStore();

  if (!juz) return <Screen><Text style={{ color: t.ink }}>Cüz bulunamadı.</Text></Screen>;
  const ayahs = getJuzAyahs(juzId);

  return <Screen>
    <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <View style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 30 }}>{juz.id}. Cüz</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginTop: 5 }}>{juz.ayahCount} ayet · başlangıç {juz.startSurah}:{juz.startAyah}</Text></View>
    <View style={{ backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.xl }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 }}>Cüz sınırları Tanzil metadata’sından alınır. Kur’an metni değiştirilmeden gösterilir; makine/AI çevirisi kullanılmaz.</Text></View>
    {ayahs.map((ayah, index) => {
      const key = `${ayah.surah}:${ayah.ayah}`;
      const surah = QURAN_SURAHS[ayah.surah - 1];
      const previous = ayahs[index - 1];
      const startsSurah = !previous || previous.surah !== ayah.surah;
      const bookmarked = bookmarks.includes(key);
      const isLastRead = lastRead?.surah === ayah.surah && lastRead.ayah === ayah.ayah;
      return <View key={key}>
        {startsSurah ? <View style={{ alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.sm }}><Text style={{ color: t.ink, fontSize: 28, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, marginTop: 4 }}>{surah.transliteration} · {surah.id}</Text></View> : null}
        <View style={{ paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ minWidth: 42, height: 34, paddingHorizontal: 7, borderRadius: 17, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 11 }}>{ayah.surah}:{ayah.ayah}</Text></View>
            <View style={{ flex: 1 }} />
            <Pressable accessibilityLabel={bookmarked ? 'Yer imini kaldır' : 'Yer imi ekle'} hitSlop={8} onPress={() => toggleBookmark(ayah.surah, ayah.ayah)} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: bookmarked ? t.goldSoft : t.surface }}><Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? t.gold : t.inkSoft} /></Pressable>
            <Pressable accessibilityLabel="Burada kaldım" hitSlop={8} onPress={() => setLastRead(ayah.surah, ayah.ayah)} style={{ marginLeft: spacing.sm, height: 38, paddingHorizontal: spacing.md, borderRadius: radius.pill, flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: isLastRead ? t.gold : t.surface }}><Ionicons name={isLastRead ? 'checkmark' : 'flag-outline'} size={15} color={isLastRead ? t.onGold : t.inkSoft} /><Text style={{ color: isLastRead ? t.onGold : t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{isLastRead ? 'Kaldığın yer' : 'Burada kaldım'}</Text></Pressable>
          </View>
          <Text selectable style={{ color: t.ink, fontSize: 29, lineHeight: 52, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
        </View>
      </View>;
    })}
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: spacing.xl }}>Kaynak: Tanzil Project · Uthmani Quran Text + Quran metadata · CC BY 3.0</Text>
  </Screen>;
}
