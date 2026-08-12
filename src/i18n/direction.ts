import { APPLICATION_LOCALES } from './applicationLocales.ts';

export type DirectionalIoniconName =
  | 'chevron-back'
  | 'chevron-forward'
  | 'arrow-back'
  | 'arrow-forward'
  | 'caret-back'
  | 'caret-forward'
  | 'play-back'
  | 'play-forward'
  | 'play-skip-back'
  | 'play-skip-forward';

const rtlIcons: Partial<Record<DirectionalIoniconName, DirectionalIoniconName>> = {
  'chevron-back': 'chevron-forward',
  'chevron-forward': 'chevron-back',
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
  'caret-back': 'caret-forward',
  'caret-forward': 'caret-back',
};

export function getApplicationDirection(locale: string): 'ltr' | 'rtl' {
  return APPLICATION_LOCALES.find(({ tag }) => tag === locale)?.direction ?? 'ltr';
}
export const isApplicationRTL = (locale: string) => getApplicationDirection(locale) === 'rtl';
export const rowDirection = (locale: string) => isApplicationRTL(locale) ? 'row-reverse' as const : 'row' as const;
export const textAlignment = (locale: string) => isApplicationRTL(locale) ? 'right' as const : 'left' as const;
export const writingDirection = (locale: string) => isApplicationRTL(locale) ? 'rtl' as const : 'ltr' as const;

/** Mirror spatial navigation icons only; media controls retain their meaning. */
export function getDirectionalIconName<T extends DirectionalIoniconName>(icon: T, locale: string): DirectionalIoniconName {
  return isApplicationRTL(locale) ? rtlIcons[icon] ?? icon : icon;
}
