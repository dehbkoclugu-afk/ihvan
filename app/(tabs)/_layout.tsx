import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';

export default function TabsLayout() {
  const t = useTheme();
  const tab = (title: string, icon: keyof typeof Ionicons.glyphMap) => ({ title, tabBarIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name={icon} size={size} color={color} /> });
  return <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: t.chrome, borderTopColor: t.border, height: 84, paddingTop: 8 }, tabBarActiveTintColor: t.gold, tabBarInactiveTintColor: t.inkFaint, tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 10 } }}>
    <Tabs.Screen name="today" options={tab('Bugün', 'sparkles-outline')} />
    <Tabs.Screen name="quran" options={tab('Kur’an', 'book-outline')} />
    <Tabs.Screen name="worship" options={tab('İbadet', 'moon-outline')} />
    <Tabs.Screen name="journal" options={tab('Notlar', 'create-outline')} />
    <Tabs.Screen name="profile" options={tab('Ben', 'person-outline')} />
  </Tabs>;
}
