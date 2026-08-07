import { Redirect } from 'expo-router';
import { useUserStore } from '@/state/useUserStore';

export default function Index() {
  const onboarded = useUserStore((s) => s.onboarded);
  return <Redirect href={onboarded ? '/(tabs)/today' : '/onboarding'} />;
}
