import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compassTurn, nextPrayer, prayerDay } from './prayerTimes.ts';

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
