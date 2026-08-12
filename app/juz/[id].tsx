import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { QuranTextSizeControl } from '@/components/QuranTextSizeControl';
import { Screen } from '@/components/Screen';
import { QURAN_JUZS, QURAN_SURAHS, getJuzAyahs } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { QURAN_TEXT_METRICS } from '@/lib/quranDisplay';
import { mergeQuranReadAyahs } from '@/lib/quranHabit';
import { selectionFeedback } from '@/services/haptics';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function JuzDetail() {
  const theme = useTheme();
  const { locale, t } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const juzId = Number(id);
  const juz = QURAN_JUZS.find((item) => item.id === juzId);
  const metrics = QURAN_TEXT_METRICS[useUserStore((state) => state.quranTextSize)];
  const { lastRead, bookmarks, readingDays, readAyahs, markAyahRead, toggleBookmark } = useQuranProgressStore();
  if (!juz) return <Screen><Text style={{ color: theme.ink, textAlign: textAlignment(locale) }}>{t('reader.juzNotFound')}</Text></Screen>;
  const ayahs = getJuzAyahs(juzId);
  const readKeys = new Set(mergeQuranReadAyahs(readAyahs, readingDays));
  const readCount = ayahs.reduce((count, ayah) => count + Number(readKeys.has(`${ayah.surah}:${ayah.ayah}`)), 0);
  const progress = juz.ayahCount ? Math.round((readCount / juz.ayahCount) * 100) : 0;
  const previousJuz = QURAN_JUZS[juzId - 2];
  const nextJuz = QURAN_JUZS[juzId];
  const direction = rowDirection(locale);
  const align = textAlignment(locale);

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.back')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={getDirectionalIconName('arrow-back', locale)} size={20} color={theme.ink} /></Pressable>
    <View style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 30, textAlign: 'center' }}>{t('quran.juzTitle', { number: juz.id })}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, marginTop: 5, textAlign: 'center' }}>{t('reader.juzMeta', { count: juz.ayahCount, reference: `${juz.startSurah}:${juz.startAyah}` })}</Text></View>
    <View style={{ backgroundColor: theme.surface, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.lg }}><View style={{ flexDirection: direction, alignItems: 'center' }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, textAlign: align }}>{t('reader.juzProgress')}</Text><Text style={{ color: theme.gold, fontFamily: fonts.sansBold, fontSize: 12, marginStart: 'auto' }}>{t('reader.progressValue', { read: readCount, total: juz.ayahCount, percent: progress })}</Text></View><View style={{ height: 5, borderRadius: 3, backgroundColor: theme.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${progress}%`, height: 5, borderRadius: 3, backgroundColor: theme.gold }} /></View></View>
    <QuranTextSizeControl />
    <View style={{ backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.xl }}><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: align }}>{t('reader.juzPolicy')}</Text></View>
    {ayahs.map((ayah, index) => {
      const key = `${ayah.surah}:${ayah.ayah}`;
      const surah = QURAN_SURAHS[ayah.surah - 1];
      const previous = ayahs[index - 1];
      const startsSurah = !previous || previous.surah !== ayah.surah;
      const bookmarked = bookmarks.includes(key);
      const read = readKeys.has(key);
      const isLastRead = lastRead?.surah === ayah.surah && lastRead.ayah === ayah.ayah;
      return <View key={key}>
        {startsSurah ? <View style={{ alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.sm }}><Text style={{ color: theme.ink, fontSize: 28, writingDirection: 'rtl', textAlign: 'right' }}>{surah.arabicName}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, marginTop: 4 }}>{surah.transliteration} · {surah.id}</Text></View> : null}
        <View style={{ paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.border }}>
          <View style={{ flexDirection: direction, alignItems: 'center' }}>
            <View style={{ minWidth: 42, height: 34, paddingHorizontal: 7, borderRadius: 17, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.gold, fontFamily: fonts.sansBold, fontSize: 11 }}>{key}</Text></View>
            <View style={{ flex: 1 }} />
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: bookmarked }} accessibilityLabel={t('reader.bookmarkA11y', { reference: key })} hitSlop={8} onPress={() => { selectionFeedback(); toggleBookmark(ayah.surah, ayah.ayah); }} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: bookmarked ? theme.goldSoft : theme.surface }}><Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? theme.gold : theme.inkSoft} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: read }} accessibilityLabel={t('reader.markReadA11y', { reference: key })} hitSlop={8} onPress={() => { selectionFeedback(); markAyahRead(ayah.surah, ayah.ayah); }} style={{ marginStart: spacing.sm, minHeight: 38, paddingHorizontal: spacing.md, borderRadius: radius.pill, flexDirection: direction, gap: 5, alignItems: 'center', backgroundColor: isLastRead ? theme.gold : read ? theme.goldSoft : theme.surface }}><Ionicons name={read ? 'checkmark' : 'checkmark-outline'} size={15} color={isLastRead ? theme.onGold : read ? theme.gold : theme.inkSoft} /><Text style={{ color: isLastRead ? theme.onGold : read ? theme.gold : theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{t(isLastRead ? 'reader.lastPosition' : read ? 'reader.read' : 'reader.markRead')}</Text></Pressable>
          </View>
          <Text selectable style={{ color: theme.ink, fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
        </View>
      </View>;
    })}
    <View style={{ flexDirection: direction, gap: spacing.sm, marginTop: spacing.xl }}>
      {previousJuz ? <Pressable accessibilityRole="button" accessibilityLabel={t('reader.previousJuzA11y', { number: previousJuz.id })} onPress={() => router.push({ pathname: '/juz/[id]', params: { id: `${previousJuz.id}` } })} style={({ pressed }) => ({ flex: 1, minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.xs }}><Ionicons name={getDirectionalIconName('chevron-back', locale)} size={18} color={theme.gold} /><View style={{ flex: 1 }}><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, textAlign: align }}>{t('reader.previousJuz')}</Text><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginTop: 2, textAlign: align }}>{t('quran.juzTitle', { number: previousJuz.id })}</Text></View></View></Pressable> : <View style={{ flex: 1 }} />}
      {nextJuz ? <Pressable accessibilityRole="button" accessibilityLabel={t('reader.nextJuzA11y', { number: nextJuz.id })} onPress={() => router.push({ pathname: '/juz/[id]', params: { id: `${nextJuz.id}` } })} style={({ pressed }) => ({ flex: 1, minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.xs }}><View style={{ flex: 1 }}><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, textAlign: align }}>{t('reader.nextJuz')}</Text><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginTop: 2, textAlign: align }}>{t('quran.juzTitle', { number: nextJuz.id })}</Text></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={theme.gold} /></View></Pressable> : <View style={{ flex: 1 }} />}
    </View>
    <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: spacing.xl }}>{t('reader.juzAttribution')}</Text>
  </Screen>;
}
