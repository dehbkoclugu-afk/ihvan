import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { rowDirection, textAlignment } from '@/i18n/direction';
import { formatPrayerCountdown, formatPrayerTime, nextPrayer, prayerDay } from '@/services/prayerTimes';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import type { PrayerLocation } from '@/hooks/usePrayerLocation';

export function PrayerTimesCard({ location }: { location: PrayerLocation }) {
  const theme = useTheme();
  const { locale, t } = useT();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);
  const day = prayerDay(location.latitude, location.longitude, now, locale);
  const next = nextPrayer(location.latitude, location.longitude, now, locale);
  const countdown = formatPrayerCountdown(next.time, now, locale);

  return <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.card, padding: spacing.lg }}>
    <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.sm }}>
      <Ionicons name="location-outline" size={16} color={theme.gold} />
      <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, flex: 1, textAlign: textAlignment(locale) }}>{location.label}</Text>
      <View style={{ alignItems: locale === 'ar' ? 'flex-start' : 'flex-end' }}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 12, textAlign: textAlignment(locale) }}>{t('worship.nextPrayer', { prayer: next.label, time: formatPrayerTime(next.time, undefined, locale) })}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sansMedium, fontSize: 10, marginTop: 2, textAlign: textAlignment(locale) }}>{countdown === t('prayerTimes.countdownNow') ? t('worship.countdownNow') : t('worship.countdownRemaining', { countdown })}</Text></View>
    </View>
    <View style={{ flexDirection: rowDirection(locale), flexWrap: 'wrap', marginTop: spacing.lg, gap: spacing.sm }}>{day.moments.map((moment) => {
      const isNext = moment.time.getTime() === next.time.getTime();
      return <View key={moment.key} style={{ width: '31%', minWidth: 86, flexGrow: 1, backgroundColor: isNext ? theme.goldSoft : theme.surfaceAlt, borderRadius: radius.inner, paddingVertical: spacing.md, alignItems: 'center' }}><Text style={{ color: isNext ? theme.gold : theme.inkSoft, fontFamily: fonts.sansMedium, fontSize: 11 }}>{moment.label}</Text><Text style={{ color: theme.ink, fontFamily: fonts.sansBold, fontSize: 17, marginTop: 3 }}>{formatPrayerTime(moment.time, undefined, locale)}</Text></View>;
    })}</View>
    <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, marginTop: spacing.md, textAlign: textAlignment(locale) }}>{t('worship.methodNotice', { method: day.methodLabel })}</Text>
  </View>;
}
