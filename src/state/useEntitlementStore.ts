import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    { name: 'ihvan-entitlement', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
