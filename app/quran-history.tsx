import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { QURAN_JUZS, QURAN_SURAHS, getAyah } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
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
  const t = useTheme();
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
  const formatDay = new Intl.DateTimeFormat('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.xl }}>Kur’an okuma geçmişi</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 21, marginTop: 6 }}>Okudum olarak işaretlediğin ayetler yalnızca bu cihazda tutulur.</Text>

    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl }}>{[7, 30, 90].map((period) => {
      const summary = quranReadingSummary(readingDays, period);
      return <View key={period} style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, paddingVertical: spacing.lg, alignItems: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 24 }}>{summary.ayahs}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>AYET · {period} GÜN</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 9, marginTop: 3 }}>{summary.activeDays} aktif gün</Text></View>;
    })}</View>

    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md }}><Ionicons name="flame" size={22} color={t.gold} /><View style={{ marginLeft: spacing.sm, flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold }}>Kur’an okuma serisi</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>Bugün veya dünden devam eden seri</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 24 }}>{streak.current} gün</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 9 }}>90 günde en iyi {streak.best}</Text></View></View>

    <View style={{ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md }}><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 24 }}>%{coverage.percent}</Text><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, marginLeft: spacing.sm, flex: 1 }}>tekil ayet kapsamı</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10 }}>{coverage.read.toLocaleString('tr-TR')} / {coverage.total.toLocaleString('tr-TR')}</Text></View><View style={{ height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${coverage.percent}%`, height: 5, borderRadius: 3, backgroundColor: t.gold }} /></View><View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}><View style={{ flex: 1, backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.sm }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 15 }}>{completedSurahs}/114</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 9, marginTop: 2 }}>sûre tamamlandı</Text></View><View style={{ flex: 1, backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.sm }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 15 }}>{completedJuzs}/30</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 9, marginTop: 2 }}>cüz tamamlandı</Text></View></View><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginTop: spacing.sm }}>Aynı ayet tekrar okunduğunda yalnızca bir kez sayılır.</Text></View>

    {recentReads.length ? <><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.xxl }}>Son okudukların</Text><View style={{ gap: spacing.xs, marginTop: spacing.md }}>{recentReads.map((read, index) => {
      const surah = QURAN_SURAHS[read.ayah.surah - 1];
      return <Pressable key={`${read.day}-${read.ayahKey}-${index}`} accessibilityRole="button" accessibilityLabel={`${surah.transliteration} ${read.ayahKey} ayetine dön`} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${read.ayah.surah}`, ayah: `${read.ayah.ayah}` } })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: t.surface, opacity: pressed ? 0.7 : 1 })}><Ionicons name="time-outline" size={16} color={t.gold} /><View style={{ flex: 1, marginLeft: spacing.sm }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{surah.transliteration} · {read.ayahKey}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 9, marginTop: 2 }}>{formatDay.format(dateFromKey(read.day))}</Text></View><Ionicons name="chevron-forward" size={16} color={t.inkFaint} /></Pressable>;
    })}</View></> : null}

    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.xxl }}>Son 30 gün</Text>
    <View style={{ gap: spacing.xs, marginTop: spacing.md }}>{days.map((key, index) => {
      const count = counts[index];
      return <View key={key} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 42, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: index === 0 ? t.goldSoft : t.surface }}><Text style={{ width: 96, color: index === 0 ? t.gold : t.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11 }}>{index === 0 ? 'Bugün' : formatDay.format(dateFromKey(key))}</Text><View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt }}><View style={{ width: `${(count / maxCount) * 100}%`, height: 5, borderRadius: 3, backgroundColor: t.gold }} /></View><Text style={{ width: 54, textAlign: 'right', color: count ? t.ink : t.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>{count} ayet</Text></View>;
    })}</View>
  </Screen>;
}
