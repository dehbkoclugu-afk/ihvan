import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

const sections = [
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Cihazındaki veriler',
    body: 'Namaz takibi, Kur’an okuma ilerlemesi ve yer imleri, günlük notları, zikir sayacı ve uygulama tercihleri cihazında saklanır. Dışa aktarılan dosyada Kur’an metni değil, yalnızca okuma konumları ve ayet numaraları bulunur.',
  },
  {
    icon: 'location-outline' as const,
    title: 'Konum',
    body: 'İzin verirsen konum, namaz vakitleri ve kıble hesabı için uygulama açıkken kullanılır. Arka planda konum takibi yapılmaz.',
  },
  {
    icon: 'notifications-outline' as const,
    title: 'Bildirimler',
    body: 'Namaz hatırlatmaları isteğe bağlı yerel bildirimlerdir. Hangi namazların ve kaç dakika önce hatırlatılacağını sen seçersin.',
  },
  {
    icon: 'card-outline' as const,
    title: 'İhvan Plus',
    body: 'Abonelik etkinliği ve satın alma işlemleri, uygulama mağazası ve yapılandırıldığında RevenueCat üzerinden yönetilir.',
  },
  {
    icon: 'book-outline' as const,
    title: 'Kur’an kaynağı',
    body: 'Arapça Kur’an metni Tanzil Project Uthmani kaynağından, CC BY 3.0 lisansı altında verbatim kullanılır. Kaynak 114 sûre ve 6.236 ayettir. Hakları netleşmemiş meal ve tefsir uygulamaya eklenmez; AI veya makine çevirisi kullanılmaz.',
  },
] as const;

export default function DataAndPrivacy() {
  const t = useTheme();
  return <Screen>
    <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => router.back()} hitSlop={12} style={{ alignSelf: 'flex-start', paddingVertical: spacing.sm }}>
      <Ionicons name="arrow-back" size={24} color={t.ink} />
    </Pressable>
    <Text style={{ color: t.ink, fontFamily: fonts.serif, fontSize: 32, marginTop: spacing.md }}>Veriler ve kaynaklar</Text>
    <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, marginTop: spacing.sm }}>İhvan’ın kullandığı izinler, sakladığı kişisel ilerleme ve Kur’an kaynağı hakkında kısa özet.</Text>
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      {sections.map((section) => <View key={section.title} style={{ backgroundColor: t.surface, borderWidth: 1, borderColor: t.border, borderRadius: radius.inner, padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}><Ionicons name={section.icon} size={20} color={t.gold} /><Text style={{ color: t.ink, fontFamily: fonts.sansSemiBold, fontSize: 16, flex: 1 }}>{section.title}</Text></View>
        <Text style={{ color: t.inkSoft, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, marginTop: spacing.sm }}>{section.body}</Text>
      </View>)}
    </View>
    <Text style={{ color: t.inkFaint, fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, marginTop: spacing.xl }}>Kur’an kaynak ve lisans bildirimi uygulamayla birlikte korunur.</Text>
  </Screen>;
}
