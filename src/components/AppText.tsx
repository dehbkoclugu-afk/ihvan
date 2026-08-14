import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { textAlignment } from '@/i18n/direction';
import { type as typography } from '@/theme/typography';

type Variant = keyof typeof typography;

export function AppText({ variant = 'body', color, style, ...props }: TextProps & { variant?: Variant; color?: 'ink' | 'inkSoft' | 'inkFaint' | 'gold' | 'danger'; style?: StyleProp<TextStyle> }) {
  const theme = useTheme();
  const { locale } = useT();
  return <Text {...props} style={[typography[variant], { color: theme[color ?? 'ink'], textAlign: textAlignment(locale) }, style]} />;
}

export function ScreenTitle(props: TextProps) {
  return <AppText variant="title" {...props} style={[{ fontSize: 32, lineHeight: 39 }, props.style]} />;
}

export function ScreenSubtitle(props: TextProps) {
  return <AppText variant="secondary" color="inkSoft" {...props} style={[{ marginTop: 6 }, props.style]} />;
}
