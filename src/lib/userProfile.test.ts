import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeUserName } from './userProfile.ts';

test('normalizes optional profile names consistently', () => {
  assert.equal(normalizeUserName('  Umut   Can  '), 'Umut Can');
  assert.equal(normalizeUserName('   '), '');
  assert.equal(normalizeUserName('abcdefgh', 5), 'abcde');
});
