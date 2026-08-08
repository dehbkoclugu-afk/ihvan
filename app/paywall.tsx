import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const catalog = await loadPlans();
      setPlans(catalog.plans);
      if (catalog.status === 'unavailable') setMessage('Satın alma seçenekleri şu anda yüklenemiyor. Daha sonra tekrar deneyebilirsin.');
    } catch {
      setPlans([]);
      setMessage('Satın alma seçenekleri yüklenemedi. Bağlantını kontrol edip tekrar deneyebilirsin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCatalog(); }, [loadCatalog]);

  const buy = async (id: PlanId) => {
    setBuying(id);
    setMessage(null);
    try {
      const result = await purchase(id);
      if (result.status === 'purchased') {
        router.back();
        return;
      }
      if (result.status === 'pending') setMessage('Ödeme mağaza tarafından işleniyor. Sonuçlandığında üyeliğin otomatik olarak güncellenecek.');
      else if (result.status === 'cancelled') setMessage('Satın alma iptal edildi.');
      else if (result.status === 'unavailable') setMessage('Bu satın alma şu anda kullanılamıyor.');
      else setMessage('Satın alma tamamlanamadı. Lütfen tekrar dene.');
    } catch {
      setMessage('Satın alma sırasında bir hata oluştu. Lütfen tekrar dene.');
    } finally {
      setBuying(null);
    }
  };

  const restorePurchases = async () => {
    if (restoring) return;
    setRestoring(true);
    setMessage(null);
    try {
      if (await restore()) router.back();
      else setMessage('Geri yüklenecek aktif bir İhvan Plus üyeliği bulunamadı.');
    } catch {
      setMessage('Satın alımlar geri yüklenemedi. Lütfen tekrar dene.');
    } finally {
      setRestoring(false);
    }
  };

  return <Screen>
    <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={21} color={t.ink} /></Pressable>
    <Text style={{ color: t.gold, fontFamily: fonts.sansBold, letterSpacing: 2, marginTop: spacing.xl }}>İHVAN PLUS</Text>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 36, lineHeight: 43, marginTop: spacing.md }}>Ritüelini derinleştir.</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, marginTop: spacing.md }}>İhvan Plus ile uygulamanın sürdürülebilir gelişimini destekle. Plan ve fiyat bilgileri mağaza kataloğundan yüklenir.</Text>
    {loading ? <ActivityIndicator color={t.gold} style={{ marginTop: spacing.xxxl }} /> : plans.length ? <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>{plans.map((plan) => <Pressable key={plan.id} disabled={buying !== null || restoring} onPress={() => void buy(plan.id)} style={({ pressed }) => ({ backgroundColor: plan.id === 'annual' ? t.goldSoft : t.surface, borderColor: plan.id === 'annual' ? t.gold : t.border, borderWidth: 1, borderRadius: radius.inner, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.75 : 1 })}><View><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 }}>{names[plan.id]}</Text>{plan.trialEligible ? <Text style={{ color: t.gold, fontFamily: fonts.sans, fontSize: 12, marginTop: 3 }}>{plan.trialDays} gün ücretsiz dene</Text> : null}</View>{buying === plan.id ? <ActivityIndicator size="small" color={t.gold} /> : <Text style={{ color: t.ink, fontFamily: fonts.sansBold }}>{plan.price}</Text>}</Pressable>)}</View> : <Pressable accessibilityRole="button" onPress={() => void loadCatalog()} style={{ alignSelf: 'center', borderRadius: radius.pill, backgroundColor: t.surface, paddingHorizontal: spacing.xl, paddingVertical: 11, marginTop: spacing.xxl }}><Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold }}>Tekrar dene</Text></Pressable>}
    {message ? <View accessibilityRole="alert" style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.lg }}><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>{message}</Text></View> : null}
    <Pressable disabled={restoring || buying !== null} onPress={() => void restorePurchases()} style={{ alignItems: 'center', marginTop: spacing.xl, opacity: restoring ? 0.6 : 1 }}>{restoring ? <ActivityIndicator size="small" color={t.gold} /> : <Text style={{ color: t.inkSoft, fontFamily: fonts.sansMedium }}>Satın alımları geri yükle</Text>}</Pressable>
  </Screen>;
}
