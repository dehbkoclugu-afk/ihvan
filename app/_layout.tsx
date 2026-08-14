import { Ionicons } from '@expo/vector-icons';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { Fraunces_400Regular, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Amiri_400Regular } from '@expo-google-fonts/amiri';
import { useFonts } from 'expo-font';
import { router, Stack, type ErrorBoundaryProps } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme, useThemeName } from '@/hooks/useTheme';
import { useUserStoreHydrated } from '@/hooks/useUserStoreHydrated';
import { getActiveApplicationLocale, translate, useT } from '@/i18n';
import { getApplicationDirection, textAlignment } from '@/i18n/direction';
import { initPurchases, refreshPurchases } from '@/services/purchases';
import { configurePrayerNotificationHandler } from '@/services/prayerNotifications';
import { routeForNotificationData } from '@/lib/notificationRouting';

SplashScreen.preventAutoHideAsync().catch(() => {});
configurePrayerNotificationHandler();

export default function RootLayout() {
  const t = useTheme();
  const theme = useThemeName();
  const { locale } = useT();
  const direction = getApplicationDirection(locale);
  const userStoreHydrated = useUserStoreHydrated();
  const [loaded, error] = useFonts({ ...Ionicons.font, Amiri_400Regular, Fraunces_400Regular, Fraunces_600SemiBold, Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });
  const notificationResponse = Notifications.useLastNotificationResponse();
  const hydrationReady = Platform.OS === 'web' || userStoreHydrated;

  useEffect(() => {
    void initPurchases();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshPurchases();
    });
    return () => subscription.remove();
  }, []);
  useEffect(() => { if ((loaded || error) && hydrationReady) SplashScreen.hideAsync().catch(() => {}); }, [hydrationReady, loaded, error]);
  useEffect(() => {
    if (Platform.OS === 'web' || !hydrationReady || (!loaded && !error) || !notificationResponse) return;
    const route = routeForNotificationData(notificationResponse.notification.request.content.data);
    if (route) router.push(route);
    void Notifications.clearLastNotificationResponseAsync().catch(() => {});
  }, [error, hydrationReady, loaded, notificationResponse]);
  if ((!loaded && !error) || !hydrationReady) return null;

  return <GestureHandlerRootView style={{ flex: 1, direction }}>
    <StatusBar style={theme === 'vigil' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="surah/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="juz/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="prayer-history" options={{ presentation: 'card' }} />
      <Stack.Screen name="bookmarks" options={{ presentation: 'card' }} />
      <Stack.Screen name="quran-history" options={{ presentation: 'card' }} />
      <Stack.Screen name="dhikr-history" options={{ presentation: 'card' }} />
      <Stack.Screen name="data-and-privacy" options={{ presentation: 'card' }} />
      <Stack.Screen name="application-language" options={{ presentation: 'card' }} />
    </Stack>
  </GestureHandlerRootView>;
}

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  const locale = getActiveApplicationLocale();
  return <View style={{ flex: 1, backgroundColor: '#0E1220', paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons name="alert-circle-outline" size={42} color="#69C5A7" />
    <Text style={{ color: '#F2EEE6', fontSize: 26, fontWeight: '700', textAlign: 'center', marginTop: 18, writingDirection: getApplicationDirection(locale) }}>{translate('error.genericTitle')}</Text>
    <Text style={{ color: '#A9A698', fontSize: 14, lineHeight: 21, textAlign: textAlignment(locale), marginTop: 10, writingDirection: getApplicationDirection(locale) }}>{translate('error.genericBody')}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={translate('a11y.retryScreen')} onPress={() => void retry()} style={({ pressed }) => ({ marginTop: 24, borderRadius: 999, paddingHorizontal: 24, paddingVertical: 13, backgroundColor: '#69C5A7', opacity: pressed ? 0.75 : 1 })}><Text style={{ color: '#081713', fontSize: 14, fontWeight: '700' }}>{translate('error.tryAgain')}</Text></Pressable>
  </View>;
}
