import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { fonts } from '@/theme/typography';

export default function TabsLayout() {
  const t = useTheme();
  const { t: copy } = useT();
  const insets = useSafeAreaInsets();
  const tab = (title: string, icon: keyof typeof Ionicons.glyphMap) => ({ title, tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name={icon} size={size} color={color} /> });
  return <Tabs screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, tabBarStyle: { backgroundColor: t.chrome, borderTopColor: t.border, height: 64 + insets.bottom, paddingTop: 7, paddingBottom: Math.max(insets.bottom, 7) }, tabBarItemStyle: { minHeight: 50 }, tabBarActiveTintColor: t.gold, tabBarInactiveTintColor: t.inkFaint, tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 10 } }}>
    <Tabs.Screen name="today" options={tab(copy('tab.today'), 'sparkles-outline')} />
    <Tabs.Screen name="quran" options={tab(copy('tab.quran'), 'book-outline')} />
    <Tabs.Screen name="worship" options={tab(copy('tab.worship'), 'moon-outline')} />
    <Tabs.Screen name="journal" options={tab(copy('tab.journal'), 'create-outline')} />
    <Tabs.Screen name="profile" options={tab(copy('tab.profile'), 'person-outline')} />
  </Tabs>;
}
