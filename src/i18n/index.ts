import { getLocales, useLocales } from 'expo-localization';
import { useMemo } from 'react';
import { useUserStore } from '@/state/useUserStore';
import {
  resolveLanguagePreference,
  type AppLocale,
  type LanguagePreference,
} from './applicationLocales.ts';
import {
  translationFor,
  type TranslationKey,
  type TranslationValues,
} from './translations.ts';

export * from './applicationLocales.ts';
export * from './direction.ts';
export type { TranslationKey, TranslationValues } from './translations.ts';

type DeviceLocale = { languageTag?: string | null; languageCode?: string | null };

function firstLocale(locales: readonly DeviceLocale[]): DeviceLocale | undefined {
  return locales[0];
}
export function getActiveApplicationLocale(
  preference: LanguagePreference = useUserStore.getState().language,
  locales: readonly DeviceLocale[] = getLocales(),
): AppLocale {
  return resolveLanguagePreference(preference, firstLocale(locales));
}

export function translate(key: TranslationKey, values?: TranslationValues): string {
  return translationFor(getActiveApplicationLocale(), key, values);
}

export function useT() {
  const preference = useUserStore((state) => state.language);
  const deviceLocales = useLocales();
  const locale = resolveLanguagePreference(preference, firstLocale(deviceLocales));
  return useMemo(() => ({
    locale,
    t: (key: TranslationKey, values?: TranslationValues) => translationFor(locale, key, values),
  }), [locale]);
}

export function formatLocaleDate(
  value: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
  locale = getActiveApplicationLocale(),
): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatLocaleNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = getActiveApplicationLocale(),
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
