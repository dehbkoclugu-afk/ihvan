import { useColorScheme } from 'react-native';
import { useUserStore } from '@/state/useUserStore';
import { themes, type ThemeColors, type ThemeName } from '@/theme/tokens';

export function useThemeName(): ThemeName {
  const system = useColorScheme();
  const pref = useUserStore((s) => s.themePreference);
  return pref === 'system' ? (system === 'light' ? 'dawn' : 'vigil') : pref;
}

export function useTheme(): ThemeColors {
  return themes[useThemeName()];
}
