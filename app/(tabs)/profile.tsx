import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ProgressBar } from '@/components/ProgressBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useTheme } from '@/hooks/useTheme';
import { formatLocaleNumber, useT } from '@/i18n';
import { getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
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
import { shareUserDataExport } from '@/services/userDataExport';
import { activeStreakCount } from '@/lib/dates';
import type { QuranMealPreference, QuranTextSize } from '@/lib/quranDisplay';
import { fonts } from '@/theme/typography';
import { radius, spacing, type ThemeName } from '@/theme/tokens';

export default function Profile() {
  const t = useTheme();
  const { locale, t: copy } = useT();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const [exportingData, setExportingData] = useState(false);
  const { count, bestCount, lastTickDay } = useStreakStore();
  const streakCount = activeStreakCount(lastTickDay, count);
  const name = useUserStore((s) => s.name);
  const setName = useUserStore((s) => s.setName);
  const [nameDraft, setNameDraft] = useState(name);
  const pref = useUserStore((s) => s.themePreference);
  const setPref = useUserStore((s) => s.setThemePreference);
  const quranTextSize = useUserStore((s) => s.quranTextSize);
  const setQuranTextSize = useUserStore((s) => s.setQuranTextSize);
  const quranMeal = useUserStore((s) => s.quranMeal);
  const setQuranMeal = useUserStore((s) => s.setQuranMeal);
  const prayerCompletions = usePrayerTrackingStore((s) => s.completions);
  const prayerWeek = prayerCompletionPercent(prayerCompletions);
  const quranReadingDays = useQuranProgressStore((s) => s.readingDays);
  const quranReadAyahs = useQuranProgressStore((s) => s.readAyahs);
  const quranCoverage = quranReadingCoverage(quranReadAyahs, quranReadingDays);
  const quranStreak = quranReadingStreak(quranReadingDays);
  const options: { id: ThemeName | 'system'; label: string }[] = [{ id: 'system', label: copy('appearance.system') }, { id: 'dawn', label: copy('appearance.dawn') }, { id: 'vigil', label: copy('appearance.vigil') }];
  const quranSizes: { id: QuranTextSize; label: string }[] = [{ id: 'small', label: copy('appearance.quranSmall') }, { id: 'medium', label: copy('appearance.quranMedium') }, { id: 'large', label: copy('appearance.quranLarge') }];
  const quranMeals: { id: QuranMealPreference; label: string }[] = [{ id: 'none', label: copy('profile.quranMealNone') }, { id: 'tr', label: copy('profile.quranMealTurkish') }, { id: 'en', label: copy('profile.quranMealEnglish') }];
  const canSaveName = normalizeUserName(nameDraft) !== name;

  useEffect(() => { setNameDraft(name); }, [name]);

  const saveName = () => {
    const normalized = normalizeUserName(nameDraft);
    setName(normalized);
    setNameDraft(normalized);
  };

  const exportPersonalData = async () => {
    if (exportingData) return;
    setExportingData(true);
    setDataMessage(null);
    const user = useUserStore.getState();
    const prayer = usePrayerTrackingStore.getState();
    const quran = useQuranProgressStore.getState();
    const journal = useJournalStore.getState();
    const dhikr = useDhikrStore.getState();
    const ritual = useStreakStore.getState();
    const prayerSettings = usePrayerSettingsStore.getState();
    const snapshot = buildUserDataExport({
      profile: { name: user.name, themePreference: user.themePreference, quranTextSize: user.quranTextSize, language: user.language, quranMeal: user.quranMeal },
      prayerTracking: { completions: prayer.completions },
      quranProgress: { lastRead: quran.lastRead, bookmarks: quran.bookmarks, readingDays: quran.readingDays, readAyahs: quran.readAyahs, readingGoal: quran.readingGoal },
      journal: { entries: journal.entries },
      dhikr: { day: dhikr.day, count: dhikr.count, history: dhikr.history ?? {} },
      ritual: { count: ritual.count, bestCount: ritual.bestCount, lastTickDay: ritual.lastTickDay, doneDay: ritual.doneDay, doneSteps: ritual.doneSteps },
      prayerSettings: { notificationsEnabled: prayerSettings.notificationsEnabled, reminderMinutesBefore: prayerSettings.reminderMinutesBefore, notificationPrayers: prayerSettings.notificationPrayers },
    });
    try {
      await shareUserDataExport(snapshot);
      setDataMessage(copy('data.exportReady'));
    } catch {
      setDataMessage(copy('data.exportError'));
    } finally {
      setExportingData(false);
    }
  };

  return <Screen tabbed>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32, textAlign: textAlignment(locale) }}>{copy('profile.title')}</Text>
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xl, textAlign: textAlignment(locale) }}>{copy('profile.profile')}</Text>
    <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
      <TextInput accessibilityLabel={copy('profile.name')} value={nameDraft} onChangeText={setNameDraft} onSubmitEditing={saveName} maxLength={50} placeholder={copy('profile.namePlaceholder')} placeholderTextColor={t.inkFaint} returnKeyType="done" textAlign={textAlignment(locale)} style={{ flex: 1, minHeight: 46, color: t.ink, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, paddingHorizontal: spacing.lg, fontFamily: fonts.sans, fontSize: 14 }} />
      <Pressable accessibilityRole="button" accessibilityLabel={copy('common.save')} accessibilityState={{ disabled: !canSaveName }} onPress={saveName} disabled={!canSaveName} style={({ pressed }) => ({ minHeight: 46, justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radius.inner, backgroundColor: canSaveName ? t.gold : t.surfaceAlt, opacity: pressed ? 0.75 : 1 })}><Text style={{ color: canSaveName ? t.onGold : t.inkFaint, fontFamily: fonts.sansSemiBold, fontSize: 13 }}>{copy('common.save')}</Text></Pressable>
    </View>
    <View style={{ flexDirection: rowDirection(locale), gap: spacing.md, marginTop: spacing.xl }}><View style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>{formatLocaleNumber(streakCount, undefined, locale)}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, textAlign: textAlignment(locale) }}>{copy('profile.currentStreak')}</Text></View><View style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>{formatLocaleNumber(bestCount, undefined, locale)}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, textAlign: textAlignment(locale) }}>{copy('profile.bestStreak')}</Text></View></View>
    <Pressable accessibilityRole="button" onPress={() => router.push('/prayer-history')} style={({ pressed }) => ({ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md, transform: [{ scale: pressed ? 0.99 : 1 }] })}><View style={{ flexDirection: rowDirection(locale), alignItems: 'center' }}><View style={{ flex: 1 }}><View style={{ flexDirection: rowDirection(locale), alignItems: 'baseline' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>{formatLocaleNumber(prayerWeek, undefined, locale)}%</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginHorizontal: spacing.sm }}>{copy('profile.prayerWeek')}</Text></View></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={t.inkFaint} /></View><ProgressBar percent={prayerWeek} style={{ marginTop: spacing.md }} /><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{copy('profile.historyDetails')}</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.push('/quran-history')} style={({ pressed }) => ({ backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md, transform: [{ scale: pressed ? 0.99 : 1 }] })}><View style={{ flexDirection: rowDirection(locale), alignItems: 'center' }}><View style={{ flex: 1 }}><View style={{ flexDirection: rowDirection(locale), alignItems: 'baseline' }}><Text style={{ color: t.gold, fontFamily: fonts.serif, fontSize: 28 }}>{formatLocaleNumber(quranCoverage.percent, undefined, locale)}%</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, marginHorizontal: spacing.sm }}>{copy('profile.quranCoverage')}</Text></View></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={t.inkFaint} /></View><ProgressBar percent={quranCoverage.percent} style={{ marginTop: spacing.md }} /><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{formatLocaleNumber(quranCoverage.read, undefined, locale)} · {formatLocaleNumber(quranStreak.current, undefined, locale)} · {copy('common.history')}</Text></Pressable>
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl, textAlign: textAlignment(locale) }}>{copy('profile.appearance')}</Text>
    <Pressable accessibilityRole="button" onPress={() => router.push('/application-language')} style={({ pressed }) => ({ flexDirection: rowDirection(locale), alignItems: 'center', backgroundColor: t.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.md, opacity: pressed ? 0.75 : 1 })}><Ionicons name="language-outline" size={20} color={t.gold} /><Text style={{ flex: 1, color: t.ink, fontFamily: fonts.sansSemiBold, marginHorizontal: spacing.md, textAlign: textAlignment(locale) }}>{copy('profile.language')}</Text><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={t.inkFaint} /></Pressable>
    <SegmentedControl value={pref} onChange={setPref} options={options.map((option) => ({ value: option.id, label: option.label }))} style={{ marginTop: spacing.md }} />
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl, textAlign: textAlignment(locale) }}>{copy('profile.quranSize')}</Text>
    <SegmentedControl value={quranTextSize} onChange={setQuranTextSize} options={quranSizes.map((option) => ({ value: option.id, label: option.label }))} style={{ marginTop: spacing.md }} />
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl, textAlign: textAlignment(locale) }}>{copy('profile.quranMeal')}</Text>
    <SegmentedControl value={quranMeal} onChange={setQuranMeal} options={quranMeals.map((option) => ({ value: option.id, label: option.label }))} style={{ marginTop: spacing.md }} />
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{copy('profile.quranMealNote')}</Text>
    <Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl, textAlign: textAlignment(locale) }}>{copy('profile.data')}</Text>
    <View style={{ marginTop: spacing.md, backgroundColor: t.surface, borderRadius: radius.inner, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: exportingData }} disabled={exportingData} onPress={() => void exportPersonalData()} style={({ pressed }) => ({ flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.md, padding: spacing.lg, opacity: exportingData ? 0.5 : pressed ? 0.7 : 1 })}><Ionicons name="share-outline" size={20} color={t.gold} /><View style={{ flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 14, textAlign: textAlignment(locale) }}>{exportingData ? copy('data.exporting') : copy('profile.export')}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 2, textAlign: textAlignment(locale) }}>{copy('data.onDevice')}</Text></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={t.inkFaint} /></Pressable>
      <View style={{ height: 1, backgroundColor: t.border, marginLeft: spacing.lg }} />
      <Pressable accessibilityRole="button" onPress={() => router.push('/data-and-privacy')} style={({ pressed }) => ({ flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.md, padding: spacing.lg, opacity: pressed ? 0.7 : 1 })}><Ionicons name="shield-checkmark-outline" size={20} color={t.gold} /><View style={{ flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 14, textAlign: textAlignment(locale) }}>{copy('profile.dataSources')}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 2, textAlign: textAlignment(locale) }}>{copy('data.sources')}</Text></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={t.inkFaint} /></Pressable>
    </View>
    {dataMessage ? <Text accessibilityLiveRegion="polite" style={{ color: dataMessage === copy('data.exportError') ? t.danger : t.inkSoft, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{dataMessage}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityLabel={isPlus ? copy('profile.managePlusA11y') : copy('profile.viewPlusA11y')} onPress={() => { setSubscriptionError(null); if (!isPlus) { router.push('/paywall'); return; } void openSubscriptionManagement().catch(() => setSubscriptionError(copy('paywall.manageError'))); }} style={({ pressed }) => ({ marginTop: spacing.xxl, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: spacing.xl, opacity: pressed ? 0.75 : 1 })}><View style={{ flexDirection: rowDirection(locale), alignItems: 'center' }}><View style={{ flex: 1 }}><Text style={{ color: t.gold, fontFamily: fonts.sansBold, fontSize: 12, letterSpacing: 1.4, textAlign: textAlignment(locale) }}>{isPlus ? copy('profile.plusActive') : copy('profile.plus')}</Text><Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 22, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{isPlus ? copy('profile.plusThanks') : copy('profile.plusPlans')}</Text><Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.xs, textAlign: textAlignment(locale) }}>{isPlus ? copy('profile.storeManage') : copy('profile.viewPlans')}</Text></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={18} color={t.inkFaint} /></View></Pressable>
    {subscriptionError ? <Text accessibilityRole="alert" style={{ color: t.danger, fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.sm }}>{subscriptionError}</Text> : null}
  </Screen>;
}
