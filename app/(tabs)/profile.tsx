import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { prayerCompletionPercent } from '@/lib/prayerTracking';
import { fonts } from '@/theme/typography';
import { radius, spacing, type ThemeName } from '@/theme/tokens';

export default function Profile() {
  const t = useTheme();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const { count, bestCount } = useStreakStore();
  const pref = useUserStore((s) => s.themePreference);
  const setPref = useUserStore((s) => s.setThemePreference);
  const prayerCompletions = usePrayerTrackingStore((s) => s.completions);
  const prayerWeek = prayerCompletionPercent(prayerCompletions);
  const options: { id: ThemeName | 'system'; label: string }[] = [{ id: 'system', label: 'Otomatik' }, { id: 'dawn', label: 'Aydınlık' }, { id: 'vigil', label: 'Gece' }];
  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>Ben</Text>
    <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}><View style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>{count}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans }}>günlük seri</Text></View><View style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>{bestCount}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans }}>en iyi seri</Text></View></View>
    <Pressable accessibilityRole="button" onPress={() => router.push('/prayer-history')} style={({ pressed }) => ({ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md, opacity: pressed ? 0.75 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>%{prayerWeek}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginLeft: spacing.sm }}>son 7 gün namaz takibi</Text></View></View><Ionicons name="chevron-forward" size={18} color={t.inkFaint} /></View><View style={{ height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: spacing.md }}><View style={{ width: `${prayerWeek}%`, height: 5, borderRadius: 3, backgroundColor: t.gold }} /></View><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>Geçmiş ve ayrıntılar</Text></Pressable>
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl }}>Görünüm</Text>
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>{options.map((option) => <Pressable key={option.id} onPress={() => setPref(option.id)} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center', backgroundColor: pref === option.id ? t.gold : t.surface }}><Text style={{ color: pref === option.id ? t.onGold : t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{option.label}</Text></Pressable>)}</View>
    <Pressable onPress={() => router.push('/paywall')} style={{ marginTop: spacing.xxl, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 12, letterSpacing: 1.4 }}>{isPlus ? 'İHVAN PLUS AKTİF' : 'İHVAN PLUS'}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 22, marginTop: spacing.sm }}>{isPlus ? 'Desteğin için teşekkürler.' : 'Derinleşme araçlarını aç.'}</Text></Pressable>
  </Screen>;
}
