import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { colors, spacing } from '@/lib/theme';

export interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  /**
   * Apply safe area padding (top, bottom, or both)
   */
  safeArea?: 'top' | 'bottom' | 'both' | 'none';
  /**
   * Add horizontal padding
   */
  padded?: boolean;
  /**
   * Center content vertically and horizontally
   */
  centered?: boolean;
  /**
   * Custom style
   */
  style?: ViewStyle;
}

export function Screen({
  children,
  safeArea = 'none',
  padded = true,
  centered,
  style,
  ...props
}: ScreenProps) {
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];
  const insets = useSafeAreaInsets();

  const safeAreaPadding = {
    paddingTop: safeArea === 'top' || safeArea === 'both' ? insets.top : 0,
    paddingBottom: safeArea === 'bottom' || safeArea === 'both' ? insets.bottom : 0,
  };

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: themeColors.background },
        safeAreaPadding,
        padded && styles.padded,
        centered && styles.centered,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
