import assert from 'node:assert/strict';
import test from 'node:test';
import { ayahCardHeight, estimateAyahLines } from './ayahCardLayout.ts';

test('estimates Uthmani text by words instead of inflating diacritics', () => {
  const text = 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ';
  assert.equal(estimateAyahLines(text), 2);
});

test('uses the measured native line count once it is available', () => {
  const text = Array.from({ length: 60 }, () => 'كَلِمَةٌ').join(' ');
  assert.equal(ayahCardHeight({ text, measuredLines: 8, lineHeight: 52, hasAction: true }), 628);
});

test('keeps short cards at the minimum height', () => {
  assert.equal(ayahCardHeight({ text: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', measuredLines: 2, lineHeight: 46, hasAction: false }), 320);
});

test('caps a long daily verse preview without changing the full reader layout', () => {
  const text = Array.from({ length: 120 }, () => 'كَلِمَةٌ').join(' ');
  assert.equal(ayahCardHeight({ text, measuredLines: 21, lineHeight: 52, hasAction: true, maxLines: 7 }), 576);
  assert.equal(ayahCardHeight({ text, measuredLines: 21, lineHeight: 52, hasAction: true }), 1304);
});
