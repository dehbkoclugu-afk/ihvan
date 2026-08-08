import { Redirect } from 'expo-router';
import { useUserStoreHydrated } from '@/hooks/useUserStoreHydrated';
import { useUserStore } from '@/state/useUserStore';

export default function Index() {
  const hydrated = useUserStoreHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  if (!hydrated) return null;
  return <Redirect href={onboarded ? '/(tabs)/today' : '/onboarding'} />;
}
