import ar from './locales/ar.ts';
import en from './locales/en.ts';
import tr from './locales/tr.ts';
import type { AppLocale } from './applicationLocales.ts';

export type TranslationKey = keyof typeof en;
export type TranslationValues = Record<string, string | number>;
export type TranslationDictionary = Record<TranslationKey, string>;

export const translations: Record<AppLocale, TranslationDictionary> = { tr, en, ar };

export function interpolateTranslation(template: string, values?: TranslationValues): string {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_token, name: string) => {
    const value = values && Object.prototype.hasOwnProperty.call(values, name) ? values[name] : undefined;
    return value === undefined || value === null ? '—' : String(value);
  });
}
export function translationFor(locale: AppLocale, key: TranslationKey, values?: TranslationValues): string {
  return interpolateTranslation(translations[locale]?.[key] ?? en[key], values);
}
