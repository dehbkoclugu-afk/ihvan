import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { QuranTextSizeControl } from '@/components/QuranTextSizeControl';
import { Screen } from '@/components/Screen';
import { QURAN_JUZS, QURAN_SURAHS, getJuzAyahs } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { mergeQuranReadAyahs } from '@/lib/quranHabit';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { QURAN_TEXT_METRICS } from '@/lib/quranDisplay';
import { useUserStore } from '@/state/useUserStore';

export default function JuzDetail() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const juzId = Number(id);
  const juz = QURAN_JUZS.find((item) => item.id === juzId);
  const metrics = QURAN_TEXT_METRICS[useUserStore((state) => state.quranTextSize)];
  const { lastRead, bookmarks, readingDays, readAyahs, markAyahRead, toggleBookmark } = useQuranProgressStore();

  if (!juz) return <Screen><Text style={{ color: t.ink }}>Cüz bulunamadı.</Text></Screen>;
  const ayahs = getJuzAyahs(juzId);
  const readKeys = new Set(mergeQuranReadAyahs(readAyahs, readingDays));
  const readCount = ayahs.reduce((count, ayah) => count + Number(readKeys.has(`${ayah.surah}:${ayah.ayah}`)), 0);
  const progress = juz.ayahCount ? Math.round((readCount / juz.ayahCount) * 100) : 0;
  const previousJuz = QURAN_JUZS[juzId - 2];
  const nextJuz = QURAN_JUZS[juzId];

  return <Screen>
    <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <View style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 30 }}>{juz.id}. Cüz</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginTop: 5 }}>{juz.ayahCount} ayet · başlangıç {juz.startSurah}:{juz.startAyah}</Text></View>
    <View style={{ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.lg }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>Cüz ilerlemesi</Text><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 12, marginLeft: 'auto' }}>{readCount}/{juz.ayahCount} · %{progress}</Text></View><View style={{ height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${progress}%`, height: 5, borderRadius: 3, backgroundColor: t.gold }} /></View></View>
    <QuranTextSizeControl />
    <View style={{ backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.xl }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 }}>Cüz sınırları Tanzil metadata’sından alınır. Kur’an metni değiştirilmeden gösterilir; makine/AI çevirisi kullanılmaz.</Text></View>
    {ayahs.map((ayah, index) => {
      const key = `${ayah.surah}:${ayah.ayah}`;
      const surah = QURAN_SURAHS[ayah.surah - 1];
      const previous = ayahs[index - 1];
      const startsSurah = !previous || previous.surah !== ayah.surah;
      const bookmarked = bookmarks.includes(key);
      const read = readKeys.has(key);
      const isLastRead = lastRead?.surah === ayah.surah && lastRead.ayah === ayah.ayah;
      return <View key={key}>
        {startsSurah ? <View style={{ alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.sm }}><Text style={{ color: t.ink, fontSize: 28, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, marginTop: 4 }}>{surah.transliteration} · {surah.id}</Text></View> : null}
        <View style={{ paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ minWidth: 42, height: 34, paddingHorizontal: 7, borderRadius: 17, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 11 }}>{ayah.surah}:{ayah.ayah}</Text></View>
            <View style={{ flex: 1 }} />
            <Pressable accessibilityLabel={bookmarked ? 'Yer imini kaldır' : 'Yer imi ekle'} hitSlop={8} onPress={() => toggleBookmark(ayah.surah, ayah.ayah)} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: bookmarked ? t.goldSoft : t.surface }}><Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? t.gold : t.inkSoft} /></Pressable>
            <Pressable accessibilityLabel={`${ayah.surah}:${ayah.ayah} ayetini okudum`} hitSlop={8} onPress={() => markAyahRead(ayah.surah, ayah.ayah)} style={{ marginLeft: spacing.sm, height: 38, paddingHorizontal: spacing.md, borderRadius: radius.pill, flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: isLastRead ? t.gold : read ? t.goldSoft : t.surface }}><Ionicons name={read ? 'checkmark' : 'checkmark-outline'} size={15} color={isLastRead ? t.onGold : read ? t.gold : t.inkSoft} /><Text style={{ color: isLastRead ? t.onGold : read ? t.gold : t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{isLastRead ? 'Kaldığın yer' : read ? 'Okundu' : 'Okudum'}</Text></Pressable>
          </View>
          <Text selectable style={{ color: t.ink, fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
        </View>
      </View>;
    })}
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl }}>
      {previousJuz ? <Pressable accessibilityRole="button" accessibilityLabel={`Önceki cüz: ${previousJuz.id}`} onPress={() => router.push({ pathname: '/juz/[id]', params: { id: `${previousJuz.id}` } })} style={({ pressed }) => ({ flex: 1, minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="chevron-back" size={18} color={t.gold} /><View style={{ marginLeft: spacing.xs }}><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10 }}>Önceki cüz</Text><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginTop: 2 }}>{previousJuz.id}. Cüz</Text></View></View></Pressable> : <View style={{ flex: 1 }} />}
      {nextJuz ? <Pressable accessibilityRole="button" accessibilityLabel={`Sonraki cüz: ${nextJuz.id}`} onPress={() => router.push({ pathname: '/juz/[id]', params: { id: `${nextJuz.id}` } })} style={({ pressed }) => ({ flex: 1, minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}><View style={{ marginRight: spacing.xs, alignItems: 'flex-end' }}><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10 }}>Sonraki cüz</Text><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginTop: 2 }}>{nextJuz.id}. Cüz</Text></View><Ionicons name="chevron-forward" size={18} color={t.gold} /></View></Pressable> : <View style={{ flex: 1 }} />}
    </View>
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: spacing.xl }}>Kaynak: Tanzil Project · Uthmani Quran Text + Quran metadata · CC BY 3.0</Text>
  </Screen>;
}
