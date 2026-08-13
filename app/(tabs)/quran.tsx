import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ArtSlot } from '@/components/ArtSlot';
import { ScreenSubtitle, ScreenTitle } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { QURAN_AYAHS, QURAN_JUZS, QURAN_SURAHS, getAyah, mushafPositionPercent } from '@/data/quran';
import { searchQuranMeals } from '@/data/quranMeals';
import { useTheme } from '@/hooks/useTheme';
import { formatLocaleNumber, useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { quranGoalPercent, quranNextUnreadKey, quranProgressFilterMatches, quranReadCount, quranReadingCoverage, quranReadingStreak, quranSectionReadCounts, quranSurahReadCounts, type QuranProgressFilter, type QuranReadingGoal } from '@/lib/quranHabit';
import { QURAN_PLAN_DAYS, quranPlanSummary } from '@/lib/quranPlan';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

function openAyah(surah: number, ayah: number) {
  router.push({ pathname: '/surah/[id]', params: { id: `${surah}`, ayah: `${ayah}` } });
}

const QURAN_AYAH_KEYS = QURAN_AYAHS.map((ayah) => `${ayah.surah}:${ayah.ayah}`);
const QURAN_SURAH_AYAH_COUNTS = QURAN_SURAHS.map((surah) => surah.ayahCount);

export default function Quran() {
  const theme = useTheme();
  const { locale, t } = useT();
  const [query, setQuery] = useState('');
  const [browseMode, setBrowseMode] = useState<'surahs' | 'juzs'>('surahs');
  const [progressFilter, setProgressFilter] = useState<QuranProgressFilter>('all');
  const [planExpanded, setPlanExpanded] = useState(false);
  const quranMeal = useUserStore((state) => state.quranMeal);
  const { lastRead, bookmarks, readingDays, readAyahs, readingGoal, setReadingGoal, quranPlanDays, setQuranPlanDays } = useQuranProgressStore();
  const readToday = quranReadCount(readingDays);
  const goalPercent = quranGoalPercent(readToday, readingGoal);
  const readingStreak = quranReadingStreak(readingDays);
  const coverage = quranReadingCoverage(readAyahs, readingDays);
  const hatimPlan = quranPlanSummary(coverage.read, coverage.total, quranPlanDays);
  const surahReadCounts = useMemo(() => quranSurahReadCounts(readAyahs, readingDays, QURAN_SURAH_AYAH_COUNTS), [readAyahs, readingDays]);
  const juzReadCounts = useMemo(() => quranSectionReadCounts(QURAN_AYAH_KEYS, readAyahs, readingDays, QURAN_JUZS), [readAyahs, readingDays]);
  const nextUnreadKey = quranNextUnreadKey(QURAN_AYAH_KEYS, readAyahs, readingDays, lastRead ? `${lastRead.surah}:${lastRead.ayah}` : undefined);
  const nextUnread = nextUnreadKey ? getAyah(...nextUnreadKey.split(':').map(Number) as [number, number]) : undefined;
  const verseMatch = query.trim().match(/^(\d{1,3})\s*:\s*(\d{1,3})$/);
  const directAyah = verseMatch ? getAyah(Number(verseMatch[1]), Number(verseMatch[2])) : undefined;
  const mealResults = useMemo(() => verseMatch ? [] : searchQuranMeals(query, quranMeal, 20), [query, quranMeal, verseMatch]);
  const bookmarkAyahs = useMemo(() => bookmarks.slice(0, 5).map((key) => {
    const [surah, ayah] = key.split(':').map(Number);
    return getAyah(surah, ayah);
  }).filter((ayah): ayah is NonNullable<typeof ayah> => Boolean(ayah)), [bookmarks]);
  const surahs = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    if (!needle || verseMatch) return QURAN_SURAHS;
    return QURAN_SURAHS.filter((surah) =>
      `${surah.id} ${surah.transliteration} ${surah.arabicName}`.toLocaleLowerCase(locale).includes(needle),
    );
  }, [locale, query, verseMatch]);
  const visibleSurahs = useMemo(() => surahs.filter((surah) => quranProgressFilterMatches(surahReadCounts[surah.id] ?? 0, surah.ayahCount, progressFilter)), [progressFilter, surahReadCounts, surahs]);
  const visibleJuzs = useMemo(() => QURAN_JUZS.filter((juz) => quranProgressFilterMatches(juzReadCounts[juz.id] ?? 0, juz.ayahCount, progressFilter)), [juzReadCounts, progressFilter]);
  const lastSurah = lastRead ? QURAN_SURAHS[lastRead.surah - 1] : undefined;
  const direction = rowDirection(locale);
  const align = textAlignment(locale);
  const forward = getDirectionalIconName('chevron-forward', locale);

  return <Screen tabbed>
    <ScreenTitle>{t('quran.title')}</ScreenTitle>
    <ScreenSubtitle>{t('quran.subtitle')}</ScreenSubtitle>

    {lastRead && lastSurah ? <Pressable accessibilityRole="button" accessibilityLabel={t('quran.continueA11y', { surah: lastSurah.transliteration, ayah: lastRead.ayah })} onPress={() => openAyah(lastRead.surah, lastRead.ayah)} style={({ pressed }) => ({ borderRadius: radius.card, marginTop: spacing.lg, opacity: pressed ? 0.8 : 1 })}>
      <ArtSlot id="I4-continue-quran" variant="hero" height={178} radius={radius.card}>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#B6E3D4', fontFamily: fonts.sansSemiBold, fontSize: 11, letterSpacing: 1.2, textAlign: align }}>{t('quran.continue').toLocaleUpperCase(locale)}</Text>
              <Text style={{ color: '#F6F2E9', fontFamily: fonts.serif, fontSize: 22, marginTop: 4, textAlign: align }}>{lastSurah.transliteration} · {lastRead.surah}:{lastRead.ayah}</Text>
            </View>
            <Ionicons name={getDirectionalIconName('arrow-forward', locale)} size={28} color="#B6E3D4" />
          </View>
          <View>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.16)' }}><View style={{ width: `${mushafPositionPercent(lastRead.surah, lastRead.ayah)}%`, height: 4, borderRadius: 2, backgroundColor: '#B6E3D4' }} /></View>
            <Text style={{ color: 'rgba(246,242,233,0.72)', fontFamily: fonts.sans, fontSize: 10, marginTop: 6, textAlign: align }}>{t('quran.mushafPosition', { surah: lastRead.surah, ayah: lastRead.ayah })}</Text>
          </View>
        </View>
      </ArtSlot>
    </Pressable> : null}

    <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.lg }}>
      <View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, textAlign: align }}>{t('quran.dailyGoal')}</Text><Text style={{ color: theme.gold, fontFamily: fonts.sansBold, marginTop: 2, textAlign: align }}>{t('quran.goalProgress', { read: readToday, goal: readingGoal })}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.history')} onPress={() => router.push('/quran-history')} style={{ flexDirection: direction, alignItems: 'center', minHeight: 44, gap: spacing.xs }}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>{t('common.history')}</Text><Ionicons name={forward} size={14} color={theme.gold} /></Pressable>
      </View>
      <ProgressBar percent={goalPercent} style={{ marginTop: spacing.md }} />
      <View style={{ flexDirection: direction, alignItems: 'center', marginTop: spacing.sm, gap: spacing.xs }}><Ionicons name="time-outline" size={14} color={theme.gold} /><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{t('quran.readingStreak', { count: readingStreak.current })}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginStart: 'auto' }}>{t('quran.bestIn90', { count: readingStreak.best })}</Text></View>
      <View style={{ flexDirection: direction, alignItems: 'center', marginTop: spacing.xs, gap: spacing.xs }}><Ionicons name="book-outline" size={14} color={theme.gold} /><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{t('quran.uniqueAyahs', { count: formatLocaleNumber(coverage.read) })}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginStart: 'auto' }}>{t('quran.coverage', { percent: coverage.percent })}</Text></View>
      {nextUnread ? <Pressable accessibilityRole="button" accessibilityLabel={t('quran.nextUnreadA11y', { surah: nextUnread.surah, ayah: nextUnread.ayah })} onPress={() => openAyah(nextUnread.surah, nextUnread.ayah)} style={({ pressed }) => ({ flexDirection: direction, alignItems: 'center', gap: spacing.sm, backgroundColor: theme.goldSoft, borderRadius: radius.inner, paddingHorizontal: spacing.md, minHeight: 44, marginTop: spacing.md, opacity: pressed ? 0.75 : 1 })}><Ionicons name="play-forward-outline" size={16} color={theme.gold} /><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 11, flex: 1, textAlign: align }}>{t('quran.nextUnread', { reference: `${nextUnread.surah}:${nextUnread.ayah}` })}</Text><Ionicons name={forward} size={15} color={theme.gold} /></Pressable> : <View style={{ backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.md }}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 11, textAlign: 'center' }}>{t('quran.allRead')}</Text></View>}
      <SegmentedControl value={readingGoal} onChange={setReadingGoal} options={([5, 10, 20] as QuranReadingGoal[]).map((goal) => ({ value: goal, label: t('quran.goalOption', { count: goal }) }))} style={{ marginTop: spacing.md }} />
    </View>

    <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.lg }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: planExpanded }} onPress={() => setPlanExpanded((value) => !value)} style={{ minHeight: 44, flexDirection: direction, alignItems: 'center', gap: spacing.md }}><Ionicons name="calendar-outline" size={22} color={theme.gold} /><View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, textAlign: align }}>{t('quran.hatimPlan')}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: 3, textAlign: align }}>{hatimPlan.remaining ? t('quran.hatimDailyTarget', { count: hatimPlan.dailyTarget, days: hatimPlan.days }) : t('quran.hatimComplete')}</Text></View><Text style={{ color: theme.gold, fontFamily: fonts.sansBold }}>{hatimPlan.percent}%</Text><Ionicons name={planExpanded ? 'chevron-up' : 'chevron-down'} size={17} color={theme.inkFaint} /></Pressable>
      <ProgressBar percent={hatimPlan.percent} style={{ marginTop: spacing.md }} />
      {planExpanded ? <><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginTop: spacing.sm, textAlign: align }}>{t('quran.hatimRemaining', { count: hatimPlan.remaining })}</Text><SegmentedControl value={quranPlanDays} onChange={setQuranPlanDays} options={QURAN_PLAN_DAYS.map((days) => ({ value: days, label: t('quran.hatimDays', { count: days }) }))} style={{ marginTop: spacing.md }} /></> : null}
    </View>
    <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, marginTop: spacing.sm, textAlign: align }}>{t('quran.searchHelp')}</Text>

    <View style={{ marginTop: spacing.lg, flexDirection: direction, alignItems: 'center', borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, borderRadius: radius.inner, paddingHorizontal: spacing.md }}>
      <Ionicons name="search-outline" size={18} color={theme.inkFaint} />
      <TextInput accessibilityLabel={t('quran.searchA11y')} value={query} onChangeText={setQuery} placeholder={t('quran.searchPlaceholder')} placeholderTextColor={theme.inkFaint} autoCapitalize="none" textAlign={align} style={{ flex: 1, color: theme.ink, fontFamily: fonts.sans, paddingHorizontal: spacing.sm, paddingVertical: 13 }} />
      {query ? <Pressable accessibilityRole="button" accessibilityLabel={t('common.clearSearch')} onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={theme.inkFaint} /></Pressable> : null}
    </View>
    {directAyah ? <Pressable accessibilityRole="button" accessibilityLabel={t('quran.goToAyah', { reference: `${directAyah.surah}:${directAyah.ayah}` })} onPress={() => openAyah(directAyah.surah, directAyah.ayah)} style={{ minHeight: 44, marginTop: spacing.sm, backgroundColor: theme.goldSoft, borderRadius: radius.inner, paddingHorizontal: spacing.md, flexDirection: direction, gap: spacing.sm, alignItems: 'center' }}><Ionicons name="return-down-forward" size={18} color={theme.gold} /><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, flex: 1, textAlign: align }}>{t('quran.goToAyah', { reference: `${directAyah.surah}:${directAyah.ayah}` })}</Text><Ionicons name={forward} size={17} color={theme.gold} /></Pressable> : null}
    {mealResults.length ? <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
      <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, textAlign: align }}>{t('quran.mealResults', { count: mealResults.length })}</Text>
      {mealResults.map((result) => <Pressable key={`${result.surah}:${result.ayah}`} accessibilityRole="button" accessibilityLabel={t('quran.goToMealResult', { reference: result.reference })} onPress={() => openAyah(result.surah, result.ayah)} style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.inner, padding: spacing.md }}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 11, textAlign: align }}>{result.reference}</Text><Text numberOfLines={3} style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, marginTop: spacing.xs, textAlign: align }}>{result.text}</Text></Pressable>)}
    </View> : null}
    <View style={{ backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.md }}><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: align }}>{t('quran.sourcePolicy')}</Text></View>

    {bookmarkAyahs.length ? <><SectionHeader title={t('quran.bookmarks')} right={<Pressable accessibilityRole="button" accessibilityLabel={t('quran.viewAllBookmarks')} onPress={() => router.push('/bookmarks')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{t('quran.viewAllWithCount', { count: bookmarks.length })}</Text></Pressable>} /><View style={{ gap: spacing.sm }}>{bookmarkAyahs.map((ayah) => {
      const surah = QURAN_SURAHS[ayah.surah - 1];
      const reference = `${ayah.surah}:${ayah.ayah}`;
      return <Pressable key={reference} accessibilityRole="button" accessibilityLabel={t('quran.goToAyah', { reference: `${surah.transliteration} ${reference}` })} onPress={() => openAyah(ayah.surah, ayah.ayah)} style={{ backgroundColor: theme.surface, borderRadius: radius.inner, padding: spacing.md, flexDirection: direction, gap: spacing.sm, alignItems: 'center' }}><Ionicons name="bookmark" size={16} color={theme.gold} /><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, flex: 1, textAlign: align }}>{surah.transliteration} · {reference}</Text><Ionicons name={forward} size={16} color={theme.inkFaint} /></Pressable>;
    })}</View></> : null}

    <SegmentedControl value={browseMode} onChange={(mode) => { setBrowseMode(mode); if (mode === 'juzs') setQuery(''); }} options={([['surahs', t('quran.surahs')], ['juzs', t('quran.juzs')]] as const).map(([value, label]) => ({ value, label }))} style={{ marginTop: spacing.xl }} />
    <SegmentedControl value={progressFilter} onChange={setProgressFilter} options={([['all', t('quran.filterAll')], ['incomplete', t('quran.filterIncomplete')], ['complete', t('quran.filterComplete')]] as const).map(([value, label]) => ({ value, label }))} style={{ marginTop: spacing.sm }} />

    {browseMode === 'surahs' ? <>
      <SectionHeader title={progressFilter === 'incomplete' ? t('quran.incompleteSurahs', { count: visibleSurahs.length }) : progressFilter === 'complete' ? t('quran.completeSurahs', { count: visibleSurahs.length }) : query && !verseMatch ? t('quran.results', { count: visibleSurahs.length }) : t('quran.allSurahs')} />
      <View style={{ gap: spacing.sm }}>{visibleSurahs.map((surah) => {
        const read = surahReadCounts[surah.id] ?? 0;
        return <Pressable key={surah.id} accessibilityRole="button" accessibilityLabel={t('quran.surahReadA11y', { surah: surah.transliteration, read, total: surah.ayahCount })} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${surah.id}` } })} style={({ pressed }) => ({ flexDirection: direction, gap: spacing.md, alignItems: 'center', padding: spacing.lg, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, borderRadius: radius.inner, opacity: pressed ? 0.75 : 1 })}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.gold, fontFamily: fonts.sansBold }}>{surah.id}</Text></View>
          <View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, textAlign: align }}>{surah.transliteration}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 12, marginTop: 2, textAlign: align }}>{t(surah.revelationPlace === 'meccan' ? 'quran.meccan' : 'quran.medinan')} · {t('common.ayahCount', { count: surah.ayahCount })}{read ? ` ${t('quran.readSuffix', { percent: Math.round((read / surah.ayahCount) * 100) })}` : ''}</Text></View>
          {read === surah.ayahCount ? <Ionicons name="checkmark-circle" size={18} color={theme.gold} /> : null}
          <Text numberOfLines={1} style={{ maxWidth: '32%', color: theme.ink, fontFamily: fonts.quran, fontSize: 20, writingDirection: 'rtl', textAlign: 'right' }}>{surah.arabicName}</Text><Ionicons name={forward} size={17} color={theme.inkFaint} />
        </Pressable>;
      })}</View>
      {!visibleSurahs.length ? <Text style={{ color: theme.inkSoft, textAlign: 'center', fontFamily: fonts.sans, marginVertical: spacing.xl }}>{t(query && !verseMatch ? 'quran.surahNotFound' : 'quran.noSurahForFilter')}</Text> : null}
    </> : <>
      <SectionHeader title={progressFilter === 'incomplete' ? t('quran.incompleteJuzs', { count: visibleJuzs.length }) : progressFilter === 'complete' ? t('quran.completeJuzs', { count: visibleJuzs.length }) : t('quran.allJuzs')} />
      <View style={{ gap: spacing.sm }}>{visibleJuzs.map((juz) => {
        const startSurah = QURAN_SURAHS[juz.startSurah - 1];
        const read = juzReadCounts[juz.id] ?? 0;
        return <Pressable key={juz.id} accessibilityRole="button" accessibilityLabel={t('quran.juzReadA11y', { number: juz.id, read, total: juz.ayahCount })} onPress={() => router.push({ pathname: '/juz/[id]', params: { id: `${juz.id}` } })} style={({ pressed }) => ({ flexDirection: direction, gap: spacing.md, alignItems: 'center', padding: spacing.lg, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, borderRadius: radius.inner, opacity: pressed ? 0.75 : 1 })}>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.gold, fontFamily: fonts.sansBold }}>{juz.id}</Text></View>
          <View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, textAlign: align }}>{t('quran.juzTitle', { number: juz.id })}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 12, marginTop: 2, textAlign: align }}>{t('quran.juzStartMeta', { surah: startSurah.transliteration, ayah: `${juz.startSurah}:${juz.startAyah}` })}{read ? ` ${t('quran.readSuffix', { percent: Math.round((read / juz.ayahCount) * 100) })}` : ''}</Text></View>
          {read === juz.ayahCount ? <Ionicons name="checkmark-circle" size={18} color={theme.gold} /> : null}
          <Ionicons name={forward} size={17} color={theme.inkFaint} />
        </Pressable>;
      })}</View>
      {!visibleJuzs.length ? <Text style={{ color: theme.inkSoft, textAlign: 'center', fontFamily: fonts.sans, marginVertical: spacing.xl }}>{t('quran.noJuzForFilter')}</Text> : null}
    </>}
    <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: spacing.xl }}>{t('quran.attribution')}</Text>
  </Screen>;
}
