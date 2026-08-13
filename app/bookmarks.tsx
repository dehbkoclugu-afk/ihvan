import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { QURAN_SURAHS, getAyah } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { QURAN_TEXT_METRICS } from '@/lib/quranDisplay';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Bookmarks() {
  const theme = useTheme();
  const { locale, t } = useT();
  const [query, setQuery] = useState('');
  const { bookmarks, toggleBookmark } = useQuranProgressStore();
  const metrics = QURAN_TEXT_METRICS[useUserStore((state) => state.quranTextSize)];
  const ayahs = useMemo(() => bookmarks.map((key) => {
    const [surah, ayah] = key.split(':').map(Number);
    return getAyah(surah, ayah);
  }).filter((ayah): ayah is NonNullable<typeof ayah> => Boolean(ayah)), [bookmarks]);
  const visibleAyahs = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    if (!needle) return ayahs;
    return ayahs.filter((ayah) => {
      const surah = QURAN_SURAHS[ayah.surah - 1];
      return `${surah.transliteration} ${ayah.surah} ${ayah.surah}:${ayah.ayah}`.toLocaleLowerCase(locale).includes(needle);
    });
  }, [ayahs, locale, query]);
  const direction = rowDirection(locale);
  const align = textAlignment(locale);

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.back')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={getDirectionalIconName('arrow-back', locale)} size={20} color={theme.ink} /></Pressable>
    <Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.xl, textAlign: align }}>{t('bookmarks.title')}</Text>
    <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, lineHeight: 21, marginTop: 6, textAlign: align }}>{ayahs.length ? t('bookmarks.savedCount', { count: ayahs.length }) : t('bookmarks.empty')}</Text>

    {ayahs.length ? <View style={{ marginTop: spacing.lg, flexDirection: direction, alignItems: 'center', borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, borderRadius: radius.inner, paddingHorizontal: spacing.md }}><Ionicons name="search-outline" size={18} color={theme.inkFaint} /><TextInput accessibilityLabel={t('bookmarks.searchA11y')} value={query} onChangeText={setQuery} placeholder={t('bookmarks.searchPlaceholder')} placeholderTextColor={theme.inkFaint} autoCapitalize="none" textAlign={align} style={{ flex: 1, color: theme.ink, fontFamily: fonts.sans, paddingHorizontal: spacing.sm, paddingVertical: 12 }} />{query ? <Pressable accessibilityRole="button" accessibilityLabel={t('common.clearSearch')} onPress={() => setQuery('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={theme.inkFaint} /></Pressable> : null}</View> : null}

    {!ayahs.length ? <View style={{ backgroundColor: theme.surface, borderRadius: radius.card, padding: spacing.xxl, alignItems: 'center', marginTop: spacing.xxl }}><Ionicons name="bookmark-outline" size={30} color={theme.gold} /><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, marginTop: spacing.md, textAlign: 'center' }}>{t('bookmarks.emptyBody')}</Text><Pressable accessibilityRole="button" accessibilityLabel={t('bookmarks.goToQuran')} onPress={() => router.replace('/(tabs)/quran')} style={{ backgroundColor: theme.gold, borderRadius: radius.pill, minHeight: 44, paddingHorizontal: spacing.xl, marginTop: spacing.lg, justifyContent: 'center' }}><Text style={{ color: theme.onGold, fontFamily: fonts.sansBold }}>{t('bookmarks.goToQuran')}</Text></Pressable></View> : !visibleAyahs.length ? <View style={{ backgroundColor: theme.surface, borderRadius: radius.inner, padding: spacing.xl, alignItems: 'center', marginTop: spacing.lg }}><Ionicons name="search-outline" size={24} color={theme.inkFaint} /><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, marginTop: spacing.sm, textAlign: 'center' }}>{t('bookmarks.noResults')}</Text></View> : <View style={{ gap: spacing.md, marginTop: spacing.xl }}>{visibleAyahs.map((ayah) => {
      const surah = QURAN_SURAHS[ayah.surah - 1];
      const reference = `${surah.transliteration} · ${ayah.surah}:${ayah.ayah}`;
      return <View key={`${ayah.surah}:${ayah.ayah}`} style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.card, padding: spacing.lg }}>
        <View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.sm }}><Ionicons name="bookmark" size={17} color={theme.gold} /><Text style={{ flex: 1, color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 12, textAlign: align }}>{reference}</Text><Pressable accessibilityRole="button" accessibilityLabel={t('bookmarks.removeA11y', { surah: ayah.surah, ayah: ayah.ayah })} hitSlop={8} onPress={() => toggleBookmark(ayah.surah, ayah.ayah)} style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: theme.goldSoft }}><Ionicons name="trash-outline" size={17} color={theme.gold} /></Pressable></View>
        <Text selectable style={{ color: theme.ink, fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={t('bookmarks.openA11y', { surah: ayah.surah, ayah: ayah.ayah })} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${ayah.surah}`, ayah: `${ayah.ayah}` } })} style={({ pressed }) => ({ flexDirection: direction, alignItems: 'center', alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start', gap: spacing.xs, minHeight: 44, marginTop: spacing.sm, opacity: pressed ? 0.65 : 1 })}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{t('bookmarks.openInSurah')}</Text><Ionicons name={getDirectionalIconName('arrow-forward', locale)} size={15} color={theme.gold} /></Pressable>
      </View>;
    })}</View>}

    <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: spacing.xl }}>{t('quran.attribution')}</Text>
  </Screen>;
}
