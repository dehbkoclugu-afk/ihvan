import React from 'react';
import { ScrollView, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme/tokens';

export function Screen({ children, scroll = true, tabbed = false, style, scrollRef, footer }: { children: React.ReactNode; scroll?: boolean; tabbed?: boolean; style?: ViewStyle; scrollRef?: React.Ref<ScrollView>; footer?: React.ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = width < 360;
  const tablet = width >= 768;
  const landscape = width > height;
  const horizontal = compact ? spacing.lg : tablet ? spacing.xxl : spacing.xl;
  const maxWidth = tablet ? 680 : 560;
  const content: ViewStyle = {
    paddingTop: landscape ? spacing.lg : spacing.xl,
    paddingHorizontal: horizontal,
    paddingBottom: (tabbed ? 64 + insets.bottom + spacing.xl : insets.bottom + spacing.xl) + (footer ? 68 : 0),
    width: '100%', maxWidth, alignSelf: 'center',
  };
  const safeRoot: ViewStyle = { flex: 1, backgroundColor: t.bg, paddingTop: insets.top };
  const floatingFooter = footer ? <View style={{ position: 'absolute', start: 0, end: 0, bottom: 0, paddingBottom: insets.bottom, backgroundColor: t.chrome, borderTopWidth: 1, borderTopColor: t.border }}><View style={{ width: '100%', maxWidth, alignSelf: 'center', paddingHorizontal: horizontal }}>{footer}</View></View> : null;
  if (!scroll) return <View style={safeRoot}><View style={[content, { flex: 1 }, style]}>{children}</View>{floatingFooter}</View>;
  return <View style={safeRoot}><ScrollView
    ref={scrollRef}
    automaticallyAdjustKeyboardInsets
    contentInsetAdjustmentBehavior="never"
    contentContainerStyle={[content, style]}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >{children}</ScrollView>{floatingFooter}</View>;
}
