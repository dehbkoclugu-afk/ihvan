export const fonts = {
  /** Editorial serif , scripture, display headings */
  serif: 'Fraunces_600SemiBold',
  serifLight: 'Fraunces_400Regular',
  /** Humanist sans , UI */
  sans: 'Figtree_400Regular',
  sansMedium: 'Figtree_500Medium',
  sansSemiBold: 'Figtree_600SemiBold',
  sansBold: 'Figtree_700Bold',
} as const;

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 44 },
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fonts.sansSemiBold, fontSize: 22, lineHeight: 28 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 26 },
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 17, lineHeight: 26 },
  secondary: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  verse: { fontFamily: fonts.serifLight, fontSize: 26, lineHeight: 38 },
} as const;
