import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export function RitualCard({ icon, title, subtitle, done, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; done: boolean; onPress: () => void }) {
  const t = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}, ${done ? 'tamamlandı' : 'tamamlanmadı'}. ${subtitle}`} onPress={onPress} style={({ pressed }) => ({ backgroundColor: t.surface, borderWidth: 1, borderColor: done ? t.gold : t.border, borderRadius: radius.inner, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.78 : 1 })}>
    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={done ? 'checkmark' : icon} size={20} color={t.gold} /></View>
    <View style={{ flex: 1 }}><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 }}>{title}</Text><Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 13, marginTop: 3 }}>{subtitle}</Text></View>
  </Pressable>;
}
