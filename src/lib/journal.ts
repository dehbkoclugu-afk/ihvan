export interface ReflectionEntry {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export function normalizeReflectionText(text: unknown): string {
  return typeof text === 'string' ? text.trim() : '';
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

export function normalizeReflectionEntries(entries: unknown): ReflectionEntry[] {
  if (!Array.isArray(entries)) return [];

  const normalized: ReflectionEntry[] = [];
  const seenIds = new Set<string>();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const candidate = entry as Record<string, unknown>;
    const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
    const text = normalizeReflectionText(candidate.text);
    if (!id || !text || !isValidTimestamp(candidate.createdAt) || seenIds.has(id)) continue;
    seenIds.add(id);
    normalized.push({
      id,
      text,
      createdAt: candidate.createdAt,
      ...(isValidTimestamp(candidate.updatedAt) ? { updatedAt: candidate.updatedAt } : {}),
    });
  }
  return normalized;
}

export function updateReflectionEntries(entries: readonly ReflectionEntry[], id: string, text: string, updatedAt = new Date().toISOString()): ReflectionEntry[] {
  const normalized = normalizeReflectionText(text);
  if (!normalized) return [...entries];
  return entries.map((entry) => entry.id === id ? { ...entry, text: normalized, updatedAt } : entry);
}
