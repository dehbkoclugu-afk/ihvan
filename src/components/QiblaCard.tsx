import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { compassTurn, prayerDay } from '@/services/prayerTimes';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import type { PrayerLocation } from '@/hooks/usePrayerLocation';

export function QiblaCard({ location }: { location: PrayerLocation }) {
  const t = useTheme();
  const qibla = prayerDay(location.latitude, location.longitude).qibla;
  const [heading, setHeading] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!live) return;
    let mounted = true;
    let subscription: Location.LocationSubscription | undefined;
    void Location.watchHeadingAsync((value) => {
      if (!mounted) return;
      const bestHeading = value.trueHeading >= 0 ? value.trueHeading : value.magHeading;
      setHeading(bestHeading);
    }, () => mounted && setError(true)).then((value) => { subscription = value; }).catch(() => setError(true));
    return () => { mounted = false; subscription?.remove(); };
  }, [live]);

  const turn = heading === null ? qibla : compassTurn(qibla, heading);

  return <View style={{ backgroundColor: t.duskFrom, borderRadius: radius.card, padding: spacing.xl, alignItems: 'center' }}>
    <Text style={{ color: '#B6E3D4', fontFamily: fonts.sansSemiBold, fontSize: 12, letterSpacing: 1.3 }}>KIBLE</Text>
    <View style={{ width: 142, height: 142, borderRadius: 71, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md }}>
      <Text style={{ color: 'rgba(255,255,255,0.45)', position: 'absolute', top: 8, fontFamily: fonts.sansBold, fontSize: 11 }}>K</Text>
      <View style={{ transform: [{ rotate: `${turn}deg` }] }}><Ionicons name="navigate" size={58} color="#B6E3D4" /></View>
    </View>
    <Text style={{ color: '#F6F2E9', fontFamily: fonts.serif, fontSize: 26, marginTop: spacing.md }}>{Math.round(qibla)}°</Text>
    <Text style={{ color: 'rgba(246,242,233,0.65)', fontFamily: fonts.sans, fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 3 }}>{heading === null ? 'Kuzeye göre kıble açısı' : 'Canlı pusula · telefonu düz tut'}</Text>
    <Pressable onPress={() => { setError(false); setLive((value) => !value); }} style={{ marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.10)' }}><Text style={{ color: '#F6F2E9', fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{live ? 'Pusulayı durdur' : 'Canlı pusulayı aç'}</Text></Pressable>
    {error ? <Text style={{ color: '#F1B6A8', fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>Pusula sensörü okunamadı.</Text> : null}
  </View>;
}
