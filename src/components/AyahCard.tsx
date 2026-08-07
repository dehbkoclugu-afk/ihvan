import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import type { Ayah } from '@/data/quran';

export function AyahCard({ ayah, done, onComplete }: { ayah: Ayah; done?: boolean; onComplete?: () => void }) {
  const t = useTheme();
  return <LinearGradient colors={[t.duskFrom, t.duskTo]} style={{ borderRadius: radius.hero, padding: spacing.xl, minHeight: 248, justifyContent: 'space-between' }}>
    <View>
      <Text style={{ color: '#B6E3D4', fontFamily: fonts.sansSemiBold, fontSize: 12, letterSpacing: 1.6 }}>{ayah.reference.toUpperCase()}</Text>
      <Text selectable style={{ color: '#F6F2E9', fontSize: 31, lineHeight: 54, textAlign: 'right', marginTop: spacing.xl, writingDirection: 'rtl' }}>{ayah.arabic}</Text>
      <Text style={{ color: 'rgba(246,242,233,0.74)', fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, marginTop: spacing.lg }}>{ayah.reflection}</Text>
    </View>
    {onComplete ? <Pressable onPress={onComplete} style={{ alignSelf: 'flex-start', marginTop: spacing.xl, flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: done ? '#B6E3D4' : 'rgba(255,255,255,0.10)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill }}><Ionicons name={done ? 'checkmark' : 'bookmark-outline'} size={16} color={done ? '#10231E' : '#F6F2E9'} /><Text style={{ color: done ? '#10231E' : '#F6F2E9', fontFamily: fonts.sansSemiBold }}>{done ? 'Bugün okundu' : 'Okudum'}</Text></Pressable> : null}
  </LinearGradient>;
}
