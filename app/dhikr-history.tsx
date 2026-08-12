import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { formatLocaleDate, formatLocaleNumber, useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { DAILY_DHIKR_TARGET, dhikrHistoryWithLegacy, dhikrSummary, dhikrTargetStreak, recentDhikrDayKeys } from '@/lib/dhikr';
import { useDhikrStore } from '@/state/useDhikrStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export default function DhikrHistory() {
  const theme = useTheme();
  const { locale, t } = useT();
  const { day, count, history: storedHistory } = useDhikrStore();
  const history = dhikrHistoryWithLegacy(storedHistory ?? {}, day, count);
  const days = recentDhikrDayKeys(30);
  const counts = days.map((key) => Math.max(0, history[key] ?? 0));
  const maxCount = Math.max(DAILY_DHIKR_TARGET, ...counts);
  const streak = dhikrTargetStreak(history);
  const formatDay = (date: Date) => formatLocaleDate(date, { weekday: 'short', day: 'numeric', month: 'short' });

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start' }}><Ionicons name={getDirectionalIconName('arrow-back', locale)} size={20} color={theme.ink} /></Pressable>
    <Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.xl, textAlign: textAlignment(locale) }}>{t('dhikrHistory.title')}</Text>
    <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, lineHeight: 21, marginTop: 6, textAlign: textAlignment(locale) }}>{t('dhikrHistory.subtitle')}</Text>

    <View style={{ flexDirection: rowDirection(locale), gap: spacing.sm, marginTop: spacing.xl }}>{[7, 30, 90].map((period) => {
      const summary = dhikrSummary(history, period);
      return <View key={period} style={{ flex: 1, backgroundColor: theme.surface, borderRadius: radius.inner, paddingVertical: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: theme.gold, fontFamily: fonts.serif, fontSize: 24 }}>{formatLocaleNumber(summary.total)}</Text>
        <Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10, textAlign: 'center' }}>{t('dhikrHistory.summary', { period: formatLocaleNumber(period) })}</Text>
        <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 9, marginTop: 3, textAlign: 'center' }}>{t('dhikrHistory.targetDays', { count: formatLocaleNumber(summary.targetDays) })}</Text>
      </View>;
    })}</View>

    <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', backgroundColor: theme.goldSoft, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md }}>
      <Ionicons name="flame" size={22} color={theme.gold} />
      <View style={{ marginHorizontal: spacing.sm, flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, textAlign: textAlignment(locale) }}>{t('dhikrHistory.streakTitle')}</Text><Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: 2, textAlign: textAlignment(locale) }}>{t('dhikrHistory.streakRule')}</Text></View>
      <View style={{ alignItems: locale === 'ar' ? 'flex-start' : 'flex-end' }}><Text style={{ color: theme.gold, fontFamily: fonts.serif, fontSize: 24 }}>{t('dhikrHistory.days', { count: formatLocaleNumber(streak.current) })}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 9 }}>{t('dhikrHistory.best90', { count: formatLocaleNumber(streak.best) })}</Text></View>
    </View>

    <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.xxl, textAlign: textAlignment(locale) }}>{t('dhikrHistory.last30')}</Text>
    <View style={{ gap: spacing.xs, marginTop: spacing.md }}>{days.map((key, index) => {
      const value = counts[index];
      const reached = value >= DAILY_DHIKR_TARGET;
      return <View key={key} style={{ flexDirection: rowDirection(locale), alignItems: 'center', minHeight: 44, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: index === 0 ? theme.goldSoft : theme.surface }}>
        <Text style={{ width: 96, color: index === 0 ? theme.gold : theme.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11, textAlign: textAlignment(locale) }}>{index === 0 ? t('common.today') : formatDay(dateFromKey(key))}</Text>
        <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: theme.surfaceAlt }}><View style={{ width: `${Math.min(100, (value / maxCount) * 100)}%`, height: 5, borderRadius: 3, backgroundColor: reached ? theme.gold : theme.inkFaint }} /></View>
        <Text style={{ width: 48, textAlign: locale === 'ar' ? 'left' : 'right', color: reached ? theme.gold : value ? theme.ink : theme.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>{formatLocaleNumber(value)}</Text>
      </View>;
    })}</View>
  </Screen>;
}
