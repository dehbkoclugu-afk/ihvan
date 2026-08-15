import type { AppLocale } from '../i18n/applicationLocales.ts';
import type { QuranTextSize } from './quranDisplay.ts';
import type { ThemeName } from '../theme/tokens.ts';

export const VISUAL_QA_TARGET_ROUTES = {
  onboarding: '/onboarding',
  today: '/(tabs)/today',
  quran: '/(tabs)/quran',
  worship: '/(tabs)/worship',
  journal: '/(tabs)/journal',
  profile: '/(tabs)/profile',
  paywall: '/paywall',
} as const;

export type VisualQaTarget = keyof typeof VISUAL_QA_TARGET_ROUTES;

export interface VisualQaConfig {
  locale: AppLocale;
  theme: ThemeName;
  quranTextSize: QuranTextSize;
  target: VisualQaTarget;
}

type SearchParam = string | string[] | undefined;

function first(value: SearchParam): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function resolveVisualQaConfig(params: Record<string, SearchParam>): VisualQaConfig {
  const locale = first(params.locale);
  const theme = first(params.theme);
  const quranTextSize = first(params.quranTextSize);
  const target = first(params.target);

  return {
    locale: locale === 'tr' || locale === 'ar' ? locale : 'en',
    theme: theme === 'vigil' ? 'vigil' : 'dawn',
    quranTextSize: quranTextSize === 'small' || quranTextSize === 'large' ? quranTextSize : 'medium',
    target: target && Object.prototype.hasOwnProperty.call(VISUAL_QA_TARGET_ROUTES, target)
      ? target as VisualQaTarget
      : 'today',
  };
}
