import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compassTurn, formatPrayerCountdown, nextPrayer, prayerDay, prayerNotificationPlan } from './prayerTimes.ts';

const ISTANBUL = { latitude: 41.0082, longitude: 28.9784 };

test('calculates a complete ordered Turkey-method prayer day for Istanbul', () => {
  const day = prayerDay(ISTANBUL.latitude, ISTANBUL.longitude, new Date(2026, 7, 7));
  assert.deepEqual(day.moments.map((item) => item.key), ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']);
  assert.ok(day.moments.every((item, index) => index === 0 || item.time > day.moments[index - 1].time));
  assert.match(day.methodLabel, /Diyanet/);
});

test('keeps Istanbul qibla bearing in the expected south-east range', () => {
  const { qibla } = prayerDay(ISTANBUL.latitude, ISTANBUL.longitude, new Date(2026, 7, 7));
  assert.ok(qibla > 151 && qibla < 152);
});

test('rolls next prayer to tomorrow fajr after isha', () => {
  const late = new Date(2026, 7, 7, 23, 59);
  const next = nextPrayer(ISTANBUL.latitude, ISTANBUL.longitude, late);
  assert.equal(next.key, 'fajr');
  assert.equal(next.time.getDate(), 8);
});

test('turns qibla bearing relative to the live device heading', () => {
  assert.equal(compassTurn(150, 120), 30);
  assert.equal(compassTurn(10, 350), 20);
});

test('formats a compact countdown to the next prayer', () => {
  const now = new Date(2026, 7, 7, 12, 0, 0);
  assert.equal(formatPrayerCountdown(new Date(2026, 7, 7, 12, 45, 0), now), '45 dk');
  assert.equal(formatPrayerCountdown(new Date(2026, 7, 7, 13, 5, 0), now), '1 sa 5 dk');
  assert.equal(formatPrayerCountdown(now, now), 'şimdi');
});

test('plans only the five prayer notifications and stays below iOS pending limits', () => {
  const from = new Date(2026, 7, 7, 0, 1);
  const plan = prayerNotificationPlan(ISTANBUL.latitude, ISTANBUL.longitude, from, 10);
  assert.equal(plan.length, 50);
  assert.ok(plan.every((item) => !item.identifier.includes('sunrise')));
  assert.ok(plan.length < 64);
  assert.ok(plan.every((item) => item.time > from));
});

test('filters notification plan to selected prayers', () => {
  const from = new Date(2026, 7, 8, 0, 0);
  const plan = prayerNotificationPlan(41.0082, 28.9784, from, 2, 0, ['fajr', 'isha']);
  assert.ok(plan.length >= 3 && plan.length <= 4);
  assert.ok(plan.every((item) => item.identifier.endsWith('-fajr') || item.identifier.endsWith('-isha')));
  assert.deepEqual(prayerNotificationPlan(41.0082, 28.9784, from, 2, 0, []), []);
});

test('moves prayer reminders earlier by the selected offset', () => {
  const from = new Date(2026, 7, 7, 0, 1);
  const exact = prayerNotificationPlan(ISTANBUL.latitude, ISTANBUL.longitude, from, 1, 0);
  const early = prayerNotificationPlan(ISTANBUL.latitude, ISTANBUL.longitude, from, 1, 15);
  assert.equal(early.length, exact.length);
  assert.deepEqual(early.map((item) => item.identifier), exact.map((item) => item.identifier));
  assert.ok(early.every((item, index) => exact[index].time.getTime() - item.time.getTime() === 15 * 60_000));
});
