import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { ArtSlot } from '@/components/ArtSlot';
import { PrayerTimesCard } from '@/components/PrayerTimesCard';
import { QiblaCard } from '@/components/QiblaCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { dailyDua, DHIKR } from '@/data/duas';
import { useArtwork } from '@/hooks/useArtwork';
import { usePrayerLocation } from '@/hooks/usePrayerLocation';
import { useTheme } from '@/hooks/useTheme';
import { formatLocaleNumber, useT } from '@/i18n';
import { rowDirection, textAlignment } from '@/i18n/direction';
import { dayKey } from '@/lib/dates';
import { DAILY_DHIKR_TARGET, dhikrCountForDay, isDailyDhikrTargetReached } from '@/lib/dhikr';
import { prayerCompletionStreak, TRACKED_PRAYERS, type TrackedPrayerKey } from '@/lib/prayerTracking';
import { selectionFeedback, successFeedback } from '@/services/haptics';
import { cancelPrayerNotifications, enablePrayerNotifications, refreshPrayerNotifications } from '@/services/prayerNotifications';
import type { PrayerReminderOffset } from '@/services/prayerTimes';
import { useDhikrStore } from '@/state/useDhikrStore';
import { usePrayerSettingsStore } from '@/state/usePrayerSettingsStore';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { useStreakStore } from '@/state/useStreakStore';
import { radius, spacing } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

const reminderOffsets: PrayerReminderOffset[] = [0, 5, 10, 15, 30];

export default function Worship() {
  const theme = useTheme();
  const artwork = useArtwork();
  const { locale, t } = useT();
  const { day: dhikrDay, count, increment, reset } = useDhikrStore();
  const completeRitualStep = useStreakStore((state) => state.completeStep);
  const { location, permission, canAskAgain, loading, error, requestLocation, openLocationSettings, refresh } = usePrayerLocation();
  const { notificationsEnabled, reminderMinutesBefore, notificationPrayers, setNotificationsEnabled, setReminderMinutesBefore, toggleNotificationPrayer } = usePrayerSettingsStore();
  const { completions, togglePrayer } = usePrayerTrackingStore();
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationNeedsSettings, setNotificationNeedsSettings] = useState(false);
  const notificationOperation = useRef(0);
  const lastScheduledSignature = useRef<string | null>(null);
  const dua = dailyDua();
  const completedPrayers = completions[dayKey()] ?? [];
  const prayerStreak = prayerCompletionStreak(completions);
  const todayDhikrCount = dhikrCountForDay(dhikrDay, count);
  const prayerLabel = (key: TrackedPrayerKey) => t(`prayer.${key}`);

  function incrementDhikr() {
    const nextCount = todayDhikrCount + 1;
    if (nextCount === DAILY_DHIKR_TARGET) successFeedback();
    else selectionFeedback();
    increment();
    if (isDailyDhikrTargetReached(nextCount)) completeRitualStep('dhikr');
  }

  useEffect(() => {
    if (!location || !notificationsEnabled) {
      notificationOperation.current += 1;
      setNotificationBusy(false);
      return;
    }
    const signature = [location.latitude, location.longitude, location.label, reminderMinutesBefore, ...notificationPrayers].join('|');
    if (lastScheduledSignature.current === signature) return;
    const operation = ++notificationOperation.current;
    if (!notificationPrayers.length) {
      setNotificationBusy(true);
      void cancelPrayerNotifications().then(() => {
        if (notificationOperation.current !== operation) return;
        lastScheduledSignature.current = null;
        setNotificationBusy(false);
        setNotificationsEnabled(false);
      }).catch(() => {
        if (notificationOperation.current !== operation) return;
        lastScheduledSignature.current = null;
        setNotificationBusy(false);
        setNotificationNeedsSettings(false);
        setNotificationError(t('worship.notificationNoPrayerCleanupFailed'));
        setNotificationsEnabled(false);
      });
      return () => { if (notificationOperation.current === operation) notificationOperation.current += 1; };
    }
    const timeout = setTimeout(() => {
      setNotificationBusy(true);
      setNotificationError(null);
      setNotificationNeedsSettings(false);
      void refreshPrayerNotifications(location.latitude, location.longitude, location.label, reminderMinutesBefore, notificationPrayers).then((ok) => {
        if (notificationOperation.current !== operation) return;
        if (ok) lastScheduledSignature.current = signature;
        else {
          lastScheduledSignature.current = null;
          setNotificationsEnabled(false);
          setNotificationNeedsSettings(true);
          setNotificationError(t('worship.notificationPermissionSettings'));
        }
      }).catch(() => {
        if (notificationOperation.current !== operation) return;
        lastScheduledSignature.current = null;
        setNotificationsEnabled(false);
        setNotificationNeedsSettings(false);
        setNotificationError(t('worship.notificationRefreshFailed'));
      }).finally(() => {
        if (notificationOperation.current === operation) setNotificationBusy(false);
      });
    }, 250);
    return () => {
      clearTimeout(timeout);
      if (notificationOperation.current === operation) notificationOperation.current += 1;
    };
  }, [location, notificationsEnabled, reminderMinutesBefore, notificationPrayers, setNotificationsEnabled, t]);

  async function toggleNotifications() {
    if (!location || notificationBusy) return;
    const operation = ++notificationOperation.current;
    setNotificationBusy(true);
    setNotificationError(null);
    setNotificationNeedsSettings(false);
    try {
      if (notificationsEnabled) {
        await cancelPrayerNotifications();
        if (notificationOperation.current !== operation) return;
        lastScheduledSignature.current = null;
        setNotificationsEnabled(false);
      } else {
        if (!notificationPrayers.length) {
          setNotificationError(t('worship.notificationSelectPrayer'));
          return;
        }
        await enablePrayerNotifications(location.latitude, location.longitude, location.label, reminderMinutesBefore, notificationPrayers);
        if (notificationOperation.current !== operation) return;
        lastScheduledSignature.current = [location.latitude, location.longitude, location.label, reminderMinutesBefore, ...notificationPrayers].join('|');
        setNotificationsEnabled(true);
      }
    } catch (cause) {
      if (notificationOperation.current !== operation) return;
      const message = cause instanceof Error ? cause.message : t('worship.notificationChangeFailed');
      setNotificationError(message);
      setNotificationNeedsSettings(message === t('prayerNotification.permissionDenied'));
    } finally {
      if (notificationOperation.current === operation) setNotificationBusy(false);
    }
  }

  const locationNeedsSettings = permission === 'denied' && !canAskAgain;

  return <Screen tabbed>
    <Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 32, textAlign: textAlignment(locale) }}>{t('worship.title')}</Text>
    <SectionHeader title={t('worship.todayPrayers')} right={<Text style={{ color: theme.inkSoft, fontFamily: fonts.sansMedium }}>{formatLocaleNumber(completedPrayers.length)}/5</Text>} />
    <View style={{ flexDirection: rowDirection(locale), gap: spacing.sm }}>{TRACKED_PRAYERS.map((prayer) => {
      const done = completedPrayers.includes(prayer.key);
      return <Pressable key={prayer.key} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={t('worship.prayerCompleteA11y', { prayer: prayerLabel(prayer.key) })} onPress={() => { selectionFeedback(); togglePrayer(prayer.key); }} style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 60, borderRadius: radius.inner, borderWidth: 1, borderColor: done ? theme.gold : theme.border, backgroundColor: done ? theme.goldSoft : theme.surface, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.75 : 1 })}><Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={done ? theme.gold : theme.inkFaint} /><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: done ? theme.gold : theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10, marginTop: 5 }}>{prayerLabel(prayer.key)}</Text></Pressable>;
    })}</View>
    <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.sm }}><Ionicons name="flame-outline" size={14} color={theme.gold} /><Text style={{ color: theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10, marginHorizontal: 4 }}>{t('worship.prayerStreak', { count: formatLocaleNumber(prayerStreak.current) })}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginStart: 'auto' }}>{t('worship.prayerStreakBest', { count: formatLocaleNumber(prayerStreak.best) })}</Text></View>

    <SectionHeader title={t('worship.prayerTimes')} right={location ? <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.refreshPrayerTimes')} onPress={() => void refresh()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="refresh" size={17} color={theme.gold} /></Pressable> : undefined} />
    {location ? <>
      <View style={{ marginTop: spacing.sm }}><PrayerTimesCard location={location} /></View>
      <Pressable accessibilityRole="button" accessibilityLabel={t(notificationsEnabled ? 'worship.notificationsCloseA11y' : 'worship.notificationsOpenA11y')} accessibilityState={{ disabled: notificationBusy }} disabled={notificationBusy} onPress={() => void toggleNotifications()} style={{ marginTop: spacing.sm, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.inner, padding: spacing.md, flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.sm, opacity: notificationBusy ? 0.6 : 1 }}>
        <Ionicons name={notificationsEnabled ? 'notifications' : 'notifications-outline'} size={19} color={notificationsEnabled ? theme.gold : theme.inkSoft} />
        <View style={{ flex: 1 }}><Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 13, textAlign: textAlignment(locale) }}>{t('worship.notifications')}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginTop: 2, textAlign: textAlignment(locale) }}>{notificationsEnabled ? t('worship.notificationsOn', { count: formatLocaleNumber(notificationPrayers.length), days: formatLocaleNumber(10) }) : t('worship.notificationsOff')}</Text></View>
        {notificationBusy ? <ActivityIndicator size="small" color={theme.gold} /> : <Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{t(notificationsEnabled ? 'common.close' : 'common.open')}</Text>}
      </Pressable>
      <View style={{ marginTop: spacing.sm, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.inner, padding: spacing.md, opacity: notificationBusy ? 0.65 : 1 }}>
        <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, textAlign: textAlignment(locale) }}>{t('worship.notificationPrayers')}</Text>
        <View style={{ flexDirection: rowDirection(locale), gap: spacing.xs, marginTop: spacing.sm }}>{TRACKED_PRAYERS.map((prayer) => {
          const selected = notificationPrayers.includes(prayer.key);
          return <Pressable key={prayer.key} accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled: notificationBusy }} accessibilityLabel={t('worship.notificationPrayerA11y', { prayer: prayerLabel(prayer.key) })} disabled={notificationBusy} onPress={() => toggleNotificationPrayer(prayer.key)} style={{ flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? theme.gold : theme.surfaceAlt }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: selected ? theme.onGold : theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{prayerLabel(prayer.key)}</Text></Pressable>;
        })}</View>
        <Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{t('worship.notificationSelected', { count: formatLocaleNumber(notificationPrayers.length), total: formatLocaleNumber(5) })}</Text>
      </View>
      <View style={{ marginTop: spacing.sm, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.inner, padding: spacing.md, opacity: notificationBusy ? 0.65 : 1 }}>
        <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, textAlign: textAlignment(locale) }}>{t('worship.notificationTime')}</Text>
        <View accessibilityRole="radiogroup" style={{ flexDirection: rowDirection(locale), gap: spacing.xs, marginTop: spacing.sm }}>{reminderOffsets.map((minutes) => <Pressable key={minutes} accessibilityRole="radio" accessibilityState={{ selected: reminderMinutesBefore === minutes, disabled: notificationBusy }} disabled={notificationBusy} onPress={() => setReminderMinutesBefore(minutes)} style={{ flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: reminderMinutesBefore === minutes ? theme.gold : theme.surfaceAlt }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: reminderMinutesBefore === minutes ? theme.onGold : theme.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{minutes ? t('worship.notificationMinutesBefore', { minutes: formatLocaleNumber(minutes) }) : t('worship.notificationExact')}</Text></Pressable>)}</View>
      </View>
      {notificationError ? <View accessibilityRole="alert" style={{ marginTop: spacing.sm, alignItems: locale === 'ar' ? 'flex-end' : 'flex-start' }}><Text style={{ color: theme.danger, fontFamily: fonts.sans, fontSize: 11, textAlign: textAlignment(locale) }}>{notificationError}</Text>{notificationNeedsSettings ? <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings().catch(() => setNotificationError(t('worship.notificationSettingsOpenFailed')))} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>{t('worship.openNotificationSettings')}</Text></Pressable> : null}</View> : null}
      <View style={{ marginTop: spacing.sm }}><QiblaCard location={location} /></View>
    </> : <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.card, padding: spacing.xl, alignItems: 'center', marginTop: spacing.sm }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="navigate-outline" size={23} color={theme.gold} /></View>
      <Text style={{ color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.md, textAlign: 'center' }}>{t('worship.openLocation')}</Text>
      <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.sm }}>{t('worship.locationExplanation')}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t(locationNeedsSettings ? 'worship.openLocationSettings' : 'worship.useLocation')} accessibilityState={{ disabled: loading }} disabled={loading} onPress={() => void (locationNeedsSettings ? openLocationSettings() : requestLocation())} style={{ minHeight: 44, justifyContent: 'center', backgroundColor: theme.gold, borderRadius: radius.pill, paddingHorizontal: spacing.xl, marginTop: spacing.lg, opacity: loading ? 0.6 : 1 }}>{loading ? <ActivityIndicator color={theme.onGold} /> : <Text style={{ color: theme.onGold, fontFamily: fonts.sansBold }}>{t(locationNeedsSettings ? 'worship.openLocationSettings' : 'worship.useLocation')}</Text>}</Pressable>
      {error ? <Text accessibilityRole="alert" style={{ color: theme.danger, fontFamily: fonts.sans, fontSize: 11, textAlign: 'center', marginTop: spacing.sm }}>{error}</Text> : null}
    </View>}

    <SectionHeader title={t('worship.dua')} />
    <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.card, padding: spacing.xl }}><Text style={{ color: theme.ink, fontSize: 30, lineHeight: 48, textAlign: 'right', writingDirection: 'rtl' }}>{dua.arabic}</Text><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, marginTop: spacing.md, textAlign: textAlignment(locale) }}>{dua.reference}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{t('worship.duaSourceNote')}</Text></View>

    <SectionHeader title={t('worship.dhikrCounter')} right={<View style={{ flexDirection: rowDirection(locale), gap: spacing.sm }}><Pressable accessibilityRole="button" onPress={() => router.push('/dhikr-history')} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm }}><Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold }}>{t('common.history')}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={t('worship.resetDhikrA11y')} onPress={reset} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm }}><Text style={{ color: theme.danger, fontFamily: fonts.sansSemiBold }}>{t('common.reset')}</Text></Pressable></View>} />
    <ArtSlot id="I7-dhikr" variant="hero" height={190}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('worship.dhikrCounterA11y', { count: formatLocaleNumber(todayDhikrCount), target: formatLocaleNumber(DAILY_DHIKR_TARGET) })} onPress={incrementDhikr} style={({ pressed }) => ({ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}><Text style={{ color: artwork.foreground, fontFamily: fonts.serif, fontSize: 58 }}>{formatLocaleNumber(todayDhikrCount)}</Text><Text style={{ color: artwork.foregroundMuted, fontFamily: fonts.sansMedium, marginTop: 6 }}>{t('worship.dhikrCounterHint', { target: formatLocaleNumber(DAILY_DHIKR_TARGET) })}</Text></Pressable>
    </ArtSlot>
    <View style={{ flexDirection: rowDirection(locale), gap: spacing.sm, marginTop: spacing.md }}>{DHIKR.map((item) => <View key={item.title} style={{ flex: 1, minWidth: 0, paddingHorizontal: spacing.xs, paddingVertical: spacing.md, backgroundColor: theme.surface, borderRadius: radius.inner, alignItems: 'center' }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ width: '100%', color: theme.ink, fontFamily: fonts.sansSemiBold, fontSize: 12, textAlign: 'center' }}>{item.title}</Text><Text style={{ color: theme.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>{formatLocaleNumber(item.target)}</Text></View>)}</View>
    <SectionHeader title={t('worship.next')} />
    <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, lineHeight: 22, textAlign: textAlignment(locale) }}>{t('worship.audioPending')}</Text>
  </Screen>;
}
