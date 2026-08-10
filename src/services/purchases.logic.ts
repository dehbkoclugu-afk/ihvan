export type PlanId = 'monthly' | 'annual';
export type PurchaseFailure = 'cancelled' | 'pending' | 'failed';

export interface PersistedEntitlementState {
  isPlus: false;
  sawDiscountOffer: boolean;
}

const CANCELLED = '1';
const PAYMENT_PENDING = '20';

export function normalizePersistedEntitlement(value: unknown): PersistedEntitlementState {
  const candidate = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
  return {
    isPlus: false,
    sawDiscountOffer: candidate.sawDiscountOffer === true,
  };
}

export function classifyPurchaseError(error: unknown): PurchaseFailure {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';
  if (code === CANCELLED) return 'cancelled';
  if (code === PAYMENT_PENDING) return 'pending';
  return 'failed';
}

export function planIdForPackage(packageType: string, identifier: string): PlanId | null {
  if (packageType === 'ANNUAL') return 'annual';
  if (packageType === 'MONTHLY') return 'monthly';
  const id = identifier.toLowerCase();
  if (id.includes('annual') || id.includes('yearly')) return 'annual';
  if (id.includes('monthly')) return 'monthly';
  return null;
}

export function hasActiveEntitlement(
  active: Record<string, unknown>,
  entitlementIds: readonly string[],
): boolean {
  return entitlementIds.some((id) => Boolean(active[id]));
}
