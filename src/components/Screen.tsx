import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme/tokens';

export function Screen({ children, scroll = true, tabbed = false, style, scrollRef }: { children: React.ReactNode; scroll?: boolean; tabbed?: boolean; style?: ViewStyle; scrollRef?: React.Ref<ScrollView> }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const content: ViewStyle = {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: tabbed ? 64 + insets.bottom + spacing.xl : insets.bottom + spacing.xl,
    width: '100%', maxWidth: 560, alignSelf: 'center',
  };
  const safeRoot: ViewStyle = { flex: 1, backgroundColor: t.bg, paddingTop: insets.top };
  if (!scroll) return <View style={safeRoot}><View style={[content, { flex: 1 }, style]}>{children}</View></View>;
  return <View style={safeRoot}><ScrollView
    ref={scrollRef}
    automaticallyAdjustKeyboardInsets
    contentInsetAdjustmentBehavior="never"
    contentContainerStyle={[content, style]}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >{children}</ScrollView></View>;
}
