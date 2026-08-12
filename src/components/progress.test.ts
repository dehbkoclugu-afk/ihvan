import assert from 'node:assert/strict';
import test from 'node:test';
import { clampProgress } from './progress.ts';

test('clamps progress across zero, negative, and overflow states', () => {
  assert.equal(clampProgress(1, 4), 0.25);
  assert.equal(clampProgress(5, 4), 1);
  assert.equal(clampProgress(-1, 4), 0);
  assert.equal(clampProgress(1, 0), 0);
});
