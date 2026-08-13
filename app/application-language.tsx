import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ScreenSubtitle, ScreenTitle } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { APPLICATION_LOCALES, type AppLocale, type LanguagePreference, useT } from '@/i18n';
import { getApplicationDirection, getDirectionalIconName, rowDirection, textAlignment } from '@/i18n/direction';
import { useUserStore } from '@/state/useUserStore';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

const languageKeys: Record<AppLocale, 'language.turkish' | 'language.english' | 'language.arabic'> = {
  tr: 'language.turkish',
  en: 'language.english',
  ar: 'language.arabic',
};

export default function ApplicationLanguage() {
  const colors = useTheme();
  const { locale, t } = useT();
  const preference = useUserStore((state) => state.language);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const direction = getApplicationDirection(locale);
  const options: { value: LanguagePreference; title: string; detail: string }[] = [
    { value: 'system', title: t('language.system'), detail: t('language.systemResolved', { language: t(languageKeys[locale]) }) },
    ...APPLICATION_LOCALES.map((item) => ({ value: item.tag, title: t(languageKeys[item.tag]), detail: item.nativeName })),
  ];

  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('a11y.back')} onPress={() => router.back()} hitSlop={12} style={{ alignSelf: locale === 'ar' ? 'flex-end' : 'flex-start', width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={getDirectionalIconName('arrow-back', locale)} size={20} color={colors.ink} /></Pressable>
    <ScreenTitle style={{ marginTop: spacing.xl, writingDirection: direction }}>{t('language.title')}</ScreenTitle>
    <ScreenSubtitle style={{ marginTop: spacing.sm, writingDirection: direction }}>{t('language.subtitle')}</ScreenSubtitle>
    <View accessibilityRole="radiogroup" style={{ gap: spacing.sm, marginTop: spacing.xl }}>
      {options.map((option) => {
        const selected = preference === option.value;
        return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={t('language.selectedA11y', { language: option.title })} onPress={() => setLanguage(option.value)} style={({ pressed }) => ({ minHeight: 72, flexDirection: rowDirection(locale), alignItems: 'center', gap: spacing.md, backgroundColor: selected ? colors.goldSoft : colors.surface, borderWidth: 1, borderColor: selected ? colors.gold : colors.border, borderRadius: radius.inner, padding: spacing.lg, opacity: pressed ? 0.72 : 1 })}>
          <View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 15, textAlign: textAlignment(locale), writingDirection: direction }}>{option.title}</Text><Text style={{ color: colors.inkFaint, fontFamily: fonts.sans, fontSize: 11, marginTop: 3, textAlign: textAlignment(locale), writingDirection: option.value === 'ar' ? 'rtl' : option.value === 'tr' || option.value === 'en' ? 'ltr' : direction }}>{option.detail}</Text></View>
          <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={selected ? colors.gold : colors.inkFaint} />
        </Pressable>;
      })}
    </View>
    <View style={{ flexDirection: rowDirection(locale), alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.inner, padding: spacing.lg, marginTop: spacing.xl }}><Ionicons name="shield-checkmark-outline" size={19} color={colors.gold} /><Text style={{ flex: 1, color: colors.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: textAlignment(locale), writingDirection: direction }}>{t('language.sacredContentNote')}</Text></View>
  </Screen>;
}
