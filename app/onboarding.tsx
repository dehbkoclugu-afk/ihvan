import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useUserStore } from '@/state/useUserStore';
import { normalizeUserName } from '@/lib/userProfile';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Onboarding() {
  const t = useTheme();
  const name = useUserStore((s) => s.name);
  const setName = useUserStore((s) => s.setName);
  const setOnboarded = useUserStore((s) => s.setOnboarded);
  const [nameDraft, setNameDraft] = useState(name);
  const start = () => { setName(normalizeUserName(nameDraft)); setOnboarded(true); router.replace('/(tabs)/today'); };
  return <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
    <View style={{ marginTop: spacing.xxxl }}>
      <Text style={{ color: t.gold, fontFamily: fonts.sansSemiBold, letterSpacing: 3, fontSize: 12 }}>İHVAN</Text>
      <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 42, lineHeight: 49, marginTop: spacing.lg }}>Kur’an’ı her gün biraz daha yakına al.</Text>
      <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 17, lineHeight: 26, marginTop: spacing.lg }}>Ayet, dua, zikir ve kısa bir düşünme anı. Beş dakikalık sakin bir günlük ritüel.</Text>
      <TextInput accessibilityLabel="Adın" value={nameDraft} onChangeText={setNameDraft} onSubmitEditing={start} maxLength={50} returnKeyType="done" autoCapitalize="words" placeholder="Adın (isteğe bağlı)" placeholderTextColor={t.inkFaint} style={{ color: t.ink, fontFamily: fonts.sans, fontSize: 16, marginTop: spacing.xxl, backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, paddingHorizontal: spacing.lg, paddingVertical: 15 }} />
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="İhvan’ı kullanmaya başla" onPress={start}><LinearGradient colors={[t.gold, '#67BBA2']} style={{ borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center' }}><Text style={{ color: t.onGold, fontFamily: fonts.sansBold, fontSize: 16 }}>Bugün başla</Text></LinearGradient></Pressable>
  </Screen>;
}
