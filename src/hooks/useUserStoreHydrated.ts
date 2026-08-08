import { useEffect, useState } from 'react';
import { useUserStore } from '@/state/useUserStore';

export function useUserStoreHydrated() {
  const [hydrated, setHydrated] = useState(() => useUserStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useUserStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useUserStore.persist.hasHydrated());
    return unsubscribe;
  }, []);

  return hydrated;
}
