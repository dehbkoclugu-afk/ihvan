import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useDhikrStore } from '@/state/useDhikrStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useJournalStore } from '@/state/useJournalStore';
import { usePrayerSettingsStore } from '@/state/usePrayerSettingsStore';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { prayerCompletionPercent } from '@/lib/prayerTracking';
import { quranReadingCoverage, quranReadingStreak } from '@/lib/quranHabit';
import { buildUserDataExport } from '@/lib/userData';
import { normalizeUserName } from '@/lib/userProfile';
import { openSubscriptionManagement } from '@/services/purchases';
import { activeStreakCount } from '@/lib/dates';
import type { QuranTextSize } from '@/lib/quranDisplay';
import { fonts } from '@/theme/typography';
import { radius, spacing, type ThemeName } from '@/theme/tokens';

export default function Profile() {
  const t = useTheme();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const { count, bestCount, lastTickDay } = useStreakStore();
  const streakCount = activeStreakCount(lastTickDay, count);
  const name = useUserStore((s) => s.name);
  const setName = useUserStore((s) => s.setName);
  const [nameDraft, setNameDraft] = useState(name);
  const pref = useUserStore((s) => s.themePreference);
  const setPref = useUserStore((s) => s.setThemePreference);
  const quranTextSize = useUserStore((s) => s.quranTextSize);
  const setQuranTextSize = useUserStore((s) => s.setQuranTextSize);
  const prayerCompletions = usePrayerTrackingStore((s) => s.completions);
  const prayerWeek = prayerCompletionPercent(prayerCompletions);
  const quranReadingDays = useQuranProgressStore((s) => s.readingDays);
  const quranReadAyahs = useQuranProgressStore((s) => s.readAyahs);
  const quranCoverage = quranReadingCoverage(quranReadAyahs, quranReadingDays);
  const quranStreak = quranReadingStreak(quranReadingDays);
  const options: { id: ThemeName | 'system'; label: string }[] = [{ id: 'system', label: 'Otomatik' }, { id: 'dawn', label: 'Aydınlık' }, { id: 'vigil', label: 'Gece' }];
  const quranSizes: { id: QuranTextSize; label: string }[] = [{ id: 'small', label: 'Küçük' }, { id: 'medium', label: 'Orta' }, { id: 'large', label: 'Büyük' }];

  useEffect(() => { setNameDraft(name); }, [name]);

  const saveName = () => {
    const normalized = normalizeUserName(nameDraft);
    setName(normalized);
    setNameDraft(normalized);
  };

  const exportPersonalData = async () => {
    setDataMessage(null);
    const user = useUserStore.getState();
    const prayer = usePrayerTrackingStore.getState();
    const quran = useQuranProgressStore.getState();
    const journal = useJournalStore.getState();
    const dhikr = useDhikrStore.getState();
    const ritual = useStreakStore.getState();
    const prayerSettings = usePrayerSettingsStore.getState();
    const snapshot = buildUserDataExport({
      profile: { name: user.name, themePreference: user.themePreference, quranTextSize: user.quranTextSize },
      prayerTracking: { completions: prayer.completions },
      quranProgress: { lastRead: quran.lastRead, bookmarks: quran.bookmarks, readingDays: quran.readingDays, readAyahs: quran.readAyahs, readingGoal: quran.readingGoal },
      journal: { entries: journal.entries },
      dhikr: { day: dhikr.day, count: dhikr.count, history: dhikr.history ?? {} },
      ritual: { count: ritual.count, bestCount: ritual.bestCount, lastTickDay: ritual.lastTickDay, doneDay: ritual.doneDay, doneSteps: ritual.doneSteps },
      prayerSettings: { notificationsEnabled: prayerSettings.notificationsEnabled, reminderMinutesBefore: prayerSettings.reminderMinutesBefore, notificationPrayers: prayerSettings.notificationPrayers },
    });
    try {
      await Share.share({ title: 'İhvan veri dışa aktarımı', message: JSON.stringify(snapshot, null, 2) });
      setDataMessage('Dışa aktarma paylaşım menüsüne hazırlandı.');
    } catch {
      setDataMessage('Dışa aktarma açılamadı. Lütfen tekrar dene.');
    }
  };

  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32 }}>Ben</Text>
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xl }}>Profil</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
      <TextInput accessibilityLabel="Profil adı" value={nameDraft} onChangeText={setNameDraft} onSubmitEditing={saveName} maxLength={50} placeholder="Adın (isteğe bağlı)" placeholderTextColor={t.inkFaint} returnKeyType="done" style={{ flex: 1, minHeight: 46, color: t.ink, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, paddingHorizontal: spacing.lg, fontFamily: fonts.sans, fontSize: 14 }} />
      <Pressable accessibilityRole="button" accessibilityLabel="Profil adını kaydet" onPress={saveName} disabled={nameDraft.trim() === name} style={({ pressed }) => ({ minHeight: 46, justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radius.inner, backgroundColor: t.gold, opacity: nameDraft.trim() === name ? 0.45 : pressed ? 0.75 : 1 })}><Text style={{ color: t.onGold, fontFamily: fonts.sansSemiBold, fontSize: 13 }}>Kaydet</Text></Pressable>
    </View>
    <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}><View style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>{streakCount}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans }}>günlük seri</Text></View><View style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>{bestCount}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans }}>en iyi seri</Text></View></View>
    <Pressable accessibilityRole="button" onPress={() => router.push('/prayer-history')} style={({ pressed }) => ({ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md, opacity: pressed ? 0.75 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>%{prayerWeek}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginLeft: spacing.sm }}>son 7 gün namaz takibi</Text></View></View><Ionicons name="chevron-forward" size={18} color={t.inkFaint} /></View><View style={{ height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: spacing.md }}><View style={{ width: `${prayerWeek}%`, height: 5, borderRadius: 3, backgroundColor: t.gold }} /></View><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>Geçmiş ve ayrıntılar</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.push('/quran-history')} style={({ pressed }) => ({ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md, opacity: pressed ? 0.75 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'baseline' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>%{quranCoverage.percent}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginLeft: spacing.sm }}>Kur’an tekil ayet kapsamı</Text></View></View><Ionicons name="chevron-forward" size={18} color={t.inkFaint} /></View><View style={{ height: 5, borderRadius: 3, backgroundColor: t.surfaceAlt, marginTop: spacing.md }}><View style={{ width: `${quranCoverage.percent}%`, height: 5, borderRadius: 3, backgroundColor: t.gold }} /></View><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>{quranCoverage.read.toLocaleString('tr-TR')} tekil ayet · {quranStreak.current} günlük okuma serisi · Geçmiş</Text></Pressable>
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl }}>Görünüm</Text>
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>{options.map((option) => <Pressable key={option.id} onPress={() => setPref(option.id)} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center', backgroundColor: pref === option.id ? t.gold : t.surface }}><Text style={{ color: pref === option.id ? t.onGold : t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{option.label}</Text></Pressable>)}</View>
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl }}>Kur’an yazı boyutu</Text>
    <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>{quranSizes.map((option) => <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected: quranTextSize === option.id }} onPress={() => setQuranTextSize(option.id)} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center', backgroundColor: quranTextSize === option.id ? t.gold : t.surface }}><Text style={{ color: quranTextSize === option.id ? t.onGold : t.ink, fontFamily: fonts.sansSemiBold, fontSize: 12 }}>{option.label}</Text></Pressable>)}</View>
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl }}>Veriler</Text>
    <View style={{ marginTop: spacing.md, backgroundColor: t.surface, borderRadius: radius.inner, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" onPress={() => void exportPersonalData()} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, opacity: pressed ? 0.7 : 1 })}><Ionicons name="share-outline" size={20} color={t.gold} /><View style={{ flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 14 }}>Verilerimi dışa aktar</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>Kişisel ilerleme ve notları JSON olarak paylaş</Text></View><Ionicons name="chevron-forward" size={18} color={t.inkFaint} /></Pressable>
      <View style={{ height: 1, backgroundColor: t.border, marginLeft: spacing.lg }} />
      <Pressable accessibilityRole="button" onPress={() => router.push('/data-and-privacy')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, opacity: pressed ? 0.7 : 1 })}><Ionicons name="shield-checkmark-outline" size={20} color={t.gold} /><View style={{ flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 14 }}>Veriler ve kaynaklar</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 2 }}>İzinler, veri saklama ve Kur’an kaynağı</Text></View><Ionicons name="chevron-forward" size={18} color={t.inkFaint} /></Pressable>
    </View>
    {dataMessage ? <Text accessibilityLiveRegion="polite" style={{ color: dataMessage.startsWith('Dışa aktarma açılamadı') ? t.danger : t.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>{dataMessage}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityLabel={isPlus ? 'İhvan Plus aboneliğini mağazada yönet' : 'İhvan Plus planlarını gör'} onPress={() => { setSubscriptionError(null); if (!isPlus) { router.push('/paywall'); return; } void openSubscriptionManagement().catch(() => setSubscriptionError('Mağaza abonelik ayarları açılamadı.')); }} style={({ pressed }) => ({ marginTop: spacing.xxl, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl, opacity: pressed ? 0.75 : 1 })}><View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ flex: 1 }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 12, letterSpacing: 1.4 }}>{isPlus ? 'İHVAN PLUS AKTİF' : 'İHVAN PLUS'}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 22, marginTop: spacing.sm }}>{isPlus ? 'Desteğin için teşekkürler.' : 'İhvan Plus planlarını gör.'}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.xs }}>{isPlus ? 'Mağazada yönet' : 'Plan ve fiyatları görüntüle'}</Text></View><Ionicons name="chevron-forward" size={18} color={t.inkFaint} /></View></Pressable>
    {subscriptionError ? <Text accessibilityRole="alert" style={{ color: t.danger, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>{subscriptionError}</Text> : null}
  </Screen>;
}
