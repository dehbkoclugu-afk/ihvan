import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { PrayerTimesCard } from '@/components/PrayerTimesCard';
import { QiblaCard } from '@/components/QiblaCard';
import { dailyDua, DHIKR } from '@/data/duas';
import { useTheme } from '@/hooks/useTheme';
import { usePrayerLocation } from '@/hooks/usePrayerLocation';
import { useDhikrStore } from '@/state/useDhikrStore';
import { usePrayerSettingsStore } from '@/state/usePrayerSettingsStore';
import { cancelPrayerNotifications, enablePrayerNotifications, refreshPrayerNotifications } from '@/services/prayerNotifications';
import { selectionFeedback, successFeedback } from '@/services/haptics';
import { dayKey } from '@/lib/dates';
import { DAILY_DHIKR_TARGET, dhikrCountForDay, isDailyDhikrTargetReached } from '@/lib/dhikr';
import { prayerCompletionStreak, TRACKED_PRAYERS } from '@/lib/prayerTracking';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { useStreakStore } from '@/state/useStreakStore';
import type { PrayerReminderOffset } from '@/services/prayerTimes';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Worship() {
  const t = useTheme();
  const { day: dhikrDay, count, increment, reset } = useDhikrStore();
  const completeRitualStep = useStreakStore((state) => state.completeStep);
  const { location, permission, canAskAgain, loading, error, requestLocation, openLocationSettings, refresh } = usePrayerLocation();
  const { notificationsEnabled, reminderMinutesBefore, notificationPrayers, setNotificationsEnabled, setReminderMinutesBefore, toggleNotificationPrayer } = usePrayerSettingsStore();
  const { completions, togglePrayer } = usePrayerTrackingStore();
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationNeedsSettings, setNotificationNeedsSettings] = useState(false);
  const dua = dailyDua();
  const completedPrayers = completions[dayKey()] ?? [];
  const prayerStreak = prayerCompletionStreak(completions);
  const todayDhikrCount = dhikrCountForDay(dhikrDay, count);

  function incrementDhikr() {
    const nextCount = todayDhikrCount + 1;
    if (nextCount === DAILY_DHIKR_TARGET) successFeedback();
    else selectionFeedback();
    increment();
    if (isDailyDhikrTargetReached(nextCount)) completeRitualStep('dhikr');
  }

  useEffect(() => {
    if (!location || !notificationsEnabled) return;
    if (!notificationPrayers.length) {
      void cancelPrayerNotifications().finally(() => setNotificationsEnabled(false));
      return;
    }
    void refreshPrayerNotifications(location.latitude, location.longitude, location.label, reminderMinutesBefore, notificationPrayers).then((ok) => {
      if (!ok) {
        setNotificationsEnabled(false);
        setNotificationNeedsSettings(true);
        setNotificationError('Bildirim izni kapalı. İzni cihaz ayarlarından açabilirsin.');
      }
    }).catch(() => {
      // schedule() rolls a failed batch back, so persisted UI state must also
      // stop claiming that reminders are active.
      setNotificationsEnabled(false);
      setNotificationNeedsSettings(false);
      setNotificationError('Vakit bildirimleri yenilenemedi. Bildirimler kapatıldı; daha sonra tekrar açabilirsin.');
    });
  }, [location, notificationsEnabled, reminderMinutesBefore, notificationPrayers, setNotificationsEnabled]);

  async function toggleNotifications() {
    if (!location || notificationBusy) return;
    setNotificationBusy(true);
    setNotificationError(null);
    setNotificationNeedsSettings(false);
    try {
      if (notificationsEnabled) {
        await cancelPrayerNotifications();
        setNotificationsEnabled(false);
      } else {
        if (!notificationPrayers.length) {
          setNotificationError('Bildirim almak için en az bir namaz seç.');
          return;
        }
        await enablePrayerNotifications(location.latitude, location.longitude, location.label, reminderMinutesBefore, notificationPrayers);
        setNotificationsEnabled(true);
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Bildirim ayarı değiştirilemedi.';
      setNotificationError(message);
      setNotificationNeedsSettings(message === 'Bildirim izni verilmedi.');
    } finally {
      setNotificationBusy(false);
    }
  }

  const locationNeedsSettings = permission === 'denied' && !canAskAgain;

  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>İbadet</Text>
    <SectionHeader title="Bugünkü namazlar" right={<Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium }}>{completedPrayers.length}/5</Text>} />
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>{TRACKED_PRAYERS.map((prayer) => {
      const done = completedPrayers.includes(prayer.key);
      return <Pressable key={prayer.key} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={`${prayer.label} namazını kıldım`} onPress={() => { selectionFeedback(); togglePrayer(prayer.key); }} style={({ pressed }) => ({ flex: 1, minWidth: 0, paddingVertical: spacing.md, borderRadius: radius.inner, borderWidth: 1, borderColor: done ? t.gold : t.border, backgroundColor: done ? t.goldSoft : t.surface, alignItems: 'center', opacity: pressed ? 0.75 : 1 })}><Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={done ? t.gold : t.inkFaint} /><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: done ? t.gold : t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10, marginTop: 5 }}>{prayer.label}</Text></Pressable>;
    })}</View>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.sm }}><Ionicons name="flame-outline" size={14} color={t.gold} /><Text style={{ color: t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10, marginLeft: 4 }}>{prayerStreak.current} günlük 5/5 seri</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginLeft: 'auto' }}>90 günde en iyi {prayerStreak.best}</Text></View>
    <SectionHeader title="Namaz vakitleri" right={location ? <Pressable accessibilityRole="button" accessibilityLabel="Namaz vakitlerini yenile" hitSlop={8} onPress={() => void refresh()}><Ionicons name="refresh" size={17} color={t.gold} /></Pressable> : undefined} />
    {location ? <><PrayerTimesCard location={location} /><Pressable disabled={notificationBusy} onPress={() => void toggleNotifications()} style={{ marginTop: spacing.sm, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><Ionicons name={notificationsEnabled ? 'notifications' : 'notifications-outline'} size={19} color={notificationsEnabled ? t.gold : t.inkSoft} /><View style={{ flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 13 }}>Vakit bildirimleri</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginTop: 2 }}>{notificationsEnabled ? `Açık · ${notificationPrayers.length} vakit · 10 gün planlandı` : 'Kapalı · yalnızca istersen açılır'}</Text></View>{notificationBusy ? <ActivityIndicator size="small" color={t.gold} /> : <Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{notificationsEnabled ? 'Kapat' : 'Aç'}</Text>}</Pressable><View style={{ marginTop: spacing.sm, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.md }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>Bildirim namazları</Text><View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm }}>{TRACKED_PRAYERS.map((prayer) => { const selected = notificationPrayers.includes(prayer.key); return <Pressable key={prayer.key} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleNotificationPrayer(prayer.key)} style={{ flex: 1, borderRadius: radius.pill, paddingVertical: 8, alignItems: 'center', backgroundColor: selected ? t.gold : t.surfaceAlt }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: selected ? t.onGold : t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{prayer.label}</Text></Pressable>; })}</View><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginTop: spacing.sm }}>{notificationPrayers.length}/5 vakit seçili</Text></View><View style={{ marginTop: spacing.sm, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.md }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>Bildirim zamanı</Text><View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm }}>{([0, 5, 10, 15, 30] as PrayerReminderOffset[]).map((minutes) => <Pressable key={minutes} accessibilityRole="radio" accessibilityState={{ selected: reminderMinutesBefore === minutes }} onPress={() => setReminderMinutesBefore(minutes)} style={{ flex: 1, borderRadius: radius.pill, paddingVertical: 8, alignItems: 'center', backgroundColor: reminderMinutesBefore === minutes ? t.gold : t.surfaceAlt }}><Text numberOfLines={1} adjustsFontSizeToFit style={{ color: reminderMinutesBefore === minutes ? t.onGold : t.inkSoft, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{minutes ? `${minutes} dk önce` : 'Tam vakit'}</Text></Pressable>)}</View></View>{notificationError ? <View style={{ marginTop: spacing.sm, alignItems: 'flex-start' }}><Text style={{ color: t.danger, fontFamily: fonts.sans, fontSize: 11 }}>{notificationError}</Text>{notificationNeedsSettings ? <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings().catch(() => setNotificationError('Bildirim ayarları açılamadı. Cihaz ayarlarından İhvan bildirimlerini açabilirsin.'))} style={{ marginTop: spacing.xs, paddingVertical: 5 }}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 11 }}>Bildirim ayarlarını aç</Text></Pressable> : null}</View> : null}<View style={{ marginTop: spacing.md }}><QiblaCard location={location} /></View></> : <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl, alignItems: 'center' }}><View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="navigate-outline" size={23} color={t.gold} /></View><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.md }}>Vakitleri ve kıbleyi aç</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.sm }}>Hesaplama için yalnızca uygulamayı kullanırken mevcut konumun gerekir. Arka planda konum takibi yapılmaz.</Text><Pressable disabled={loading} onPress={() => void (locationNeedsSettings ? openLocationSettings() : requestLocation())} style={{ backgroundColor: t.gold, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: 11, marginTop: spacing.lg }}>{loading ? <ActivityIndicator color={t.onGold} /> : <Text style={{ color: t.onGold, fontFamily: fonts.sansBold }}>{locationNeedsSettings ? 'Konum ayarlarını aç' : 'Konumumu kullan'}</Text>}</Pressable>{error ? <Text style={{ color: t.danger, fontFamily: fonts.sans, fontSize: 11, textAlign: 'center', marginTop: spacing.sm }}>{error}</Text> : null}</View>}
    <SectionHeader title={dua.title} />
    <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl }}><Text style={{ color: t.ink, fontSize: 30, lineHeight: 48, textAlign: 'right', writingDirection: 'rtl' }}>{dua.arabic}</Text><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, marginTop: spacing.md }}>{dua.reference}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>Arapça metin: Tanzil Uthmani · Türkçe çeviri eklenmedi.</Text></View>
    <SectionHeader title="Zikir sayacı" right={<View style={{ flexDirection: 'row', gap: spacing.md }}><Pressable accessibilityRole="button" onPress={() => router.push('/dhikr-history')}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold }}>Geçmiş</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Bugünkü zikir sayacını sıfırla" onPress={reset}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold }}>Sıfırla</Text></Pressable></View>} />
    <Pressable accessibilityRole="button" accessibilityLabel={`Zikir sayacı, ${todayDhikrCount}/${DAILY_DHIKR_TARGET}. Bir artır`} onPress={incrementDhikr} style={({ pressed }) => ({ height: 190, backgroundColor: t.goldSoft, borderRadius: radius.hero, borderWidth: 1, borderColor: t.gold, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 58 }}>{todayDhikrCount}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium, marginTop: 6 }}>bugün · {DAILY_DHIKR_TARGET} hedef · dokun ve say</Text></Pressable>
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>{DHIKR.map((item) => <View key={item.title} style={{ flex: 1, paddingVertical: spacing.md, backgroundColor: t.surface, borderRadius: radius.inner, alignItems: 'center' }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{item.title}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>{item.target}</Text></View>)}</View>
    <SectionHeader title="Sıradaki" />
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22 }}>Doğrulanmış kıraat kaynağı ve kullanım hakları netleşince sesli sûre deneyimi bağlanacak.</Text>
  </Screen>;
}
