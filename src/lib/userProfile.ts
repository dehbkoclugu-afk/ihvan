export function normalizeUserName(value: string, maxLength = 50): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, Math.max(0, maxLength));
}
