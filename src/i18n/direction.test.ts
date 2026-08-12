import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getApplicationDirection,
  getDirectionalIconName,
  rowDirection,
  textAlignment,
} from './direction.ts';

test('Arabic is RTL and Turkish/English are LTR', () => {
  assert.equal(getApplicationDirection('ar'), 'rtl');
  assert.equal(getApplicationDirection('tr'), 'ltr');
  assert.equal(getApplicationDirection('en'), 'ltr');
  assert.equal(getApplicationDirection('retired'), 'ltr');
});
test('mirrors navigation icons but not playback controls', () => {
  assert.equal(getDirectionalIconName('chevron-back', 'ar'), 'chevron-forward');
  assert.equal(getDirectionalIconName('arrow-forward', 'ar'), 'arrow-back');
  assert.equal(getDirectionalIconName('play-skip-forward', 'ar'), 'play-skip-forward');
  assert.equal(rowDirection('ar'), 'row-reverse');
  assert.equal(textAlignment('ar'), 'right');
});
