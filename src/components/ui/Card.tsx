import * as Haptics from 'expo-haptics';
import { Pressable, PressableProps, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  /**
   * Elevated card with shadow
   */
  elevated?: boolean;
  /**
   * Custom style
   */
  style?: ViewStyle;
  /**
   * Disable press animation
   */
  disableAnimation?: boolean;
}

export function Card({
  children,
  elevated,
  style,
  onPress,
  disableAnimation,
  ...props
}: CardProps) {
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disableAnimation && onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (!disableAnimation && onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const handlePress = (event: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    if (hapticEnabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const cardStyles: ViewStyle[] = [
    styles.base,
    {
      backgroundColor: themeColors.cardBackground,
      borderColor: themeColors.cardBorder,
    },
    elevated && styles.elevated,
    elevated && {
      shadowColor: colorScheme === 'dark' ? '#000' : '#000',
    },
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        style={[cardStyles, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        {...props}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  elevated: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0,
  },
});
