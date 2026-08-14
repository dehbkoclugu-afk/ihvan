import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { QuranTextSizeControl } from '@/components/QuranTextSizeControl';
import { Screen } from '@/components/Screen';
import { QURAN_SURAHS, getSurahAyahs } from '@/data/quran';
import { getQuranMealAyah, getQuranMealSource } from '@/data/quranMeals';
import { useTheme } from '@/hooks/useTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { QURAN_TEXT_METRICS } from '@/lib/quranDisplay';
import { mergeQuranReadAyahs } from '@/lib/quranHabit';
import { selectionFeedback } from '@/services/haptics';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function SurahDetail() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { locale, t } = useT();
  const { id, ayah: targetParam } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahId = Number(id);
  const targetAyah = Number(targetParam);
  const surah = QURAN_SURAHS.find((item) => item.id === surahId);
  const scrollRef = useRef<ScrollView>(null);
  const didScroll = useRef(false);
  const ayahOffsets = useRef<Record<number, number>>({});
  const [jumpInput, setJumpInput] = useState('');
  const metrics = QURAN_TEXT_METRICS[useUserStore((state) => state.quranTextSize)];
  const quranMeal = useUserStore((state) => state.quranMeal);
  const mealSource = getQuranMealSource(quranMeal);
  const { lastRead, bookmarks, readingDays, readAyahs, markAyahRead, toggleBookmark } = useQuranProgressStore();
  if (!surah) return <Screen><Text style={{ color: theme.ink, textAlign: textAlignment(locale) }}>{t('reader.surahNotFound')}</Text></Screen>;
  const ayahs = getSurahAyahs(surahId);
  const readKeys = new Set(mergeQuranReadAyahs(readAyahs, readingDays));
  const readCount = ayahs.reduce((count, ayah) => count + Number(readKeys.has(`${ayah.surah}:${ayah.ayah}`)), 0);
  const progress = surah.ayahCount ? Math.round((readCount / surah.ayahCount) * 100) : 0;
  const previousSurah = QURAN_SURAHS[surahId - 2];
  const nextSurah = QURAN_SURAHS[surahId];
  const jumpAyah = Number(jumpInput);
  const canJump = Number.isInteger(jumpAyah) && jumpAyah >= 1 && jumpAyah <= surah.ayahCount;
  const direction = rowDirection(locale);
  const align = textAlignment(locale);
  const jumpToAyah = () => {
    if (!canJump) return;
    const y = ayahOffsets.current[jumpAyah];
    if (typeof y === 'number') scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing.md), animated: !reducedMotion });
  };

  const returnToLastRead = () => {
    if (!lastRead) return;
    if (lastRead.surah !== surahId) {
      router.push({ pathname: '/surah/[id]', params: { id: `${lastRead.surah}`, ayah: `${lastRead.ayah}` } });
      return;
    }
    const y = ayahOffsets.current[lastRead.ayah];
    if (typeof y === 'number') scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing.md), animated: !reducedMotion });
  };

  return <Screen scrollRef={scrollRef} footer={<View accessibilityRole="toolbar" style={{ minHeight: 60, flexDirection: direction, alignItems: 'center', justifyContent: 'space-around', gap: spacing.sm }}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('reader.scrollTopA11y')} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: !reducedMotion })} style={{ flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-up" size={18} color={theme.gold} /><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 11, marginTop: 2 }}>{t('reader.scrollTop')}</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={t('reader.lastPositionA11y')} accessibilityState={{ disabled: !lastRead }} disabled={!lastRead} onPress={returnToLastRead} style={{ flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="navigate-outline" size={18} color={lastRead ? theme.gold : theme.inkFaint} /><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: lastRead ? theme.inkSoft : theme.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 11, marginTop: 2 }}>{t('reader.lastPosition')}</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={t('quran.viewAllBookmarks')} onPress={() => router.push('/bookmarks')} style={{ flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="bookmark-outline" size={18} color={theme.gold} /><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 11, marginTop: 2 }}>{t('quran.bookmarks')}</Text></Pressable>
  </View>}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.back')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={getDirectionalIconName('arrow-back', locale)} size={20} color={theme.ink} /></Pressable>
    <View style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: theme.ink, fontFamily: fonts.quran, fontSize: 34, writingDirection: 'rtl', textAlign: 'right' }}>{surah.arabicName}</Text><Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 30, marginTop: spacing.sm, textAlign: 'center' }}>{surah.transliteration}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, marginTop: 5, textAlign: 'center' }}>{t('reader.surahMeta', { kind: t(surah.revelationPlace === 'meccan' ? 'quran.meccan' : 'quran.medinan'), count: surah.ayahCount })}</Text></View>
    <View style={{ backgroundColor: theme.surface, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.lg }}><View style={{ flexDirection: direction, alignItems: 'center' }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, textAlign: align }}>{t('reader.surahProgress')}</Text><Text style={{ color: theme.gold, fontFamily: fonts.sansBold, fontSize: 12, marginStart: 'auto' }}>{t('reader.progressValue', { read: readCount, total: surah.ayahCount, percent: progress })}</Text></View><View style={{ height: 5, borderRadius: 3, backgroundColor: theme.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${progress}%`, height: 5, borderRadius: 3, backgroundColor: theme.gold }} /></View></View>
    <QuranTextSizeControl />
    <View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}><View style={{ flex: 1, flexDirection: direction, alignItems: 'center', minHeight: 44, borderWidth: 1, borderColor: canJump ? theme.gold : theme.border, backgroundColor: theme.surface, borderRadius: radius.inner, paddingHorizontal: spacing.md }}><Ionicons name="locate-outline" size={17} color={theme.inkFaint} /><TextInput accessibilityLabel={t('reader.jumpInputA11y', { surah: surah.transliteration })} value={jumpInput} onChangeText={setJumpInput} onSubmitEditing={jumpToAyah} keyboardType="number-pad" placeholder={t('reader.jumpPlaceholder', { count: surah.ayahCount })} placeholderTextColor={theme.inkFaint} textAlign={align} style={{ flex: 1, color: theme.ink, fontFamily: fonts.sans, paddingHorizontal: spacing.sm, paddingVertical: 9 }} /></View><Pressable accessibilityRole="button" accessibilityLabel={t('reader.jumpA11y', { ayah: canJump ? jumpAyah : '' })} accessibilityState={{ disabled: !canJump }} disabled={!canJump} onPress={jumpToAyah} style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: spacing.lg, borderRadius: radius.inner, alignItems: 'center', justifyContent: 'center', backgroundColor: canJump ? theme.gold : theme.surfaceAlt, opacity: pressed ? 0.75 : 1 })}><Text style={{ color: canJump ? theme.onGold : theme.inkFaint, fontFamily: fonts.sansBold, fontSize: 12 }}>{t('common.go')}</Text></Pressable></View>
    <View style={{ backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.xl }}><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: align }}>{t('reader.surahPolicy')}</Text></View>
    {ayahs.map((ayah, index) => {
      const key = `${ayah.surah}:${ayah.ayah}`;
      const bookmarked = bookmarks.includes(key);
      const read = readKeys.has(key);
      const isLastRead = lastRead?.surah === ayah.surah && lastRead.ayah === ayah.ayah;
      const meal = getQuranMealAyah(ayah.surah, ayah.ayah, quranMeal);
      const shareAyah = () => Share.share({ title: `${surah.transliteration} ${key}`, message: `${ayah.text}\n\n${meal?.text ? `${meal.text}\n\n` : ''}${surah.transliteration} ${key}\n\n${t('reader.shareAttribution', { source: mealSource?.name ?? 'Tanzil Uthmani' })}` });
      return <View key={key} onLayout={(event) => {
        ayahOffsets.current[ayah.ayah] = event.nativeEvent.layout.y;
        if (!didScroll.current && targetAyah === ayah.ayah) {
          didScroll.current = true;
          const y = Math.max(0, event.nativeEvent.layout.y - spacing.md);
          requestAnimationFrame(() => scrollRef.current?.scrollTo({ y, animated: false }));
        }
      }} style={{ paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.border, marginTop: index === 0 ? spacing.lg : 0 }}>
        <View style={{ flexDirection: direction, alignItems: 'center' }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: theme.gold, fontFamily: fonts.sansBold, fontSize: 12 }}>{ayah.ayah}</Text></View>
          <View style={{ flex: 1 }} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('reader.shareA11y', { reference: key })} hitSlop={8} onPress={() => void shareAyah()} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface }}><Ionicons name="share-outline" size={18} color={theme.inkSoft} /></Pressable>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: bookmarked }} accessibilityLabel={t('reader.bookmarkA11y', { surah: ayah.surah, ayah: ayah.ayah })} hitSlop={8} onPress={() => { selectionFeedback(); toggleBookmark(ayah.surah, ayah.ayah); }} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: bookmarked ? theme.goldSoft : theme.surface }}><Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? theme.gold : theme.inkSoft} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: read }} accessibilityLabel={t('reader.markReadA11y', { surah: ayah.surah, ayah: ayah.ayah })} onPress={() => { selectionFeedback(); markAyahRead(ayah.surah, ayah.ayah); }} style={{ marginStart: spacing.sm, minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.pill, flexDirection: direction, gap: 5, alignItems: 'center', backgroundColor: isLastRead ? theme.gold : read ? theme.goldSoft : theme.surface }}><Ionicons name={read ? 'checkmark' : 'checkmark-outline'} size={15} color={isLastRead ? theme.onGold : read ? theme.gold : theme.inkSoft} /><Text numberOfLines={1} style={{ color: isLastRead ? theme.onGold : read ? theme.gold : theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{t(isLastRead ? 'reader.lastPosition' : read ? 'reader.read' : 'reader.markRead')}</Text></Pressable>
        </View>
        <Text selectable style={{ color: theme.ink, fontFamily: fonts.quran, fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
        {meal ? <View style={{ backgroundColor: theme.surface, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.lg }}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 10, letterSpacing: 0.8, textAlign: 'left', writingDirection: 'ltr' }}>{t('reader.meal')}</Text><Text selectable style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 15, lineHeight: 24, marginTop: spacing.xs, textAlign: 'left', writingDirection: 'ltr' }}>{meal.text}</Text>{meal.footnotes ? <Text selectable style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 12, lineHeight: 19, marginTop: spacing.sm, textAlign: 'left', writingDirection: 'ltr' }}>{meal.footnotes}</Text> : null}</View> : null}
      </View>;
    })}
    <View style={{ flexDirection: direction, gap: spacing.sm, marginTop: spacing.xl }}>
      {previousSurah ? <Pressable accessibilityRole="button" accessibilityLabel={t('reader.previousSurahA11y', { surah: previousSurah.transliteration })} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${previousSurah.id}` } })} style={({ pressed }) => ({ flex: 1, minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.xs }}><Ionicons name={getDirectionalIconName('chevron-back', locale)} size={18} color={theme.gold} /><View style={{ flex: 1 }}><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, textAlign: align }}>{t('reader.previousSurah')}</Text><Text numberOfLines={1} style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginTop: 2, textAlign: align }}>{previousSurah.transliteration}</Text></View></View></Pressable> : <View style={{ flex: 1 }} />}
      {nextSurah ? <Pressable accessibilityRole="button" accessibilityLabel={t('reader.nextSurahA11y', { surah: nextSurah.transliteration })} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${nextSurah.id}` } })} style={({ pressed }) => ({ flex: 1, minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ flexDirection: direction, alignItems: 'center', gap: spacing.xs }}><View style={{ flex: 1 }}><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, textAlign: align }}>{t('reader.nextSurah')}</Text><Text numberOfLines={1} style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginTop: 2, textAlign: align }}>{nextSurah.transliteration}</Text></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={theme.gold} /></View></Pressable> : <View style={{ flex: 1 }} />}
    </View>
    <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: mealSource ? spacing.sm : spacing.xl }}>{t('reader.surahAttribution', { surah: surah.transliteration })}</Text>
    {mealSource ? <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginBottom: spacing.xl }}>{t('reader.mealAttribution', { source: mealSource.name, version: mealSource.version ?? '' })}</Text> : null}
  </Screen>;
}
