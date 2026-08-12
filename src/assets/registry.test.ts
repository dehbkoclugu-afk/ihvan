import assert from 'node:assert/strict';
import test from 'node:test';
import { ART_IDS, artSpecs, getArtworkPair, themedArtRegistry } from './registry.ts';

test('every approved artwork ID has metadata and a theme pair', () => {
  assert.equal(ART_IDS.length, 12);
  for (const id of ART_IDS) {
    assert.ok(artSpecs[id].label);
    assert.match(artSpecs[id].size, /^\d+x\d+$/);
    assert.deepEqual(Object.keys(themedArtRegistry[id]).sort(), ['dawn', 'vigil']);
  }
});

test('unknown artwork resolves safely', () => {
  assert.equal(getArtworkPair('I99-missing' as never), null);
});
