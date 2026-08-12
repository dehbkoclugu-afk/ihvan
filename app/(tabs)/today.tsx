import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AyahCard } from '@/components/AyahCard';
import { ProgressRing } from '@/components/ProgressRing';
import { RitualCard } from '@/components/RitualCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StreakMark } from '@/components/StreakMark';
import { dailyAyah } from '@/data/quran';
import { useTheme } from '@/hooks/useTheme';
import { formatLocaleDate, useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { activeStreakCount, dayKey } from '@/lib/dates';
import { DAILY_DHIKR_TARGET } from '@/lib/dhikr';
import { quranGoalPercent, quranReadCount } from '@/lib/quranHabit';
import { useDhikrStore } from '@/state/useDhikrStore';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { useStreakStore, type RitualStep } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Today() {
  const theme = useTheme();
  const { locale, t } = useT();
  const name = useUserStore((state) => state.name);
  const { count, lastTickDay, doneSteps, doneDay, toggleStep, completeStep } = useStreakStore();
  const recordAyahRead = useQuranProgressStore((state) => state.recordAyahRead);
  const readingDays = useQuranProgressStore((state) => state.readingDays);
  const readingGoal = useQuranProgressStore((state) => state.readingGoal);
  const prayerCompletions = usePrayerTrackingStore((state) => state.completions);
  const dhikrDay = useDhikrStore((state) => state.day);
  const dhikrCount = useDhikrStore((state) => state.count);
  const today = dayKey();
  const todayDoneSteps = doneDay === today ? doneSteps : [];
  const streakCount = activeStreakCount(lastTickDay, count);
  const done = (step: RitualStep) => todayDoneSteps.includes(step);
  const readToday = quranReadCount(readingDays);
  const quranPercent = quranGoalPercent(readToday, readingGoal);
  const prayersToday = prayerCompletions[today]?.length ?? 0;
  const dhikrToday = dhikrDay === today ? dhikrCount : 0;
  const ayah = dailyAyah();
  const date = formatLocaleDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' });
  const direction = rowDirection(locale);
  const align = textAlignment(locale);

  useEffect(() => {
    if (dhikrToday >= DAILY_DHIKR_TARGET) completeStep('dhikr');
  }, [completeStep, dhikrToday]);

  return <Screen tabbed>
    <View style={{ flexDirection: direction, justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.3, textAlign: align }}>{date}</Text>
        <Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 29, marginTop: 4, textAlign: align }}>{name ? t('today.greetingNamed', { name }) : t('today.greeting')}</Text>
      </View>
      <StreakMark count={streakCount} label={t('common.day')} accessibilityLabel={t('today.streak', { count: streakCount })} compact />
    </View>

    <View style={{ marginTop: spacing.xl }}><AyahCard ayah={ayah} done={done('ayah')} onComplete={() => {
      if (!done('ayah')) recordAyahRead(ayah.surah, ayah.ayah);
      toggleStep('ayah');
    }} /></View>

    <View style={{ flexDirection: direction, gap: spacing.sm, marginTop: spacing.md }}>
      <ProgressCard
        accessibilityLabel={t('today.quranGoalA11y', { read: readToday, goal: readingGoal })}
        icon="book-outline"
        label={t('today.quranGoal')}
        value={t('quran.goalProgress', { read: readToday, goal: readingGoal })}
        percent={quranPercent}
        onPress={() => router.push('/(tabs)/quran')}
        locale={locale}
      />
      <ProgressCard
        accessibilityLabel={t('today.prayersA11y', { count: prayersToday })}
        icon="time-outline"
        label={t('today.prayers')}
        value={t('today.prayerCount', { count: prayersToday })}
        percent={Math.min(100, prayersToday * 20)}
        onPress={() => router.push('/(tabs)/worship')}
        locale={locale}
      />
    </View>

    <SectionHeader title={t('today.rhythm')} right={<ProgressRing
      done={todayDoneSteps.length}
      total={4}
      size={46}
      strokeWidth={4}
      label={t('today.rhythm')}
      summary={t('today.rhythmProgress', { done: todayDoneSteps.length, total: 4 })}
    ><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansMedium, fontSize: 10 }}>{todayDoneSteps.length}/4</Text></ProgressRing>} />
    <View style={{ gap: spacing.md }}>
      <RitualCard icon="bulb-outline" title={t('today.reflect')} subtitle={t('today.reflectSub')} done={done('meaning')} onPress={() => toggleStep('meaning')} />
      <RitualCard icon="heart-outline" title={t('today.dua')} subtitle={t('today.duaSub')} done={done('dua')} onPress={() => toggleStep('dua')} />
      <RitualCard icon="ellipse-outline" title={t('today.dhikr')} subtitle={t('today.dhikrProgress', { count: Math.min(dhikrToday, DAILY_DHIKR_TARGET), target: DAILY_DHIKR_TARGET })} done={done('dhikr')} onPress={() => router.push('/(tabs)/worship')} />
    </View>
  </Screen>;
}

function ProgressCard({ accessibilityLabel, icon, label, value, percent, onPress, locale }: { accessibilityLabel: string; icon: keyof typeof Ionicons.glyphMap; label: string; value: string; percent: number; onPress: () => void; locale: string }) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => ({ flex: 1, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.inner, padding: spacing.md, opacity: pressed ? 0.75 : 1 })}>
    <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.sm }}>
      <Ionicons name={icon} size={17} color={theme.gold} />
      <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, flex: 1, textAlign: textAlignment(locale) }}>{label}</Text>
      <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={14} color={theme.inkFaint} />
    </View>
    <Text style={{ color: theme.gold, fontFamily: fonts.sansBold, fontSize: 13, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{value}</Text>
    <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.surfaceAlt, marginTop: spacing.sm }}><View style={{ width: `${percent}%`, height: 4, borderRadius: 2, backgroundColor: theme.gold }} /></View>
  </Pressable>;
}
