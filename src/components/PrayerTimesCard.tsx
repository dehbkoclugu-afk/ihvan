import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { formatPrayerTime, nextPrayer, prayerDay } from '@/services/prayerTimes';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import type { PrayerLocation } from '@/hooks/usePrayerLocation';

export function PrayerTimesCard({ location }: { location: PrayerLocation }) {
  const t = useTheme();
  const day = prayerDay(location.latitude, location.longitude);
  const next = nextPrayer(location.latitude, location.longitude);

  return <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.lg }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><Ionicons name="location-outline" size={16} color={t.gold} /><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, flex: 1 }}>{location.label}</Text><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>Sıradaki {next.label} {formatPrayerTime(next.time)}</Text></View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.lg, gap: spacing.sm }}>{day.moments.map((moment) => {
      const isNext = moment.time.getTime() === next.time.getTime();
      return <View key={moment.key} style={{ width: '31%', minWidth: 86, flexGrow: 1, backgroundColor: isNext ? t.goldSoft : t.surfaceAlt, borderRadius: radius.inner, paddingVertical: spacing.md, alignItems: 'center' }}><Text style={{ color: isNext ? t.gold : t.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11 }}>{moment.label}</Text><Text style={{ color: t.ink, fontFamily: fonts.sansBold, fontSize: 17, marginTop: 3 }}>{formatPrayerTime(moment.time)}</Text></View>;
    })}</View>
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, marginTop: spacing.md }}>{day.methodLabel}. Yerel kurum takvimleriyle birkaç dakika fark oluşabilir.</Text>
  </View>;
}
