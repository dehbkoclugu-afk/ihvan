import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeReflectionText, updateReflectionEntries, type ReflectionEntry } from './journal.ts';

const entries: ReflectionEntry[] = [
  { id: '1', text: 'İlk not', createdAt: '2026-08-07T10:00:00.000Z' },
  { id: '2', text: 'İkinci not', createdAt: '2026-08-08T10:00:00.000Z' },
];

test('normalizes reflection text before storage', () => {
  assert.equal(normalizeReflectionText('  Bugünkü not  '), 'Bugünkü not');
});

test('updates only the selected reflection and preserves its creation time', () => {
  const updated = updateReflectionEntries(entries, '1', '  Düzenlenmiş not  ', '2026-08-08T12:00:00.000Z');
  assert.deepEqual(updated[0], { id: '1', text: 'Düzenlenmiş not', createdAt: '2026-08-07T10:00:00.000Z', updatedAt: '2026-08-08T12:00:00.000Z' });
  assert.deepEqual(updated[1], entries[1]);
});

test('does not replace an existing reflection with empty text', () => {
  assert.deepEqual(updateReflectionEntries(entries, '1', '   '), entries);
});
