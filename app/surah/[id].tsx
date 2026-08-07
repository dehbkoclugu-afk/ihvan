import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { QURAN_SURAHS, getSurahAyahs } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { dayKey } from '@/lib/dates';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function SurahDetail() {
  const t = useTheme();
  const { id, ayah: targetParam } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahId = Number(id);
  const targetAyah = Number(targetParam);
  const surah = QURAN_SURAHS.find((item) => item.id === surahId);
  const scrollRef = useRef<ScrollView>(null);
  const didScroll = useRef(false);
  const { lastRead, bookmarks, readingDays, markAyahRead, toggleBookmark } = useQuranProgressStore();
  const readToday = readingDays[dayKey()] ?? [];
  if (!surah) return <Screen><Text style={{ color: t.ink }}>Sûre bulunamadı.</Text></Screen>;
  const ayahs = getSurahAyahs(surahId);

  return <Screen scrollRef={scrollRef}>
    <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <View style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: t.ink, fontSize: 34, writingDirection: 'rtl' }}>{surah.arabicName}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 30, marginTop: spacing.sm }}>{surah.transliteration}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginTop: 5 }}>{surah.revelationPlace === 'meccan' ? 'Mekke' : 'Medine'} · {surah.ayahCount} ayet</Text></View>
    <View style={{ backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.xl }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 }}>Şimdilik yalnızca doğrulanmış Arapça metin gösteriliyor. Meal ve tefsir için makine çevirisi kullanılmayacak.</Text></View>
    {ayahs.map((ayah, index) => {
      const key = `${ayah.surah}:${ayah.ayah}`;
      const bookmarked = bookmarks.includes(key);
      const read = readToday.includes(key);
      const isLastRead = lastRead?.surah === ayah.surah && lastRead.ayah === ayah.ayah;
      return <View key={key} onLayout={(event) => {
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
        <Text selectable style={{ color: t.ink, fontSize: 29, lineHeight: 52, textAlign: 'right', writingDirection: 'rtl', marginTop: spacing.md }}>{ayah.text}</Text>
      </View>;
    })}
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginVertical: spacing.xl }}>Kaynak: Tanzil Project · Uthmani Quran Text · CC BY 3.0</Text>
  </Screen>;
}
