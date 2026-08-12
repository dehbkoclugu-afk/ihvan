import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useT, type TranslationKey } from '@/i18n';
import { getApplicationDirection, getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { useDhikrStore } from '@/state/useDhikrStore';
import { useJournalStore } from '@/state/useJournalStore';
import { usePrayerTrackingStore } from '@/state/usePrayerTrackingStore';
import { useQuranProgressStore } from '@/state/useQuranProgressStore';
import { useStreakStore } from '@/state/useStreakStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

const sections: { icon: ComponentProps<typeof Ionicons>['name']; title: TranslationKey; body: TranslationKey }[] = [
  { icon: 'phone-portrait-outline', title: 'data.deviceTitle', body: 'data.deviceBody' },
  { icon: 'location-outline', title: 'data.locationTitle', body: 'data.locationBody' },
  { icon: 'notifications-outline', title: 'data.notificationsTitle', body: 'data.notificationsBody' },
  { icon: 'card-outline', title: 'data.plusTitle', body: 'data.plusBody' },
  { icon: 'book-outline', title: 'data.quranSourceTitle', body: 'data.quranSourceBody' },
];

export default function DataAndPrivacy() {
  const colors = useTheme(); const { locale, t } = useT(); const direction = getApplicationDirection(locale);
  const [dataMessage, setDataMessage] = useState<string | null>(null);
  const confirmClear = (title: string, message: string, action: () => void, success: string) => Alert.alert(title, message, [{ text: t('common.cancel'), style: 'cancel' }, { text: t('common.delete'), style: 'destructive', onPress: () => { action(); setDataMessage(success); } }]);
  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.back')} onPress={() => router.back()} hitSlop={12} style={{ alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start', minHeight: 44, justifyContent: 'center' }}><Ionicons name={getDirectionalIconName('arrow-back', locale)} size={24} color={colors.ink} /></Pressable>
    <Text style={{ color: colors.ink, fontFamily: fonts.serif, fontSize: 32, lineHeight: 39, marginTop: spacing.md, textAlign: textAlignment(locale), writingDirection: direction }}>{t('data.sourcesTitle')}</Text>
    <Text style={{ color: colors.inkSoft, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, marginTop: spacing.sm, textAlign: textAlignment(locale), writingDirection: direction }}>{t('data.sourcesIntro')}</Text>
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>{sections.map((section) => <View key={section.title} style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, padding: spacing.lg }}><View style={{ flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.sm }}><Ionicons name={section.icon} size={20} color={colors.gold} /><Text style={{ color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, flex: 1, textAlign: textAlignment(locale), writingDirection: direction }}>{t(section.title)}</Text></View><Text style={{ color: colors.inkSoft, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, marginTop: spacing.sm, textAlign: textAlignment(locale), writingDirection: direction }}>{t(section.body)}</Text></View>)}</View>
    <Text style={{ color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 18, marginTop: spacing.xxl, textAlign: textAlignment(locale) }}>{t('data.manageLocal')}</Text>
    <Text style={{ color: colors.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{t('data.manageLocalBody')}</Text>
    <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.inner, overflow: 'hidden', marginTop: spacing.md }}>
      <ClearRow icon="book-outline" title={t('data.resetQuran')} hint={t('data.resetQuranHint')} onPress={() => confirmClear(t('data.resetQuranTitle'), t('data.resetQuranBody'), () => useQuranProgressStore.getState().clearProgress(), t('data.resetQuranSuccess'))} />
      <Divider />
      <ClearRow icon="refresh-outline" title={t('data.resetWorship')} hint={t('data.resetWorshipHint')} onPress={() => confirmClear(t('data.resetWorshipTitle'), t('data.resetWorshipBody'), () => { usePrayerTrackingStore.getState().clearTracking(); useDhikrStore.getState().clearHistory(); useStreakStore.getState().clearProgress(); }, t('data.resetWorshipSuccess'))} />
      <Divider />
      <ClearRow icon="trash-outline" title={t('data.deleteJournal')} hint={t('data.deleteJournalHint')} onPress={() => confirmClear(t('data.deleteJournalTitle'), t('data.deleteJournalBody'), () => useJournalStore.getState().clearEntries(), t('data.deleteJournalSuccess'))} />
    </View>
    {dataMessage ? <Text accessibilityLiveRegion="polite" style={{ color: colors.inkSoft, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, marginTop: spacing.sm, textAlign: textAlignment(locale) }}>{dataMessage}</Text> : null}
    <Text style={{ color: colors.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, marginTop: spacing.xl, textAlign: textAlignment(locale) }}>{t('data.licenseFooter')}</Text>
  </Screen>;
}

function ClearRow({ icon, title, hint, onPress }: { icon: ComponentProps<typeof Ionicons>['name']; title: string; hint: string; onPress: () => void }) {
  const colors = useTheme(); const { locale } = useT();
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${hint}`} onPress={onPress} style={({ pressed }) => ({ minHeight: 72, flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.md, padding: spacing.lg, opacity: pressed ? 0.7 : 1 })}><Ionicons name={icon} size={20} color={colors.danger} /><View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 14, textAlign: textAlignment(locale) }}>{title}</Text><Text style={{ color: colors.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 16, marginTop: 2, textAlign: textAlignment(locale) }}>{hint}</Text></View><Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={17} color={colors.inkFaint} /></Pressable>;
}
function Divider() { const colors = useTheme(); return <View style={{ height: 1, backgroundColor: colors.border, marginStart: spacing.lg }} />; }
