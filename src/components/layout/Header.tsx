import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { colors, spacing } from '@/lib/theme';

import { Text } from '../ui/Text';

export interface HeaderProps {
  /**
   * Header title
   */
  title: string;
  /**
   * Left side content (e.g., back button)
   */
  left?: React.ReactNode;
  /**
   * Right side content (e.g., action buttons)
   */
  right?: React.ReactNode;
  /**
   * Use blur effect for header background
   */
  transparent?: boolean;
  /**
   * Custom style
   */
  style?: ViewStyle;
}

export function Header({ title, left, right, transparent, style }: HeaderProps) {
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    paddingTop: insets.top,
  };

  const content = (
    <View style={styles.content}>
      <View style={styles.left}>{left}</View>
      <View style={styles.titleContainer}>
        <Text variant="h4" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );

  if (transparent && Platform.OS === 'ios' && !isLiquidGlassAvailable()) {
    return (
      <BlurView intensity={80} tint={colorScheme} style={[styles.container, containerStyle, style]}>
        {content}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor: transparent ? 'transparent' : themeColors.background,
          borderBottomColor: transparent ? 'transparent' : themeColors.border,
        },
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.lg,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
