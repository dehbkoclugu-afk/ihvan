/**
 * RevenueCat boundary. Production never invents prices, trials, or entitlement.
 * Expo Go keeps an explicit development-only mock so the funnel remains testable.
 */
import { Linking, Platform } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import {
  classifyPurchaseError,
  hasActiveEntitlement,
  planIdForPackage,
  type PlanId,
} from './purchases.logic';

export type { PlanId } from './purchases.logic';

export interface PurchasePlan {
  id: PlanId;
  price: string;
  monthlyPrice: string | null;
  trialEligible: boolean;
  trialDays: number | null;
}

export interface PurchaseCatalog {
  status: 'ready' | 'unavailable';
  plans: PurchasePlan[];
  mock: boolean;
}

export type PurchaseResult =
  | { status: 'purchased' }
  | { status: 'cancelled' }
  | { status: 'pending' }
  | { status: 'unavailable' }
  | { status: 'failed' };

const DEV_PLANS: PurchasePlan[] = [
  { id: 'annual', price: '$59.99', monthlyPrice: '$4.99', trialEligible: true, trialDays: 7 },
  { id: 'monthly', price: '$9.99', monthlyPrice: '$9.99', trialEligible: false, trialDays: null },
  { id: 'lifetime', price: '$129.99', monthlyPrice: null, trialEligible: false, trialDays: null },
];

const apiKey =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const configuredEntitlementId =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim();
const entitlementIds = Array.from(
  new Set(
    [
      configuredEntitlementId,
      'plus',
      'Ihvan Plus',
      'ihvan_plus',
      'ihvan-plus',
    ].filter((id): id is string => Boolean(id)),
  ),
);

let rc: typeof import('react-native-purchases').default | null = null;
let initPromise: Promise<void> | null = null;
let customerInfoListenerAttached = false;
const packages = new Map<PlanId, PurchasesPackage>();

function applyCustomerInfo(info: Awaited<ReturnType<NonNullable<typeof rc>['getCustomerInfo']>>) {
  useEntitlementStore
    .getState()
    .setPlus(hasActiveEntitlement(info.entitlements.active, entitlementIds));
}

function trialDaysFor(pkg: PurchasesPackage): number | null {
  const intro = pkg.product.introPrice;
  if (intro?.price === 0) {
    const multiplier = intro.periodUnit === 'DAY' ? 1 : intro.periodUnit === 'WEEK' ? 7 : null;
    return multiplier ? intro.periodNumberOfUnits * intro.cycles * multiplier : null;
  }

  const freePhase = pkg.product.defaultOption?.freePhase;
  if (!freePhase) return null;
  const multiplier =
    freePhase.billingPeriod.unit === 'DAY'
      ? 1
      : freePhase.billingPeriod.unit === 'WEEK'
        ? 7
        : null;
  return multiplier
    ? freePhase.billingPeriod.value * (freePhase.billingCycleCount ?? 1) * multiplier
    : null;
}

export function initPurchases(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!apiKey || Platform.OS === 'web') return;
    try {
      const Purchases = (await import('react-native-purchases')).default;
      Purchases.configure({ apiKey });
      rc = Purchases;
      if (!customerInfoListenerAttached) {
        Purchases.addCustomerInfoUpdateListener(applyCustomerInfo);
        customerInfoListenerAttached = true;
      }
    } catch {
      rc = null;
      return;
    }
    // A transient network/store failure must not discard an otherwise
    // configured RevenueCat client for the rest of the app session.
    try {
      applyCustomerInfo(await rc.getCustomerInfo());
    } catch {}
  })();
  return initPromise;
}

export async function refreshPurchases(): Promise<void> {
  await initPurchases();
  if (!rc) return;
  try {
    applyCustomerInfo(await rc.getCustomerInfo());
  } catch {
    // Keep the last verified runtime state and retry on the next app resume.
  }
}

export async function loadPlans(): Promise<PurchaseCatalog> {
  await initPurchases();
  if (!rc) {
    return __DEV__
      ? { status: 'ready', plans: DEV_PLANS, mock: true }
      : { status: 'unavailable', plans: [], mock: false };
  }

  try {
    const offering = (await rc.getOfferings()).current;
    if (!offering) return { status: 'unavailable', plans: [], mock: false };

    packages.clear();
    const recognized = offering.availablePackages.flatMap((pkg) => {
      const id = planIdForPackage(pkg.packageType, pkg.identifier);
      if (!id) return [];
      packages.set(id, pkg);
      return [{ id, pkg }];
    });
    if (recognized.length === 0) {
      return { status: 'unavailable', plans: [], mock: false };
    }

    const eligibility: Record<string, { status: number }> = await rc
      .checkTrialOrIntroductoryPriceEligibility(
        recognized.map(({ pkg }) => pkg.product.identifier),
      )
      .catch(() => ({}));

    return {
      status: 'ready',
      mock: false,
      plans: recognized.map(({ id, pkg }) => {
        const trialEligible =
          eligibility[pkg.product.identifier]?.status ===
          rc!.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
        return {
          id,
          price: pkg.product.priceString,
          monthlyPrice: pkg.product.pricePerMonthString,
          trialEligible,
          trialDays: trialEligible ? trialDaysFor(pkg) : null,
        };
      }),
    };
  } catch {
    return { status: 'unavailable', plans: [], mock: false };
  }
}

export async function purchase(planId: PlanId): Promise<PurchaseResult> {
  await initPurchases();
  if (!rc) {
    if (!__DEV__) return { status: 'unavailable' };
    useEntitlementStore.getState().setPlus(true);
    return { status: 'purchased' };
  }

  try {
    if (!packages.has(planId)) await loadPlans();
    const pkg = packages.get(planId);
    if (!pkg) return { status: 'unavailable' };
    const { customerInfo } = await rc.purchasePackage(pkg);
    const active = hasActiveEntitlement(
      customerInfo.entitlements.active,
      entitlementIds,
    );
    useEntitlementStore.getState().setPlus(active);
    return active ? { status: 'purchased' } : { status: 'failed' };
  } catch (error) {
    return { status: classifyPurchaseError(error) };
  }
}

export async function restore(): Promise<boolean> {
  await initPurchases();
  if (!rc) return __DEV__ && useEntitlementStore.getState().isPlus;
  const info = await rc.restorePurchases();
  const active = hasActiveEntitlement(info.entitlements.active, entitlementIds);
  useEntitlementStore.getState().setPlus(active);
  return active;
}

export async function openSubscriptionManagement(): Promise<void> {
  const url =
    Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions?package=com.ihvan.quran';
  await Linking.openURL(url);
}
