import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const appConfig = JSON.parse(readFileSync('app.json', 'utf8')) as { expo: Record<string, unknown> };
const packageConfig = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
const easConfig = JSON.parse(readFileSync('eas.json', 'utf8')) as Record<string, unknown>;

test('Android 1.0 release identity is canonical', () => {
  assert.equal(appConfig.expo.version, '1.0.0');
  assert.equal(packageConfig.version, '1.0.0');
  assert.equal((appConfig.expo.android as { package?: string }).package, 'com.ihvan.quran');
});

test('release config has no placeholder credentials or background location', () => {
  const serialized = JSON.stringify({ appConfig, easConfig });
  assert.equal(serialized.includes('REPLACE_WITH_'), false);
  assert.equal(serialized.includes('ACCESS_BACKGROUND_LOCATION'), false);

  const plugins = appConfig.expo.plugins as unknown[];
  const locationPlugin = plugins.find(
    (plugin): plugin is [string, Record<string, unknown>] => Array.isArray(plugin) && plugin[0] === 'expo-location',
  );

  assert.ok(locationPlugin, 'expo-location plugin must be configured');
  assert.equal(locationPlugin[1].locationAlwaysPermission, false);
  assert.equal(locationPlugin[1].locationAlwaysAndWhenInUsePermission, false);
  assert.equal(locationPlugin[1].isIosBackgroundLocationEnabled, false);
  assert.equal(locationPlugin[1].isAndroidBackgroundLocationEnabled, false);
  assert.equal(locationPlugin[1].isAndroidForegroundServiceEnabled, false);
  assert.ok((appConfig.expo.plugins as unknown[]).includes('./plugins/with-android-package-fix.js'));
});

test('release branding assets referenced by Expo exist', () => {
  for (const path of ['assets/icon.png', 'assets/brand-mark.png', 'assets/notification-icon.png', 'assets/favicon.png']) {
    assert.equal(existsSync(path), true, `${path} must exist`);
  }
});

test('release workflows preserve secret and privacy boundaries', () => {
  const preview = readFileSync('.github/workflows/android-preview.yml', 'utf8');
  const signed = readFileSync('.github/workflows/android-release.yml', 'utf8');
  const eas = readFileSync('.github/workflows/eas-release.yml', 'utf8');

  assert.ok(preview.includes('workflow_dispatch:'));
  assert.ok(preview.includes('pull_request:'));
  assert.ok(preview.includes('branches: [claude-code]'));
  assert.ok(preview.includes('cancel-in-progress: true'));
  assert.ok(preview.includes('node scripts/verify-native-config.mjs'));
  assert.ok(preview.includes('com.ihvan.quran'));
  assert.ok(preview.includes('ihvan-preview-apk'));
  assert.equal(preview.includes('secrets.'), false, 'preview APK must remain secret-free');

  for (const secret of [
    'ANDROID_KEYSTORE_BASE64',
    'ANDROID_KEYSTORE_PASSWORD',
    'ANDROID_KEY_ALIAS',
    'ANDROID_KEY_PASSWORD',
    'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
  ]) {
    assert.ok(signed.includes(`secrets.${secret}`), `signed workflow must read ${secret} from Actions secrets`);
  }
  assert.ok(signed.includes('node scripts/verify-native-config.mjs'));
  assert.ok(signed.includes('EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID: ihvan_plus'));
  assert.ok(signed.includes('release_confirmed:'));
  assert.ok(signed.includes('inputs.release_confirmed'));
  assert.ok(signed.includes('Confirm Android release'));
  assert.ok(signed.includes('run: npm test'));
  assert.ok(signed.includes('run: npm run typecheck'));
  assert.ok(signed.includes('run: npm run lint'));
  assert.ok(signed.includes('run: git diff --check'));
  assert.ok(signed.includes('jarsigner -verify'));
  assert.ok(signed.includes('apksigner'));
  assert.ok(signed.includes('rm -f android/app/upload-keystore.jks'));

  for (const secret of [
    'EXPO_TOKEN',
    'EXPO_PROJECT_ID',
    'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON',
    'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
    'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
  ]) {
    assert.ok(eas.includes(`secrets.${secret}`), `EAS workflow must read ${secret} from Actions secrets`);
  }
  assert.ok(eas.includes('--profile ${{ inputs.profile }}'));
  assert.ok(eas.includes('--non-interactive'));
  assert.ok(eas.includes('rm -f play-service-account.json'));
});

test('Android release operator documents cover every manual gate', () => {
  const deviceQa = readFileSync('docs/release/ANDROID_DEVICE_QA.md', 'utf8');
  for (const label of [
    'Clean install',
    'Quran integrity',
    'Location',
    'Qibla',
    'Notifications',
    'Purchase',
    'Restore',
    'Data export',
    'Accessibility',
    'Offline',
    'Evidence',
  ]) {
    assert.ok(deviceQa.includes(label), `device QA must include ${label}`);
  }

  const consoleValues = readFileSync('docs/release/PLAY_CONSOLE_VALUES.md', 'utf8');
  for (const value of [
    'com.ihvan.quran',
    'ihvan_plus',
    'monthly',
    'annual',
    'Google Play service account',
    'license tester',
    'Foreground location',
    'Background location: not used',
    'Purchase data',
  ]) {
    assert.ok(consoleValues.includes(value), `Play values must include ${value}`);
  }

  const checklist = readFileSync('docs/release/ANDROID_RELEASE_CHECKLIST.md', 'utf8');
  for (const value of [
    'Phase 0',
    'Phase 1',
    'Phase 2',
    'Phase 3',
    'Phase 4',
    'Phase 5',
    'Phase 6',
    'GO',
    'NO-GO',
    'AAB SHA-256',
    'versionCode',
    'Play pre-launch report',
    'RevenueCat purchase',
    'restore',
    'staged rollout',
    '72-hour monitoring',
  ]) {
    assert.ok(checklist.includes(value), `release checklist must include ${value}`);
  }
});
