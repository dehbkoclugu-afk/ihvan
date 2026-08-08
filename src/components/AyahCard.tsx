import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import type { DailyAyah } from '@/data/quran';
import { QURAN_TEXT_METRICS } from '@/lib/quranDisplay';
import { useUserStore } from '@/state/useUserStore';

export function AyahCard({ ayah, done, onComplete }: { ayah: DailyAyah; done?: boolean; onComplete?: () => void }) {
  const t = useTheme();
  const metrics = QURAN_TEXT_METRICS[useUserStore((state) => state.quranTextSize)];
  return <LinearGradient colors={[t.duskFrom, t.duskTo]} style={{ borderRadius: radius.hero, padding: spacing.xl, minHeight: 248, justifyContent: 'space-between' }}>
    <View>
      <Text style={{ color: '#B6E3D4', fontFamily: fonts.sansSemiBold, fontSize: 12, letterSpacing: 1.6 }}>{ayah.reference.toUpperCase()}</Text>
      <Text selectable style={{ color: '#F6F2E9', fontSize: metrics.fontSize, lineHeight: metrics.lineHeight, textAlign: 'right', marginTop: spacing.xl, writingDirection: 'rtl' }}>{ayah.text}</Text>
      <Text style={{ color: 'rgba(246,242,233,0.60)', fontFamily: fonts.sans, fontSize: 11, marginTop: spacing.md }}>Arapça metin: Tanzil Uthmani · CC BY 3.0</Text>
    </View>
    {onComplete ? <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(done) }} accessibilityLabel={`${ayah.reference} ayetini bugün okudum`} onPress={onComplete} style={{ alignSelf: 'flex-start', marginTop: spacing.xl, flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: done ? '#B6E3D4' : 'rgba(255,255,255,0.10)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill }}><Ionicons name={done ? 'checkmark' : 'bookmark-outline'} size={16} color={done ? '#10231E' : '#F6F2E9'} /><Text style={{ color: done ? '#10231E' : '#F6F2E9', fontFamily: fonts.sansSemiBold }}>{done ? 'Bugün okundu' : 'Okudum'}</Text></Pressable> : null}
  </LinearGradient>;
}
