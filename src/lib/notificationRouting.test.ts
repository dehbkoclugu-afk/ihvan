import assert from 'node:assert/strict';
import test from 'node:test';
import { routeForNotificationData } from './notificationRouting.ts';

test('routes prayer notification taps to Worship', () => {
  assert.equal(routeForNotificationData({ kind: 'prayer-time' }), '/(tabs)/worship');
});

test('ignores unknown or malformed notification data', () => {
  assert.equal(routeForNotificationData({ kind: 'other' }), null);
  assert.equal(routeForNotificationData(null), null);
  assert.equal(routeForNotificationData('prayer-time'), null);
});
