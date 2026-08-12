export type AppDirection = 'ltr' | 'rtl';

export const APPLICATION_LOCALES = [
  { tag: 'tr', nativeName: 'Türkçe', direction: 'ltr' },
  { tag: 'en', nativeName: 'English', direction: 'ltr' },
  { tag: 'ar', nativeName: 'العربية', direction: 'rtl' },
] as const;

export const APPLICATION_LOCALE_TAGS = ['tr', 'en', 'ar'] as const;
export type AppLocale = (typeof APPLICATION_LOCALE_TAGS)[number];
export type LanguagePreference = AppLocale | 'system';

const supported = new Set<string>(APPLICATION_LOCALE_TAGS);

/** Resolve a BCP-47 tag to a bundled application locale. */
export function resolveApplicationLocale(
  languageTag?: string | null,
  languageCode?: string | null,
): AppLocale {
  const normalizedTag = (languageTag ?? '').trim().replace(/_/g, '-').toLowerCase();
  const primarySubtag = normalizedTag.split('-')[0];
  const normalizedCode = (languageCode ?? '').trim().toLowerCase().split(/[-_]/)[0];
  const candidate = primarySubtag || normalizedCode;
  return supported.has(candidate) ? candidate as AppLocale : 'en';
}
export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === 'system' || supported.has(String(value));
}

export function resolveLanguagePreference(
  preference: LanguagePreference,
  deviceLocale?: { languageTag?: string | null; languageCode?: string | null } | null,
): AppLocale {
  return preference === 'system'
    ? resolveApplicationLocale(deviceLocale?.languageTag, deviceLocale?.languageCode)
    : preference;
}
