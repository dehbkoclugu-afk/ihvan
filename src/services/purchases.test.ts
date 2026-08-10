import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyPurchaseError,
  hasActiveEntitlement,
  normalizePersistedEntitlement,
  planIdForPackage,
} from './purchases.logic.ts';

test('classifies RevenueCat cancellation without treating it as a failure', () => {
  assert.equal(classifyPurchaseError({ code: '1' }), 'cancelled');
});

test('classifies a pending store payment', () => {
  assert.equal(classifyPurchaseError({ code: '20' }), 'pending');
});

test('classifies unknown values as failures', () => {
  assert.equal(classifyPurchaseError(new Error('network')), 'failed');
  assert.equal(classifyPurchaseError(null), 'failed');
});

test('maps RevenueCat package types to Ihvan plans', () => {
  assert.equal(planIdForPackage('ANNUAL', '$rc_annual'), 'annual');
  assert.equal(planIdForPackage('MONTHLY', '$rc_monthly'), 'monthly');
  assert.equal(planIdForPackage('LIFETIME', '$rc_lifetime'), null);
});

test('maps custom package identifiers conservatively', () => {
  assert.equal(planIdForPackage('CUSTOM', 'lumen_annual_v2'), 'annual');
  assert.equal(planIdForPackage('CUSTOM', 'premium-monthly'), 'monthly');
  assert.equal(planIdForPackage('CUSTOM', 'lifetime_access'), null);
  assert.equal(planIdForPackage('CUSTOM', 'premium-weekly'), null);
});

test('recognizes only the canonical Ihvan Plus entitlement', () => {
  assert.equal(hasActiveEntitlement({ ihvan_plus: {} }, ['ihvan_plus']), true);
  assert.equal(hasActiveEntitlement({ plus: {} }, ['ihvan_plus']), false);
  assert.equal(hasActiveEntitlement({ 'Ihvan Plus': {} }, ['ihvan_plus']), false);
});

test('never restores Plus entitlement from persisted storage', () => {
  assert.deepEqual(normalizePersistedEntitlement({ isPlus: true, sawDiscountOffer: true }), {
    isPlus: false,
    sawDiscountOffer: true,
  });
  assert.deepEqual(normalizePersistedEntitlement({ sawDiscountOffer: 'true' }), {
    isPlus: false,
    sawDiscountOffer: false,
  });
});
