import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ArtSlot } from '@/components/ArtSlot';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { rowDirection, textAlignment } from '@/i18n/direction';
import { useT } from '@/i18n';
import { normalizeUserName } from '@/lib/userProfile';
import { useUserStore } from '@/state/useUserStore';
import { radius, spacing } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

export default function Onboarding() {
  const theme = useTheme();
  const { locale, t } = useT();
  const name = useUserStore((state) => state.name);
  const setName = useUserStore((state) => state.setName);
  const setOnboarded = useUserStore((state) => state.setOnboarded);
  const [nameDraft, setNameDraft] = useState(name);
  const align = textAlignment(locale);

  const start = () => {
    setName(normalizeUserName(nameDraft));
    setOnboarded(true);
    router.replace('/(tabs)/today');
  };

  return <Screen style={{ flexGrow: 1, justifyContent: 'space-between' }}>
    <View>
      <Text style={{ color: theme.gold, fontFamily: fonts.sansSemiBold, letterSpacing: 3, fontSize: 12, textAlign: align }}>{t('onboarding.brand')}</Text>
      <ArtSlot id="I2-welcome-hero" variant="hero" height={236} radius={radius.hero} style={{ marginTop: spacing.lg }} />
      <Text style={{ color: theme.ink, fontFamily: fonts.serif, fontSize: 36, lineHeight: 43, marginTop: spacing.xl, textAlign: align }}>{t('onboarding.title')}</Text>
      <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, marginTop: spacing.md, textAlign: align }}>{t('onboarding.body')}</Text>
      <TextInput
        accessibilityLabel={t('onboarding.namePlaceholder')}
        value={nameDraft}
        onChangeText={setNameDraft}
        onSubmitEditing={start}
        maxLength={50}
        returnKeyType="done"
        autoCapitalize="words"
        placeholder={t('onboarding.namePlaceholder')}
        placeholderTextColor={theme.inkFaint}
        textAlign={align}
        style={{ color: theme.ink, fontFamily: fonts.sans, fontSize: 16, marginTop: spacing.xl, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: radius.inner, paddingHorizontal: spacing.lg, paddingVertical: 15 }}
      />
    </View>
    <View style={{ marginTop: spacing.xl }}>
      <View style={{ flexDirection: rowDirection(locale), alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.gold} />
        <Text style={{ color: theme.inkSoft, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, textAlign: align, flexShrink: 1 }}>{t('onboarding.privacy')}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.start')}
        onPress={start}
        style={({ pressed }) => ({ minHeight: 52, borderRadius: radius.pill, backgroundColor: theme.gold, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.78 : 1 })}
      >
        <Text style={{ color: theme.onGold, fontFamily: fonts.sansBold, fontSize: 16 }}>{t('onboarding.start')}</Text>
      </Pressable>
    </View>
  </Screen>;
}
