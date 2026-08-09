import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const androidManifest = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const androidMainActivity = readFileSync('android/app/src/main/java/com/ihvan/quran/MainActivity.kt', 'utf8');
const androidMainApplication = readFileSync('android/app/src/main/java/com/ihvan/quran/MainApplication.kt', 'utf8');
const iosInfoPlist = readFileSync('ios/hvan/Info.plist', 'utf8');

for (const permission of [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.SCHEDULE_EXACT_ALARM',
]) {
  assert.ok(androidManifest.includes(permission), `Android manifest must include ${permission}`);
}

for (const forbiddenPermission of [
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.FOREGROUND_SERVICE_LOCATION',
]) {
  assert.equal(androidManifest.includes(forbiddenPermission), false, `Android manifest must not include ${forbiddenPermission}`);
}

assert.match(androidMainActivity, /^package com\.ihvan\.quran$/m, 'Android MainActivity package must match the Gradle namespace');
assert.match(androidMainApplication, /^package com\.ihvan\.quran$/m, 'Android MainApplication package must match the Gradle namespace');

assert.ok(iosInfoPlist.includes('NSLocationWhenInUseUsageDescription'), 'iOS must explain foreground location usage');
assert.ok(iosInfoPlist.includes('İhvan, bulunduğun yere göre namaz vakitlerini ve kıble yönünü hesaplamak için konumunu kullanır.'), 'iOS must use the reviewed foreground-location explanation');
assert.equal(iosInfoPlist.includes('NSLocationAlwaysUsageDescription'), false, 'iOS must not declare Always location usage');
assert.equal(iosInfoPlist.includes('NSLocationAlwaysAndWhenInUseUsageDescription'), false, 'iOS must not declare Always-and-When-In-Use location usage');
assert.equal(iosInfoPlist.includes('<key>UIBackgroundModes</key>'), false, 'iOS must not enable background modes');

console.log('Native privacy config verified.');
