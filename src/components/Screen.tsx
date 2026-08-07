import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme/tokens';

export function Screen({ children, scroll = true, tabbed = false, style, scrollRef }: { children: React.ReactNode; scroll?: boolean; tabbed?: boolean; style?: ViewStyle; scrollRef?: React.Ref<ScrollView> }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const content: ViewStyle = {
    paddingTop: insets.top + spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: tabbed ? spacing.xxl : insets.bottom + spacing.xl,
    width: '100%', maxWidth: 560, alignSelf: 'center',
  };
  if (!scroll) return <View style={{ flex: 1, backgroundColor: t.bg }}><View style={[content, { flex: 1 }, style]}>{children}</View></View>;
  return <View style={{ flex: 1, backgroundColor: t.bg }}><ScrollView ref={scrollRef} contentContainerStyle={[content, style]} showsVerticalScrollIndicator={false}>{children}</ScrollView></View>;
}
