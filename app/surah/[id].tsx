import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { QuranTextSizeControl } from '@/components/QuranTextSizeControl';
import { Screen } from '@/components/Screen';
import { QURAN_SURAHS, getSurahAyahs } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { mergeQuranReadAyahs } from '@/lib/quranHabit';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { QURAN_TEXT_METRICS } from '@/lib/quranDisplay';
import { useUserStore } from '@/state/useUserStore';

export default function SurahDetail() {
  const t = useTheme();
  const { id, ayah: targetParam } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahId = Number(id);
  const targetAyah = Number(targetParam);
  const surah = QURAN_SURAHS.find((item) => item.id === surahId);
  const scrollRef = useRef<ScrollView>(null);
  const didScroll = useRef(false);
  const ayahOffsets = useRef<Record<number, number>>({});
  const [jumpInput, setJumpInput] = useState('');
  const metrics = QURAN_TEXT_METRICS[useUserStore((state) => state.quranTextSize)];
  const { lastRead, bookmarks, readingDays, readAyahs, markAyahRead, toggleBookmark } = useQuranProgressStore();
  if (!surah) return <Screen><Text style={{ color: t.ink }}>Sûre bulunamadı.</Text></Screen>;
  const ayahs = getSurahAyahs(surahId);
  const readKeys = new Set(mergeQuranReadAyahs(readAyahs, readingDays));
  const readCount = ayahs.reduce((count, ayah) => count + Number(readKeys.has(`${ayah.surah}:${ayah.ayah}`)), 0);
  const progress = surah.ayahCount ? Math.round((readCount / surah.ayahCount) * 100) : 0;
  const previousSurah = QURAN_SURAHS[surahId - 2];
  const nextSurah = QURAN_SURAHS[surahId];
  const jumpAyah = Number(jumpInput);
  const canJump = Number.isInteger(jumpAyah) && jumpAyah >= 1 && jumpAyah <= surah.ayahCount;
  const jumpToAyah = () => {
    if (!canJump) return;
    const y = ayahOffsets.current[jumpAyah];
    if (typeof y === 'number') scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing.md), animated: true });
  };

  return <Screen scrollRef={scrollRef}>
    <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <View style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: t.ink, fontSize: 34, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 30, marginTop: spacing.sm }}>{surah.transliteration}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginTop: 5 }}>{surah.revelationPlace === 'meccan' ? 'Mekke' : 'Medine'} · {surah.ayahCount} ayet</Text></View>
    <View style={{ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.lg }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>Sûre ilerlemesi</Text><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 12, marginLeft: 'auto' }}>{readCount}/{surah.ayahCount} · %{progress}</Text></View><View style={{ height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${progress}%`, height: 5, borderRadius: 3, backgroundColor: t.gold }} /></View></View>
    <QuranTextSizeControl />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}><View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 42, borderWidth: 1, borderColor: canJump ? t.gold : t.border, backgroundColor: t.surface, borderRadius: radius.inner, paddingHorizontal: spacing.md }}><Ionicons name="locate-outline" size={17} color={t.inkFaint} /><TextInput value={jumpInput} onChangeText={setJumpInput} onSubmitEditing={jumpToAyah} keyboardType="number-pad" placeholder={`Ayet no (1–${surah.ayahCount})`} placeholderTextColor={t.inkFaint} style={{ flex: 1, color: t.ink, fontFamily: fonts.sans, paddingHorizontal: spacing.sm, paddingVertical: 9 }} /></View><Pressable accessibilityRole="button" accessibilityLabel="Ayet numarasına git" accessibilityState={{ disabled: !canJump }} disabled={!canJump} onPress={jumpToAyah} style={({ pressed }) => ({ minHeight: 42, paddingHorizontal: spacing.lg, borderRadius: radius.inner, alignItems: 'center', justifyContent: 'center', backgroundColor: canJump ? t.gold : t.surfaceAlt, opacity: pressed ? 0.75 : 1 })}><Text style={{ color: canJump ? t.onGold : t.inkFaint, fontFamily: fonts.sansBold, fontSize: 12 }}>Git</Text></Pressable></View>
    <View style={{ backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.xl }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 }}>Şimdilik yalnızca doğrulanmış Arapça metin gösteriliyor. Meal ve tefsir için makine çevirisi kullanılmayacak.</Text></View>
    {ayahs.map((ayah, index) => {
      const key = `${ayah.surah}:${ayah.ayah}`;
      const bookmarked = bookmarks.includes(key);
      const read = readKeys.has(key);
      const isLastRead = lastRead?.surah === ayah.surah && lastRead.ayah === ayah.ayah;
      return <View key={key} onLayout={(event) => {
        ayahOffsets.current[ayah.ayah] = event.nativeEvent.layout.y;
        if (!didScroll.current && targetAyah === ayah.ayah) {
          didScroll.current = true;
          const y = Math.max(0, event.nativeEvent.layout.y - spacing.md);
          requestAnimationFrame(() => scrollRef.current?.scrollTo({ y, animated: false }));
        }
      }} style={{ paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: t.border, marginTop: index === 0 ? spacing.lg : 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 12 }}>{ayah.ayah}</Text></View>
          <View style={{ flex: 1 }} />
          <Pressable accessibilityLabel={bookmarked ? 'Yer imini kaldır' : 'Yer imi ekle'} hitSlop={8} onPress={() => toggleBookmark(ayah.surah, ayah.ayah)} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: bookmarked ? t.goldSoft : t.surface }}><Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={bookmarked ? t.gold : t.inkSoft} /></Pressable>
          <Pressable accessibilityLabel={`${ayah.surah}:${ayah.ayah} ayetini okudum`} hitSlop={8} onPress={() => markAyahRead(ayah.surah, ayah.ayah)} style={{ marginLeft: spacing.sm, height: 38, paddingHorizontal: spacing.md, borderRadius: radius.pill, flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: isLastRead ? t.gold : read ? t.goldSoft : t.surface }}><Ionicons name={read ? 'checkmark' : 'checkmark-outline'} size={15} color={isLastRead ? t.onGold : read ? t.gold : t.inkSoft} /><Text style={{ color: isLastRead ? t.onGold : read ? t.gold : t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{isLastRead ? 'Kaldığın yer' : read ? 'Okundu' : 'Okudum'}</Text></Pressable>
        </View>
        <Text selectable style={{ color: t.ink, fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
      </View>;
    })}
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl }}>
      {previousSurah ? <Pressable accessibilityRole="button" accessibilityLabel={`Önceki sûre: ${previousSurah.transliteration}`} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${previousSurah.id}` } })} style={({ pressed }) => ({ flex: 1, minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="chevron-back" size={18} color={t.gold} /><View style={{ marginLeft: spacing.xs, flex: 1 }}><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10 }}>Önceki sûre</Text><Text numberOfLines={1} style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginTop: 2 }}>{previousSurah.transliteration}</Text></View></View></Pressable> : <View style={{ flex: 1 }} />}
      {nextSurah ? <Pressable accessibilityRole="button" accessibilityLabel={`Sonraki sûre: ${nextSurah.transliteration}`} onPress={() => router.push({ pathname: '/surah/[id]', params: { id: `${nextSurah.id}` } })} style={({ pressed }) => ({ flex: 1, minHeight: 58, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ marginRight: spacing.xs, flex: 1, alignItems: 'flex-end' }}><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10 }}>Sonraki sûre</Text><Text numberOfLines={1} style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginTop: 2 }}>{nextSurah.transliteration}</Text></View><Ionicons name="chevron-forward" size={18} color={t.gold} /></View></Pressable> : <View style={{ flex: 1 }} />}
    </View>
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: spacing.xl }}>Kaynak: Tanzil Project · Uthmani Quran Text · CC BY 3.0</Text>
  </Screen>;
}
