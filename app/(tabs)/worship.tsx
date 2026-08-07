import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Worship() {
  const t = useTheme();
  const { count, increment, reset } = useDhikrStore();
  const { location, loading, error, requestLocation, refresh } = usePrayerLocation();
  const { notificationsEnabled, setNotificationsEnabled } = usePrayerSettingsStore();
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const dua = dailyDua();

  useEffect(() => {
    if (!location || !notificationsEnabled) return;
    void refreshPrayerNotifications(location.latitude, location.longitude, location.label).then((ok) => {
      if (!ok) setNotificationsEnabled(false);
    }).catch(() => {});
  }, [location, notificationsEnabled, setNotificationsEnabled]);

  async function toggleNotifications() {
    if (!location || notificationBusy) return;
    setNotificationBusy(true);
    setNotificationError(null);
    try {
      if (notificationsEnabled) {
        await cancelPrayerNotifications();
        setNotificationsEnabled(false);
      } else {
        await enablePrayerNotifications(location.latitude, location.longitude, location.label);
        setNotificationsEnabled(true);
      }
    } catch (cause) {
      setNotificationError(cause instanceof Error ? cause.message : 'Bildirim ayarı değiştirilemedi.');
    } finally {
      setNotificationBusy(false);
    }
  }

  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>İbadet</Text>
    <SectionHeader title="Namaz vakitleri" right={location ? <Pressable onPress={() => void refresh()}><Ionicons name="refresh" size={17} color={t.gold} /></Pressable> : undefined} />
    {location ? <><PrayerTimesCard location={location} /><Pressable disabled={notificationBusy} onPress={() => void toggleNotifications()} style={{ marginTop: spacing.sm, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><Ionicons name={notificationsEnabled ? 'notifications' : 'notifications-outline'} size={19} color={notificationsEnabled ? t.gold : t.inkSoft} /><View style={{ flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 13 }}>Vakit bildirimleri</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 10, marginTop: 2 }}>{notificationsEnabled ? 'Açık · önümüzdeki 10 gün otomatik planlandı' : 'Kapalı · yalnızca istersen açılır'}</Text></View>{notificationBusy ? <ActivityIndicator size="small" color={t.gold} /> : <Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{notificationsEnabled ? 'Kapat' : 'Aç'}</Text>}</Pressable>{notificationError ? <Text style={{ color: t.danger, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>{notificationError}</Text> : null}<View style={{ marginTop: spacing.md }}><QiblaCard location={location} /></View></> : <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl, alignItems: 'center' }}><View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="navigate-outline" size={23} color={t.gold} /></View><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 17, marginTop: spacing.md }}>Vakitleri ve kıbleyi aç</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.sm }}>Hesaplama için yalnızca uygulamayı kullanırken mevcut konumun gerekir. Arka planda konum takibi yapılmaz.</Text><Pressable disabled={loading} onPress={() => void requestLocation()} style={{ backgroundColor: t.gold, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: 11, marginTop: spacing.lg }}>{loading ? <ActivityIndicator color={t.onGold} /> : <Text style={{ color: t.onGold, fontFamily: fonts.sansBold }}>Konumumu kullan</Text>}</Pressable>{error ? <Text style={{ color: t.danger, fontFamily: fonts.sans, fontSize: 11, textAlign: 'center', marginTop: spacing.sm }}>{error}</Text> : null}</View>}
    <SectionHeader title={dua.title} />
    <View style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl }}><Text style={{ color: t.ink, fontSize: 30, lineHeight: 48, textAlign: 'right', writingDirection: 'rtl' }}>{dua.arabic}</Text><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, marginTop: spacing.md }}>{dua.reference}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>Arapça metin: Tanzil Uthmani · Türkçe çeviri eklenmedi.</Text></View>
    <SectionHeader title="Zikir sayacı" right={<Pressable onPress={reset}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold }}>Sıfırla</Text></Pressable>} />
    <Pressable onPress={increment} style={({ pressed }) => ({ height: 190, backgroundColor: t.goldSoft, borderRadius: radius.hero, borderWidth: 1, borderColor: t.gold, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 58 }}>{count}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium, marginTop: 6 }}>dokun ve say</Text></Pressable>
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>{DHIKR.map((item) => <View key={item.title} style={{ flex: 1, paddingVertical: spacing.md, backgroundColor: t.surface, borderRadius: radius.inner, alignItems: 'center' }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{item.title}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>{item.target}</Text></View>)}</View>
    <SectionHeader title="Sıradaki" />
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, lineHeight: 22 }}>Doğrulanmış kıraat kaynağı ve kullanım hakları netleşince sesli sûre deneyimi bağlanacak.</Text>
  </Screen>;
}
