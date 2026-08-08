import { Ionicons } from '@expo/vector-icons';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { Fraunces_400Regular, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme, useThemeName } from '@/hooks/useTheme';
import { initPurchases } from '@/services/purchases';
import { configurePrayerNotificationHandler } from '@/services/prayerNotifications';

SplashScreen.preventAutoHideAsync().catch(() => {});
configurePrayerNotificationHandler();

export default function RootLayout() {
  const t = useTheme();
  const theme = useThemeName();
  const [loaded, error] = useFonts({ ...Ionicons.font, Fraunces_400Regular, Fraunces_600SemiBold, Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });

  useEffect(() => { initPurchases(); }, []);
  useEffect(() => { if (loaded || error) SplashScreen.hideAsync().catch(() => {}); }, [loaded, error]);
  if (!loaded && !error) return null;

  return <GestureHandlerRootView style={{ flex: 1 }}>
    <StatusBar style={theme === 'vigil' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="surah/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="juz/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="prayer-history" options={{ presentation: 'card' }} />
      <Stack.Screen name="bookmarks" options={{ presentation: 'card' }} />
      <Stack.Screen name="quran-history" options={{ presentation: 'card' }} />
      <Stack.Screen name="data-and-privacy" options={{ presentation: 'card' }} />
    </Stack>
  </GestureHandlerRootView>;
}
