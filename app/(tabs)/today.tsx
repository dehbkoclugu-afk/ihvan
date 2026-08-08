import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AyahCard } from '@/components/AyahCard';
import { RitualCard } from '@/components/RitualCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { dailyAyah } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { useStreakStore, type RitualStep } from '@/state/useStreakStore';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { useDhikrStore } from '@/state/useDhikrStore';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { activeStreakCount, dayKey } from '@/lib/dates';
import { DAILY_DHIKR_TARGET } from '@/lib/dhikr';
import { quranGoalPercent, quranReadCount } from '@/lib/quranHabit';

export default function Today() {
  const t = useTheme();
  const name = useUserStore((s) => s.name);
  const { count, lastTickDay, doneSteps, doneDay, toggleStep, completeStep } = useStreakStore();
  const recordAyahRead = useQuranProgressStore((s) => s.recordAyahRead);
  const readingDays = useQuranProgressStore((s) => s.readingDays);
  const readingGoal = useQuranProgressStore((s) => s.readingGoal);
  const prayerCompletions = usePrayerTrackingStore((s) => s.completions);
  const dhikrDay = useDhikrStore((s) => s.day);
  const dhikrCount = useDhikrStore((s) => s.count);
  const today = dayKey();
  const todayDoneSteps = doneDay === today ? doneSteps : [];
  const streakCount = activeStreakCount(lastTickDay, count);
  const done = (step: RitualStep) => todayDoneSteps.includes(step);
  const readToday = quranReadCount(readingDays);
  const quranPercent = quranGoalPercent(readToday, readingGoal);
  const prayersToday = prayerCompletions[today]?.length ?? 0;
  const dhikrToday = dhikrDay === today ? dhikrCount : 0;
  const ayah = dailyAyah();
  const date = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  useEffect(() => {
    if (dhikrToday >= DAILY_DHIKR_TARGET) completeStep('dhikr');
  }, [completeStep, dhikrToday]);

  return <Screen tabbed>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.6 }}>{date}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 29, marginTop: 4 }}>Selam{name ? `, ${name}` : ''}</Text></View>
      <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, paddingHorizontal: 13, paddingVertical: 10, alignItems: 'center' }}><Text style={{ fontSize: 20 }}>🔥</Text><Text style={{ color: t.ink, fontFamily: fonts.sansBold, fontSize: 12 }}>{streakCount} gün</Text></View>
    </View>
    <View style={{ marginTop: spacing.xl }}><AyahCard ayah={ayah} done={done('ayah')} onComplete={() => {
      if (!done('ayah')) recordAyahRead(ayah.surah, ayah.ayah);
      toggleStep('ayah');
    }} /></View>
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Kur’an hedefi ${readToday}/${readingGoal} ayet`} onPress={() => router.push('/(tabs)/quran')} style={({ pressed }) => ({ flex: 1, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.md, opacity: pressed ? 0.75 : 1 })}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="book-outline" size={17} color={t.gold} /><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginLeft: spacing.sm, flex: 1 }}>Kur’an hedefi</Text><Ionicons name="chevron-forward" size={14} color={t.inkFaint} /></View>
        <Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 13, marginTop: spacing.sm }}>{readToday}/{readingGoal} ayet</Text>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: t.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${quranPercent}%`, height: 4, borderRadius: 2, backgroundColor: t.gold }} /></View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Bugünkü namazlar ${prayersToday}/5`} onPress={() => router.push('/(tabs)/worship')} style={({ pressed }) => ({ flex: 1, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.md, opacity: pressed ? 0.75 : 1 })}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}><Ionicons name="time-outline" size={17} color={t.gold} /><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, marginLeft: spacing.sm, flex: 1 }}>Namazlar</Text><Ionicons name="chevron-forward" size={14} color={t.inkFaint} /></View>
        <Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 13, marginTop: spacing.sm }}>{prayersToday}/5 vakit</Text>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: t.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${Math.min(100, prayersToday * 20)}%`, height: 4, borderRadius: 2, backgroundColor: t.gold }} /></View>
      </Pressable>
    </View>
    <SectionHeader title="Bugünün ritmi" right={<Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium }}>{todayDoneSteps.length}/4</Text>} />
    <View style={{ gap: spacing.md }}>
      <RitualCard icon="bulb-outline" title="Anlam üzerinde düşün" subtitle="2 dakikalık sessiz bir ara" done={done('meaning')} onPress={() => toggleStep('meaning')} />
      <RitualCard icon="heart-outline" title="Günün duası" subtitle="Kısa bir niyet ve dua" done={done('dua')} onPress={() => toggleStep('dua')} />
      <RitualCard icon="ellipse-outline" title="33 zikir" subtitle={`${Math.min(dhikrToday, DAILY_DHIKR_TARGET)}/${DAILY_DHIKR_TARGET} · sayacı aç`} done={done('dhikr')} onPress={() => router.push('/(tabs)/worship')} />
    </View>
  </Screen>;
}
