import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { QURAN_AYAHS, QURAN_JUZS, QURAN_SURAHS, getAyah, mushafPositionPercent } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { quranGoalPercent, quranNextUnreadKey, quranReadCount, quranReadingCoverage, quranReadingStreak, type QuranReadingGoal } from '@/lib/quranHabit';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

function openAyah(surah: number, ayah: number) {
  router.push({ pathname: '/surah/[id]', params: { id: `${surah}`, ayah: `${ayah}` } });
}

const QURAN_AYAH_KEYS = QURAN_AYAHS.map((ayah) => `${ayah.surah}:${ayah.ayah}`);

export default function Quran() {
  const t = useTheme();
  const [query, setQuery] = useState('');
  const [browseMode, setBrowseMode] = useState<'surahs' | 'juzs'>('surahs');
  const { lastRead, bookmarks, readingDays, readAyahs, readingGoal, setReadingGoal } = useQuranProgressStore();
  const readToday = quranReadCount(readingDays);
  const goalPercent = quranGoalPercent(readToday, readingGoal);
  const readingStreak = quranReadingStreak(readingDays);
  const coverage = quranReadingCoverage(readAyahs, readingDays);
  const nextUnreadKey = quranNextUnreadKey(QURAN_AYAH_KEYS, readAyahs, readingDays, lastRead ? `${lastRead.surah}:${lastRead.ayah}` : undefined);
  const nextUnread = nextUnreadKey ? getAyah(...nextUnreadKey.split(':').map(Number) as [number, number]) : undefined;
  const verseMatch = query.trim().match(/^(\d{1,3})\s*:\s*(\d{1,3})$/);
  const directAyah = verseMatch ? getAyah(Number(verseMatch[1]), Number(verseMatch[2])) : undefined;
  const bookmarkAyahs = useMemo(() => bookmarks.slice(0, 5).map((key) => {
    const [surah, ayah] = key.split(':').map(Number);
    return getAyah(surah, ayah);
  }).filter((ayah): ayah is NonNullable<typeof ayah> => Boolean(ayah)), [bookmarks]);
  const surahs = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    if (!needle || verseMatch) return QURAN_SURAHS;
    return QURAN_SURAHS.filter((surah) =>
      `${surah.id} ${surah.transliteration} ${surah.arabicName}`.toLocaleLowerCase('tr-TR').includes(needle),
    );
  }, [query, verseMatch]);
  const lastSurah = lastRead ? QURAN_SURAHS[lastRead.surah - 1] : undefined;

  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>Kur’an</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22, marginTop: 6 }}>114 sûre · 6.236 ayet · Arapça Uthmani metin</Text>

    {lastRead && lastSurah ? <Pressable onPress={() => openAyah(lastRead.surah, lastRead.ayah)} style={({ pressed }) => ({ backgroundColor: t.duskFrom, borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.lg, opacity: pressed ? 0.8 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ flex: 1 }}><Text style={{ color: '#B6E3D4', fontFamily: fonts.sansSemiBold, fontSize: 11, letterSpacing: 1.2 }}>KALDIĞIN YER</Text><Text style={{ color: '#F6F2E9', fontFamily: fonts.serif, fontSize: 22, marginTop: 4 }}>{lastSurah.transliteration} · {lastRead.surah}:{lastRead.ayah}</Text></View><Ionicons name="arrow-forward-circle" size={30} color="#B6E3D4" /></View>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: spacing.md }}><View style={{ width: `${mushafPositionPercent(lastRead.surah, lastRead.ayah)}%`, height: 4, borderRadius: 2, backgroundColor: '#B6E3D4' }} /></View>
      <Text style={{ color: 'rgba(246,242,233,0.55)', fontFamily: fonts.sans, fontSize: 10, marginTop: 6 }}>Mushaf konumu %{mushafPositionPercent(lastRead.surah, lastRead.ayah).toFixed(1)}</Text>
    </Pressable> : null}

    <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.lg, marginTop: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold }}>Bugünkü okuma hedefi</Text><Text style={{ color: t.gold, fontFamily: fonts.sansBold, marginTop: 2 }}>{readToday}/{readingGoal} ayet</Text></View><Pressable accessibilityRole="button" onPress={() => router.push('/quran-history')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingLeft: spacing.md }}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>Geçmiş</Text><Ionicons name="chevron-forward" size={14} color={t.gold} /></Pressable></View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: spacing.md }}><View style={{ width: `${goalPercent}%`, height: 5, borderRadius: 3, backgroundColor: t.gold }} /></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}><Ionicons name="flame-outline" size={14} color={t.gold} /><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10, marginLeft: 4 }}>{readingStreak.current} günlük Kur’an serisi</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginLeft: 'auto' }}>90 günde en iyi {readingStreak.best}</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}><Ionicons name="book-outline" size={14} color={t.gold} /><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10, marginLeft: 4 }}>{coverage.read.toLocaleString('tr-TR')} / {coverage.total.toLocaleString('tr-TR')} tekil ayet</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginLeft: 'auto' }}>%{coverage.percent} kapsam</Text></View>
      {nextUnread ? <Pressable accessibilityRole="button" accessibilityLabel={`Sıradaki okunmamış ayet ${nextUnread.surah}:${nextUnread.ayah}`} onPress={() => openAyah(nextUnread.surah, nextUnread.ayah)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', backgroundColor: t.goldSoft, borderRadius: radius.inner, paddingHorizontal: spacing.md, paddingVertical: 10, marginTop: spacing.md, opacity: pressed ? 0.75 : 1 })}><Ionicons name="play-forward-outline" size={16} color={t.gold} /><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 11, marginLeft: spacing.sm, flex: 1 }}>Sıradaki okunmamış ayet · {nextUnread.surah}:{nextUnread.ayah}</Text><Ionicons name="chevron-forward" size={15} color={t.gold} /></Pressable> : <View style={{ backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.md }}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 11, textAlign: 'center' }}>Tüm ayetler okundu olarak işaretli.</Text></View>}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>{([5, 10, 20] as QuranReadingGoal[]).map((goal) => <Pressable key={goal} accessibilityRole="radio" accessibilityState={{ selected: readingGoal === goal }} onPress={() => setReadingGoal(goal)} style={{ flex: 1, borderRadius: radius.pill, paddingVertical: 7, alignItems: 'center', backgroundColor: readingGoal === goal ? t.gold : t.surfaceAlt }}><Text style={{ color: readingGoal === goal ? t.onGold : t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>{goal} ayet</Text></Pressable>)}</View>
    </View>

    <View style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: radius.inner, paddingHorizontal: spacing.md }}>
      <Ionicons name="search-outline" size={18} color={t.inkFaint} />
      <TextInput value={query} onChangeText={setQuery} placeholder="Sûre adı, numarası veya 2:255" placeholderTextColor={t.inkFaint} autoCapitalize="none" style={{ flex: 1, color: t.ink, fontFamily: fonts.sans, paddingHorizontal: spacing.sm, paddingVertical: 13 }} />
      {query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={t.inkFaint} /></Pressable> : null}
    </View>
    {directAyah ? <Pressable onPress={() => openAyah(directAyah.surah, directAyah.ayah)} style={{ marginTop: spacing.sm, backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, flexDirection: 'row', alignItems: 'center' }}><Ionicons name="return-down-forward" size={18} color={t.gold} /><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, marginLeft: spacing.sm, flex: 1 }}>{directAyah.surah}:{directAyah.ayah} ayetine git</Text><Ionicons name="chevron-forward" size={17} color={t.gold} /></Pressable> : null}
    <View style={{ backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.md }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 }}>Meal ve tefsir, insan tarafından hazırlanmış kaynak ve kullanım hakları doğrulandıktan sonra açılacak. Makine/AI çevirisi kullanılmaz.</Text></View>

    {bookmarkAyahs.length ? <><SectionHeader title="Yer imleri" right={<Pressable accessibilityRole="button" accessibilityLabel="Tüm yer imlerini gör" onPress={() => router.push('/bookmarks')}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>Tümü ({bookmarks.length})</Text></Pressable>} /><View style={{ gap: spacing.sm }}>{bookmarkAyahs.map((ayah) => {
      const surah = QURAN_SURAHS[ayah.surah - 1];
      return <Pressable key={`${ayah.surah}:${ayah.ayah}`} onPress={() => openAyah(ayah.surah, ayah.ayah)} style={{ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.md, flexDirection: 'row', alignItems: 'center' }}><Ionicons name="bookmark" size={16} color={t.gold} /><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, marginLeft: spacing.sm, flex: 1 }}>{surah.transliteration} · {ayah.surah}:{ayah.ayah}</Text><Ionicons name="chevron-forward" size={16} color={t.inkFaint} /></Pressable>;
    })}</View></> : null}

    <View style={{ flexDirection: 'row', backgroundColor: t.surface, borderRadius: radius.pill, padding: 4, marginTop: spacing.xl }}>
      {([['surahs', 'Sûreler'], ['juzs', 'Cüzler']] as const).map(([mode, label]) => <Pressable key={mode} onPress={() => { setBrowseMode(mode); if (mode === 'juzs') setQuery(''); }} style={{ flex: 1, borderRadius: radius.pill, paddingVertical: 9, alignItems: 'center', backgroundColor: browseMode === mode ? t.gold : 'transparent' }}><Text style={{ color: browseMode === mode ? t.onGold : t.inkSoft, fontFamily: fonts.sansSemiBold }}>{label}</Text></Pressable>)}
    </View>

    {browseMode === 'surahs' ? <>
    <SectionHeader title={query && !verseMatch ? `${surahs.length} sonuç` : 'Tüm sûreler'} />
    <View style={{ gap: spacing.sm }}>{surahs.map((surah) => <Pressable key={surah.id} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${surah.id}` } })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: radius.inner, opacity: pressed ? 0.75 : 1 })}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold }}>{surah.id}</Text></View>
      <View style={{ flex: 1, marginLeft: spacing.md }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 }}>{surah.transliteration}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, marginTop: 2 }}>{surah.revelationPlace === 'meccan' ? 'Mekke' : 'Medine'} · {surah.ayahCount} ayet</Text></View>
      <Text style={{ color: t.ink, fontSize: 20, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Ionicons name="chevron-forward" size={17} color={t.inkFaint} style={{ marginLeft: spacing.sm }} />
    </Pressable>)}</View>
    {!surahs.length ? <Text style={{ color: t.inkSoft, textAlign: 'center', fontFamily: fonts.sans, marginVertical: spacing.xl }}>Sûre bulunamadı.</Text> : null}
    </> : <>
      <SectionHeader title="30 cüz" />
      <View style={{ gap: spacing.sm }}>{QURAN_JUZS.map((juz) => {
        const startSurah = QURAN_SURAHS[juz.startSurah - 1];
        return <Pressable key={juz.id} onPress={() => router.push({ pathname: '/juz/[id]', params: { id: `${juz.id}` } })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: radius.inner, opacity: pressed ? 0.75 : 1 })}>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold }}>{juz.id}</Text></View>
          <View style={{ flex: 1, marginLeft: spacing.md }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 }}>{juz.id}. Cüz</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, marginTop: 2 }}>{startSurah.transliteration} · {juz.startSurah}:{juz.startAyah} · {juz.ayahCount} ayet</Text></View>
          <Ionicons name="chevron-forward" size={17} color={t.inkFaint} />
        </Pressable>;
      })}</View>
    </>}
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: spacing.xl }}>Arapça Kur’an metni: Tanzil Project · tanzil.net · CC BY 3.0 · verbatim</Text>
  </Screen>;
}
