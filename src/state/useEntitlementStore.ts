import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizePersistedEntitlement } from '@/services/purchases.logic';

interface EntitlementState {
  /** true when the `plus` entitlement is active (RevenueCat) or dev override */
  isPlus: boolean;
  /** paywall dismissed at least once → eligible for discount offer */
  sawDiscountOffer: boolean;
  setPlus: (v: boolean) => void;
  setSawDiscountOffer: (v: boolean) => void;
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set) => ({
      isPlus: false,
      sawDiscountOffer: false,
      setPlus: (v) => set({ isPlus: v }),
      setSawDiscountOffer: (v) => set({ sawDiscountOffer: v }),
    }),
    {
      name: 'ihvan-entitlement',
      storage: createJSONStorage(() => AsyncStorage),
      // Store-derived entitlement is runtime authority. Never grant Plus from
      // a value persisted by an earlier app session.
      partialize: (state) => ({ ...state, isPlus: false }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<EntitlementState>),
        ...normalizePersistedEntitlement(persistedState),
      }),
    },
  ),
);
