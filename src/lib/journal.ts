export interface ReflectionEntry {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export function normalizeReflectionText(text: string): string {
  return text.trim();
}

export function updateReflectionEntries(entries: readonly ReflectionEntry[], id: string, text: string, updatedAt = new Date().toISOString()): ReflectionEntry[] {
  const normalized = normalizeReflectionText(text);
  if (!normalized) return [...entries];
  return entries.map((entry) => entry.id === id ? { ...entry, text: normalized, updatedAt } : entry);
}
