import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const appConfig = JSON.parse(readFileSync('app.json', 'utf8')) as { expo: Record<string, unknown> };
const easConfig = JSON.parse(readFileSync('eas.json', 'utf8')) as Record<string, unknown>;

test('release config has no placeholder credentials or background location', () => {
  const serialized = JSON.stringify({ appConfig, easConfig });
  assert.equal(serialized.includes('REPLACE_WITH_'), false);
  assert.equal(serialized.includes('ACCESS_BACKGROUND_LOCATION'), false);
  assert.equal(serialized.includes('locationAlwaysAndWhenInUsePermission'), false);
});

test('release branding assets referenced by Expo exist', () => {
  for (const path of ['assets/icon.png', 'assets/brand-mark.png', 'assets/notification-icon.png', 'assets/favicon.png']) {
    assert.equal(existsSync(path), true, `${path} must exist`);
  }
});
