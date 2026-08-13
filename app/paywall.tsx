import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ArtSlot } from '@/components/ArtSlot';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { rowDirection, textAlignment } from '@/i18n/direction';
import { loadPlans, openSubscriptionManagement, purchase, restore, type PurchasePlan, type PlanId } from '@/services/purchases';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Paywall() {
  const colors = useTheme();
  const { locale, t } = useT();
  const names: Record<PlanId, string> = { annual: t('paywall.annual'), monthly: t('paywall.monthly') };
  const [plans, setPlans] = useState<PurchasePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<PlanId | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true); setMessage(null);
    try {
      const catalog = await loadPlans(); setPlans(catalog.plans);
      if (catalog.status === 'unavailable') setMessage(t('paywall.catalogUnavailable'));
    } catch { setPlans([]); setMessage(t('paywall.catalogError')); }
    finally { setLoading(false); }
  }, [t]);
  useEffect(() => { void loadCatalog(); }, [loadCatalog]);

  const buy = async (id: PlanId) => {
    setBuying(id); setMessage(null);
    try {
      const result = await purchase(id);
      if (result.status === 'purchased') { router.back(); return; }
      if (result.status === 'pending') setMessage(t('paywall.pending'));
      else if (result.status === 'cancelled') setMessage(t('paywall.cancelled'));
      else if (result.status === 'unavailable') setMessage(t('paywall.unavailable'));
      else setMessage(t('paywall.failed'));
    } catch { setMessage(t('paywall.error')); }
    finally { setBuying(null); }
  };
  const restorePurchases = async () => {
    if (restoring) return; setRestoring(true); setMessage(null);
    try { if (await restore()) router.back(); else setMessage(t('paywall.restoreEmpty')); }
    catch { setMessage(t('paywall.restoreError')); }
    finally { setRestoring(false); }
  };

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.closePaywall')} onPress={() => router.back()} style={{ alignSelf: 'flex-end', width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={21} color={colors.ink} /></Pressable>
    <ArtSlot id="I12-paywall-hero" variant="hero" height={300} style={{ marginTop: spacing.md }}><View style={{ flex: 1, justifyContent: 'flex-end' }}><Text style={{ color: '#F6DDA3', fontFamily: fonts.sansBold, letterSpacing: 2, textAlign: textAlignment(locale) }}>{t('paywall.brand')}</Text><Text style={{ color: '#FFF8EA', fontFamily: fonts.serif, fontSize: 34, lineHeight: 41, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{t('paywall.title')}</Text></View></ArtSlot>
    <Text style={{ color: colors.inkSoft, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, marginTop: spacing.lg, textAlign: textAlignment(locale) }}>{t('paywall.body')}</Text>
    {loading ? <ActivityIndicator accessibilityLabel={t('paywall.loading')} color={colors.gold} style={{ marginTop: spacing.xxxl }} /> : plans.length ? <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>{plans.map((plan) => { const disabled = buying !== null || restoring; const a11y = plan.trialEligible ? t('paywall.planTrialA11y', { plan: names[plan.id], price: plan.price, days: plan.trialDays ?? 0 }) : t('paywall.planA11y', { plan: names[plan.id], price: plan.price }); return <Pressable key={plan.id} accessibilityRole="button" accessibilityLabel={a11y} accessibilityState={{ disabled }} disabled={disabled} onPress={() => void buy(plan.id)} style={({ pressed }) => ({ minHeight: 64, backgroundColor: plan.id === 'annual' ? colors.goldSoft : colors.surface, borderColor: plan.id === 'annual' ? colors.gold : colors.border, borderWidth: 1, borderRadius: radius.inner, padding: spacing.lg, flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.md, opacity: disabled ? 0.6 : pressed ? 0.75 : 1 })}><View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, textAlign: textAlignment(locale) }}>{names[plan.id]}</Text>{plan.trialEligible ? <Text style={{ color: colors.gold, fontFamily: fonts.sans, fontSize: 12, marginTop: 3, textAlign: textAlignment(locale) }}>{t('paywall.freeTrial', { count: plan.trialDays ?? 0 })}</Text> : null}</View>{buying === plan.id ? <ActivityIndicator size="small" color={colors.gold} /> : <Text numberOfLines={1} style={{ flexShrink: 0, color: colors.ink, fontFamily: fonts.sansBold }}>{plan.price}</Text>}</Pressable>; })}</View> : <Pressable accessibilityRole="button" onPress={() => void loadCatalog()} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surface, paddingHorizontal: spacing.xl, marginTop: spacing.xxl }}><Text style={{ color: colors.gold, fontFamily: fonts.sansSemiBold }}>{t('common.retry')}</Text></Pressable>}
    {message ? <View accessibilityRole="alert" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, padding: spacing.md, marginTop: spacing.lg }}><Text style={{ color: colors.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>{message}</Text></View> : null}
    <Text style={{ color: colors.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: spacing.lg }}>{t('paywall.renewal')}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.restorePurchases')} accessibilityState={{ disabled: restoring || buying !== null }} disabled={restoring || buying !== null} onPress={() => void restorePurchases()} style={{ minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg, opacity: restoring || buying !== null ? 0.6 : 1 }}>{restoring ? <ActivityIndicator size="small" color={colors.gold} /> : <Text style={{ color: colors.inkSoft, fontFamily: fonts.sansMedium }}>{t('paywall.restore')}</Text>}</Pressable>
    <View style={{ flexDirection: rowDirection(locale), justifyContent: 'center', gap: spacing.md, marginTop: spacing.sm }}><Pressable accessibilityRole="link" onPress={() => router.push('/data-and-privacy')} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm }}><Text style={{ color: colors.gold, fontFamily: fonts.sansMedium, fontSize: 11 }}>{t('paywall.privacy')}</Text></Pressable><Pressable accessibilityRole="link" onPress={() => void openSubscriptionManagement().catch(() => setMessage(t('paywall.manageError')))} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm }}><Text style={{ color: colors.gold, fontFamily: fonts.sansMedium, fontSize: 11 }}>{t('paywall.manage')}</Text></Pressable></View>
  </Screen>;
}
