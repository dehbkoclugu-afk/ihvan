import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useUserStoreHydrated } from '@/hooks/useUserStoreHydrated';
import { resolveVisualQaConfig, VISUAL_QA_TARGET_ROUTES } from '@/lib/visualQa';
import { useUserStore } from '@/state/useUserStore';

const visualQaEnabled = process.env.EXPO_PUBLIC_VISUAL_QA === '1';

export default function VisualQa() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const hydrated = useUserStoreHydrated();

  useEffect(() => {
    if (!visualQaEnabled || !hydrated) return;
    const config = resolveVisualQaConfig(params);
    useUserStore.setState({
      onboarded: config.target !== 'onboarding',
      language: config.locale,
      themePreference: config.theme,
      quranTextSize: config.quranTextSize,
    });
    router.replace(VISUAL_QA_TARGET_ROUTES[config.target]);
  }, [hydrated, params]);

  if (!visualQaEnabled) return <Redirect href="/" />;
  return null;
}
