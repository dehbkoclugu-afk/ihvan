export type PlanId = 'monthly' | 'annual' | 'lifetime';
export type PurchaseFailure = 'cancelled' | 'pending' | 'failed';

const CANCELLED = '1';
const PAYMENT_PENDING = '20';

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
  if (packageType === 'LIFETIME') return 'lifetime';

  const id = identifier.toLowerCase();
  if (id.includes('annual') || id.includes('yearly')) return 'annual';
  if (id.includes('monthly')) return 'monthly';
  if (id.includes('lifetime')) return 'lifetime';
  return null;
}

export function hasActiveEntitlement(
  active: Record<string, unknown>,
  entitlementIds: readonly string[],
): boolean {
  return entitlementIds.some((id) => Boolean(active[id]));
}
