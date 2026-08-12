import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { StreakMark } from '@/components/StreakMark';
import { QURAN_JUZS, QURAN_SURAHS, getAyah } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { formatLocaleDate, formatLocaleNumber, useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { quranCompletedSectionCount, quranReadingCoverage, quranReadingStreak, quranReadingSummary, quranSectionReadCounts, quranSurahReadCounts, recentQuranDayKeys, recentQuranReads } from '@/lib/quranHabit';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

const QURAN_SURAH_AYAH_COUNTS = QURAN_SURAHS.map((surah) => surah.ayahCount);
const QURAN_AYAH_KEYS = QURAN_SURAHS.flatMap((surah) => Array.from({ length: surah.ayahCount }, (_, index) => `${surah.id}:${index + 1}`));

export default function QuranHistory() {
  const theme = useTheme();
  const { locale, t } = useT();
  const readingDays = useQuranProgressStore((state) => state.readingDays);
  const readAyahs = useQuranProgressStore((state) => state.readAyahs);
  const days = recentQuranDayKeys(30);
  const counts = days.map((key) => readingDays[key]?.length ?? 0);
  const maxCount = Math.max(1, ...counts);
  const streak = quranReadingStreak(readingDays);
  const coverage = quranReadingCoverage(readAyahs, readingDays);
  const surahReadCounts = quranSurahReadCounts(readAyahs, readingDays, QURAN_SURAH_AYAH_COUNTS);
  const juzReadCounts = quranSectionReadCounts(QURAN_AYAH_KEYS, readAyahs, readingDays, QURAN_JUZS);
  const completedSurahs = quranCompletedSectionCount(surahReadCounts, QURAN_SURAHS);
  const completedJuzs = quranCompletedSectionCount(juzReadCounts, QURAN_JUZS);
  const recentReads = recentQuranReads(readingDays, 8).map((read) => {
    const [surah, ayah] = read.ayahKey.split(':').map(Number);
    return { ...read, ayah: getAyah(surah, ayah) };
  }).filter((read): read is typeof read & { ayah: NonNullable<typeof read.ayah> } => Boolean(read.ayah));
  const direction = rowDirection(locale);
  const align = textAlignment(locale);

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.back')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={getDirectionalIconName('arrow-back', locale)} size={20} color={theme.ink} /></Pressable>
    <Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.xl, textAlign: align }}>{t('history.title')}</Text>
    <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, lineHeight: 21, marginTop: 6, textAlign: align }}>{t('history.localOnly')}</Text>

    <View style={{ flexDirection: direction, gap: spacing.sm, marginTop: spacing.xl }}>{[7, 30, 90].map((period) => {
      const summary = quranReadingSummary(readingDays, period);
      return <View key={period} style={{ flex: 1, backgroundColor: theme.surface, borderRadius: radius.inner, paddingVertical: spacing.lg, paddingHorizontal: spacing.xs, alignItems: 'center' }}><Text style={{ color: theme.gold, fontFamily: fonts.serif, fontSize: 24 }}>{formatLocaleNumber(summary.ayahs)}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10, textAlign: 'center' }}>{t('history.period', { ayahs: summary.ayahs, days: period })}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 9, marginTop: 3, textAlign: 'center' }}>{t('history.activeDays', { count: summary.activeDays })}</Text></View>;
    })}</View>

    <View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.md, backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md }}><View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, textAlign: align }}>{t('history.streakTitle')}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: 2, textAlign: align }}>{t('history.streakBody')}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 9, marginTop: spacing.xs, textAlign: align }}>{t('quran.bestIn90', { count: streak.best })}</Text></View><StreakMark count={streak.current} label={t('common.day')} accessibilityLabel={t('history.streakCount', { count: streak.current })} compact /></View>

    <View style={{ backgroundColor: theme.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md }}><View style={{ flexDirection: direction, alignItems: 'baseline', gap: spacing.sm }}><Text style={{ color: theme.gold, fontFamily: fonts.serif, fontSize: 24 }}>{t('quran.coverage', { percent: coverage.percent })}</Text><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, flex: 1, textAlign: align }}>{t('history.coverageTitle')}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10 }}>{formatLocaleNumber(coverage.read)} / {formatLocaleNumber(coverage.total)}</Text></View><View style={{ height: 5, borderRadius: 3, backgroundColor: theme.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${coverage.percent}%`, height: 5, borderRadius: 3, backgroundColor: theme.gold }} /></View><View style={{ flexDirection: direction, gap: spacing.sm, marginTop: spacing.md }}><View style={{ flex: 1, backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.sm }}><Text style={{ color: theme.gold, fontFamily: fonts.sansBold, fontSize: 15, textAlign: align }}>{formatLocaleNumber(completedSurahs)}/114</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 9, marginTop: 2, textAlign: align }}>{t('history.completedSurahs', { count: completedSurahs })}</Text></View><View style={{ flex: 1, backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.sm }}><Text style={{ color: theme.gold, fontFamily: fonts.sansBold, fontSize: 15, textAlign: align }}>{formatLocaleNumber(completedJuzs)}/30</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 9, marginTop: 2, textAlign: align }}>{t('history.completedJuzs', { count: completedJuzs })}</Text></View></View><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginTop: spacing.sm, textAlign: align }}>{t('history.uniqueNote')}</Text></View>

    {recentReads.length ? <><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.xxl, textAlign: align }}>{t('history.recent')}</Text><View style={{ gap: spacing.xs, marginTop: spacing.md }}>{recentReads.map((read, index) => {
      const surah = QURAN_SURAHS[read.ayah.surah - 1];
      return <Pressable key={`${read.day}-${read.ayahKey}-${index}`} accessibilityRole="button" accessibilityLabel={t('history.returnToAyah', { surah: surah.transliteration, reference: read.ayahKey })} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${read.ayah.surah}`, ayah: `${read.ayah.ayah}` } })} style={({ pressed }) => ({ flexDirection: direction, gap: spacing.sm, alignItems: 'center', minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: theme.surface, opacity: pressed ? 0.7 : 1 })}><Ionicons name="time-outline" size={16} color={theme.gold} /><View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, textAlign: align }}>{surah.transliteration} · {read.ayahKey}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 9, marginTop: 2, textAlign: align }}>{formatLocaleDate(dateFromKey(read.day), { weekday: 'short', day: 'numeric', month: 'short' })}</Text></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={16} color={theme.inkFaint} /></Pressable>;
    })}</View></> : null}

    <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.xxl, textAlign: align }}>{t('history.last30')}</Text>
    <View style={{ gap: spacing.xs, marginTop: spacing.md }}>{days.map((key, index) => {
      const count = counts[index];
      return <View key={key} style={{ flexDirection: direction, alignItems: 'center', gap: spacing.sm, minHeight: 42, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: index === 0 ? theme.goldSoft : theme.surface }}><Text style={{ width: 96, color: index === 0 ? theme.gold : theme.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11, textAlign: align }}>{index === 0 ? t('history.today') : formatLocaleDate(dateFromKey(key), { weekday: 'short', day: 'numeric', month: 'short' })}</Text><View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: theme.surfaceAlt }}><View style={{ width: `${(count / maxCount) * 100}%`, height: 5, borderRadius: 3, backgroundColor: theme.gold }} /></View><Text style={{ width: 62, textAlign: locale === 'ar' ? 'left' : 'right', color: count ? theme.ink : theme.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>{t('history.dayAyahs', { count })}</Text></View>;
    })}</View>
  </Screen>;
}
