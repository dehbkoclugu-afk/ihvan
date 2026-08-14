import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeQuranPlanDays, quranPlanSummary } from './quranPlan.ts';
test('normalizes hatim duration', () => { assert.equal(normalizeQuranPlanDays(30), 30); assert.equal(normalizeQuranPlanDays(90), 90); assert.equal(normalizeQuranPlanDays(12), 60); });
test('derives bounded hatim targets', () => { assert.deepEqual(quranPlanSummary(1236, 6236, 30), { total: 6236, read: 1236, remaining: 5000, days: 30, dailyTarget: 167, percent: 19.8 }); assert.equal(quranPlanSummary(9999, 6236, 60).dailyTarget, 0); });
