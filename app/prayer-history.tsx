import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { prayerCompletionPercent, prayerCompletionStreak, prayerPercentFor, recentDayKeys, TRACKED_PRAYERS } from '@/lib/prayerTracking';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

const HISTORY_DAYS = 30;

function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export default function PrayerHistory() {
  const t = useTheme();
  const { completions, togglePrayer } = usePrayerTrackingStore();
  const days = recentDayKeys(HISTORY_DAYS);
  const streak = prayerCompletionStreak(completions);
  const formatDay = new Intl.DateTimeFormat('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });

  return <Screen>
    <Pressable accessibilityLabel="Geri" onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={20} color={t.ink} /></Pressable>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.xl }}>Namaz takibi</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 21, marginTop: 6 }}>Kayıtların yalnızca bu cihazda tutulur. Unuttuğun bir günü kutulara dokunarak düzeltebilirsin.</Text>

    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl }}>
      {[7, 30, 90].map((period) => <View key={period} style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, paddingVertical: spacing.lg, alignItems: 'center' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 25 }}>%{prayerCompletionPercent(completions, period)}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sansMedium, fontSize: 10, marginTop: 3 }}>{period} GÜN</Text></View>)}
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: t.goldSoft, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md }}><Ionicons name="flame" size={22} color={t.gold} /><View style={{ marginLeft: spacing.sm, flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold }}>5/5 namaz serisi</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>Yalnız beş vaktin tamamlandığı günler</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 24 }}>{streak.current} gün</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 9 }}>90 günde en iyi {streak.best}</Text></View></View>

    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.xxl }}>Son 30 gün · vakit bazında</Text>
    <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md }}>{TRACKED_PRAYERS.map((prayer) => <View key={prayer.key} style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, paddingVertical: spacing.md, alignItems: 'center' }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{prayer.label}</Text><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 20, marginTop: 3 }}>%{prayerPercentFor(completions, prayer.key, 30)}</Text></View>)}</View>

    <View style={{ marginTop: spacing.xxl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingBottom: spacing.sm }}><Text style={{ width: 92, color: t.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>GÜN</Text>{TRACKED_PRAYERS.map((prayer) => <Text key={prayer.key} numberOfLines={1} adjustsFontSizeToFit style={{ flex: 1, textAlign: 'center', color: t.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 9 }}>{prayer.label}</Text>)}</View>
      <View style={{ gap: spacing.xs }}>{days.map((key, index) => {
        const completed = completions[key] ?? [];
        const date = dateFromKey(key);
        return <View key={key} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 43, paddingHorizontal: spacing.sm, borderRadius: radius.inner, backgroundColor: index === 0 ? t.goldSoft : t.surface }}>
          <Text numberOfLines={1} style={{ width: 92, color: index === 0 ? t.gold : t.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11 }}>{index === 0 ? 'Bugün' : formatDay.format(date)}</Text>
          {TRACKED_PRAYERS.map((prayer) => {
            const done = completed.includes(prayer.key);
            return <Pressable key={prayer.key} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={`${formatDay.format(date)} ${prayer.label} namazı`} onPress={() => togglePrayer(prayer.key, date)} hitSlop={3} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 43 }}><Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={done ? t.gold : t.inkFaint} /></Pressable>;
          })}
        </View>;
      })}</View>
    </View>
  </Screen>;
}
