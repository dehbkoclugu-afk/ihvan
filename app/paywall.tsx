import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { loadPlans, purchase, restore, type PurchasePlan, type PlanId } from '@/services/purchases';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

const names: Record<PlanId, string> = { annual: 'Yıllık', monthly: 'Aylık', lifetime: 'Ömür boyu' };

export default function Paywall() {
  const t = useTheme();
  const [plans, setPlans] = useState<PurchasePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<PlanId | null>(null);
  useEffect(() => { loadPlans().then((catalog) => setPlans(catalog.plans)).finally(() => setLoading(false)); }, []);
  const buy = async (id: PlanId) => { setBuying(id); const result = await purchase(id); setBuying(null); if (result.status === 'purchased') router.back(); };
  return <Screen>
    <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={21} color={t.ink} /></Pressable>
    <Text style={{ color: t.gold, fontFamily: fonts.sansBold, letterSpacing: 2, marginTop: spacing.xl }}>İHVAN PLUS</Text>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 36, lineHeight: 43, marginTop: spacing.md }}>Ritüelini derinleştir.</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, marginTop: spacing.md }}>Tam okuma paketleri, gelişmiş tefekkür araçları, ses ve kişiselleştirme Plus katmanında açılacak.</Text>
    {loading ? <ActivityIndicator color={t.gold} style={{ marginTop: spacing.xxxl }} /> : <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>{plans.map((plan) => <Pressable key={plan.id} disabled={buying !== null} onPress={() => buy(plan.id)} style={{ backgroundColor: plan.id === 'annual' ? t.goldSoft : t.surface, borderColor: plan.id === 'annual' ? t.gold : t.border, borderWidth: 1, borderRadius: radius.inner, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 }}>{names[plan.id]}</Text>{plan.trialEligible ? <Text style={{ color: t.gold, fontFamily: fonts.sans, fontSize: 12, marginTop: 3 }}>{plan.trialDays} gün ücretsiz dene</Text> : null}</View><Text style={{ color: t.ink, fontFamily: fonts.sansBold }}>{buying === plan.id ? '...' : plan.price}</Text></Pressable>)}</View>}
    <Pressable onPress={async () => { if (await restore()) router.back(); }} style={{ alignItems: 'center', marginTop: spacing.xl }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium }}>Satın alımları geri yükle</Text></Pressable>
  </Screen>;
}
