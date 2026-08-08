import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { DAILY_DHIKR_TARGET, dhikrHistoryWithLegacy, dhikrSummary, dhikrTargetStreak, recentDhikrDayKeys } from '@/lib/dhikr';
import { useDhikrStore } from '@/state/useDhikrStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export default function DhikrHistory() {
  const t = useTheme();
  const { day, count, history: storedHistory } = useDhikrStore();
  const history = dhikrHistoryWithLegacy(storedHistory ?? {}, day, count);
  const days = recentDhikrDayKeys(30);
  const counts = days.map((key) => Math.max(0, history[key] ?? 0));
  const maxCount = Math.max(DAILY_DHIKR_TARGET, ...counts);
  const streak = dhikrTargetStreak(history);
  const formatDay = new Intl.DateTimeFormat('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.xl }}>Zikir geçmişi</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 21, marginTop: 6 }}>Sayaç geçmişin yalnızca bu cihazda, son 90 gün için tutulur.</Text>

    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl }}>{[7, 30, 90].map((period) => {
      const summary = dhikrSummary(history, period);
      return <View key={period} style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, paddingVertical: spacing.lg, alignItems: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 24 }}>{summary.total}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>ZİKİR · {period} GÜN</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 9, marginTop: 3 }}>{summary.targetDays} hedef günü</Text></View>;
    })}</View>

    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md }}><Ionicons name="flame" size={22} color={t.gold} /><View style={{ marginLeft: spacing.sm, flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold }}>33 zikir serisi</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>Yalnız günlük hedef tamamlanınca sayılır</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 24 }}>{streak.current} gün</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 9 }}>90 günde en iyi {streak.best}</Text></View></View>

    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.xxl }}>Son 30 gün</Text>
    <View style={{ gap: spacing.xs, marginTop: spacing.md }}>{days.map((key, index) => {
      const value = counts[index];
      const reached = value >= DAILY_DHIKR_TARGET;
      return <View key={key} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 42, paddingHorizontal: spacing.md, borderRadius: radius.inner, backgroundColor: index === 0 ? t.goldSoft : t.surface }}><Text style={{ width: 96, color: index === 0 ? t.gold : t.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11 }}>{index === 0 ? 'Bugün' : formatDay.format(dateFromKey(key))}</Text><View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt }}><View style={{ width: `${Math.min(100, (value / maxCount) * 100)}%`, height: 5, borderRadius: 3, backgroundColor: reached ? t.gold : t.inkFaint }} /></View><Text style={{ width: 48, textAlign: 'right', color: reached ? t.gold : value ? t.ink : t.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>{value}</Text></View>;
    })}</View>
  </Screen>;
}
