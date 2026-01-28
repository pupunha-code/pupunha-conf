import * as Haptics from 'expo-haptics';
import { forwardRef } from 'react';
import { Pressable, PressableProps, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';

import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  /**
   * Button text content
   */
  children: string;
  /**
   * Visual variant
   */
  variant?: ButtonVariant;
  /**
   * Size variant
   */
  size?: ButtonSize;
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;
  /**
   * Custom style
   */
  style?: ViewStyle;
}

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    leftIcon,
    rightIcon,
    disabled,
    onPress,
    style,
    ...props
  },
  ref,
) {
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = (event: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? themeColors.border : themeColors.tint,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? themeColors.surfaceSecondary : themeColors.surfaceSecondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? themeColors.border : themeColors.tint,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return 'textTertiary';
    switch (variant) {
      case 'primary':
        return 'textInverse';
      case 'secondary':
        return 'text';
      case 'outline':
      case 'ghost':
        return 'tint';
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        };
      case 'md':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        };
      case 'lg':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
        };
    }
  };

  return (
    <AnimatedPressable
      ref={ref}
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...props}
    >
      {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
      <Text variant={size === 'sm' ? 'buttonSmall' : 'button'} color={getTextColor()}>
        {loading ? 'Carregando...' : children}
      </Text>
      {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
