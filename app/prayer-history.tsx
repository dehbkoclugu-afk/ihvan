import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { formatLocaleDate, formatLocaleNumber, useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { prayerCompletionPercent, prayerCompletionStreak, prayerDayFilterMatches, prayerPercentFor, recentDayKeys, TRACKED_PRAYERS, type PrayerDayFilter, type TrackedPrayerKey } from '@/lib/prayerTracking';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export default function PrayerHistory() {
  const theme = useTheme();
  const { locale, t } = useT();
  const { completions, togglePrayer } = usePrayerTrackingStore();
  const [historyDays, setHistoryDays] = useState<30 | 90>(30);
  const [statsPeriod, setStatsPeriod] = useState<7 | 30 | 90>(30);
  const [dayFilter, setDayFilter] = useState<PrayerDayFilter>('all');
  const days = recentDayKeys(historyDays);
  const visibleDays = days.filter((key) => prayerDayFilterMatches(completions[key] ?? [], dayFilter));
  const streak = prayerCompletionStreak(completions);
  const formatDay = (date: Date) => formatLocaleDate(date, { weekday: 'short', day: 'numeric', month: 'short' });
  const prayerLabel = (key: TrackedPrayerKey) => t(`prayer.${key}`);

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start' }}><Ionicons name={getDirectionalIconName('arrow-back', locale)} size={20} color={theme.ink} /></Pressable>
    <Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.xl, textAlign: textAlignment(locale) }}>{t('prayerHistory.title')}</Text>
    <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, lineHeight: 21, marginTop: 6, textAlign: textAlignment(locale) }}>{t('prayerHistory.subtitle')}</Text>

    <View style={{ flexDirection: rowDirection(locale), gap: spacing.sm, marginTop: spacing.xl }}>
      {[7, 30, 90].map((period) => <View key={period} style={{ flex: 1, backgroundColor: theme.surface, borderRadius: radius.inner, paddingVertical: spacing.lg, alignItems: 'center' }}><Text style={{ color: theme.gold, fontFamily: fonts.serif, fontSize: 25 }}>%{formatLocaleNumber(prayerCompletionPercent(completions, period))}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sansMedium, fontSize: 10, marginTop: 3 }}>{t('prayerHistory.days', { count: formatLocaleNumber(period) })}</Text></View>)}
    </View>

    <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md }}>
      <Ionicons name="flame" size={22} color={theme.gold} />
      <View style={{ marginHorizontal: spacing.sm, flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, textAlign: textAlignment(locale) }}>{t('prayerHistory.streakTitle')}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: 2, textAlign: textAlignment(locale) }}>{t('prayerHistory.streakRule')}</Text></View>
      <View style={{ alignItems: locale === 'ar' ? 'flex-start' : 'flex-end' }}><Text style={{ color: theme.gold, fontFamily: fonts.serif, fontSize: 24 }}>{t('prayerHistory.currentDays', { count: formatLocaleNumber(streak.current) })}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 9 }}>{t('prayerHistory.best90', { count: formatLocaleNumber(streak.best) })}</Text></View>
    </View>

    <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', marginTop: spacing.xxl }}>
      <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, flex: 1, textAlign: textAlignment(locale) }}>{t('prayerHistory.byPrayer')}</Text>
      <View accessibilityRole="radiogroup" style={{ flexDirection: rowDirection(locale), gap: spacing.xs }}>{([7, 30, 90] as const).map((period) => <Pressable key={period} accessibilityRole="radio" accessibilityState={{ selected: statsPeriod === period }} onPress={() => setStatsPeriod(period)} style={{ minWidth: 44, minHeight: 44, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: statsPeriod === period ? theme.gold : theme.surface }}><Text style={{ color: statsPeriod === period ? theme.onGold : theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{t('prayerHistory.shortDays', { count: formatLocaleNumber(period) })}</Text></Pressable>)}</View>
    </View>
    <View style={{ flexDirection: rowDirection(locale), gap: spacing.xs, marginTop: spacing.md }}>{TRACKED_PRAYERS.map((prayer) => <View key={prayer.key} style={{ flex: 1, backgroundColor: theme.surface, borderRadius: radius.inner, paddingVertical: spacing.md, alignItems: 'center' }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{prayerLabel(prayer.key)}</Text><Text style={{ color: theme.gold, fontFamily: fonts.serif, fontSize: 20, marginTop: 3 }}>%{formatLocaleNumber(prayerPercentFor(completions, prayer.key, statsPeriod))}</Text></View>)}</View>

    <View style={{ marginTop: spacing.xxl }}>
      <View style={{ flexDirection: rowDirection(locale), alignItems: 'center' }}>
        <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, flex: 1, textAlign: textAlignment(locale) }}>{t('prayerHistory.editable')}</Text>
        <View accessibilityRole="radiogroup" style={{ flexDirection: rowDirection(locale), gap: spacing.xs }}>{([30, 90] as const).map((period) => <Pressable key={period} accessibilityRole="radio" accessibilityState={{ selected: historyDays === period }} onPress={() => setHistoryDays(period)} style={{ minWidth: 52, minHeight: 44, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: historyDays === period ? theme.gold : theme.surface }}><Text style={{ color: historyDays === period ? theme.onGold : theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{t('prayerHistory.days', { count: formatLocaleNumber(period) })}</Text></Pressable>)}</View>
      </View>
      <View accessibilityRole="radiogroup" style={{ flexDirection: rowDirection(locale), gap: spacing.sm, marginTop: spacing.md }}>{([['all', 'prayerHistory.filterAll'], ['incomplete', 'prayerHistory.filterIncomplete'], ['complete', 'prayerHistory.filterComplete']] as const).map(([filter, label]) => <Pressable key={filter} accessibilityRole="radio" accessibilityState={{ selected: dayFilter === filter }} onPress={() => setDayFilter(filter)} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: dayFilter === filter ? theme.goldSoft : theme.surface }}><Text style={{ color: dayFilter === filter ? theme.gold : theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{t(label)}</Text></Pressable>)}</View>
      <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm, marginTop: spacing.lg }}><Text style={{ width: 92, color: theme.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 10, textAlign: textAlignment(locale) }}>{t('common.day')}</Text>{TRACKED_PRAYERS.map((prayer) => <Text key={prayer.key} numberOfLines={1} adjustsFontSizeToFit style={{ flex: 1, textAlign: 'center', color: theme.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 9 }}>{prayerLabel(prayer.key)}</Text>)}</View>
      <View style={{ gap: spacing.xs }}>{visibleDays.map((key) => {
        const completed = completions[key] ?? [];
        const date = dateFromKey(key);
        const isToday = key === days[0];
        const dateLabel = formatDay(date);
        return <View key={key} style={{ flexDirection: rowDirection(locale), alignItems: 'center', minHeight: 44, paddingHorizontal: spacing.sm, borderRadius: radius.inner, backgroundColor: isToday ? theme.goldSoft : theme.surface }}>
          <Text numberOfLines={1} style={{ width: 92, color: isToday ? theme.gold : theme.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11, textAlign: textAlignment(locale) }}>{isToday ? t('common.today') : dateLabel}</Text>
          {TRACKED_PRAYERS.map((prayer) => {
            const done = completed.includes(prayer.key);
            return <Pressable key={prayer.key} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={t('prayerHistory.prayerA11y', { date: dateLabel, prayer: prayerLabel(prayer.key) })} onPress={() => togglePrayer(prayer.key, date)} hitSlop={3} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44 }}><Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={done ? theme.gold : theme.inkFaint} /></Pressable>;
          })}
        </View>;
      })}</View>
      {!visibleDays.length ? <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, textAlign: 'center', marginVertical: spacing.xl }}>{t('prayerHistory.empty')}</Text> : null}
    </View>
  </Screen>;
}
