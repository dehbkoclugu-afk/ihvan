import ar from './locales/ar.ts';
import en from './locales/en.ts';
import tr from './locales/tr.ts';
import type { AppLocale } from './applicationLocales.ts';

export type TranslationKey = keyof typeof en;
export type TranslationValues = Record<string, string | number>;
export type TranslationDictionary = Record<TranslationKey, string>;

export const translations: Record<AppLocale, TranslationDictionary> = { tr, en, ar };

export function interpolateTranslation(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (token, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : token);
}
export function translationFor(locale: AppLocale, key: TranslationKey, values?: TranslationValues): string {
  return interpolateTranslation(translations[locale]?.[key] ?? en[key], values);
}
