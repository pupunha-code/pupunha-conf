import { Text as RNText, StyleSheet, TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { colors, textStyles, type ColorToken, type TextStyleName } from '@/lib/theme';

export interface TextProps extends RNTextProps {
  /**
   * Pre-defined text style variant
   */
  variant?: TextStyleName;
  /**
   * Color token from the theme
   */
  color?: ColorToken;
  /**
   * Center the text
   */
  center?: boolean;
}

export function Text({
  variant = 'body',
  color = 'text',
  center,
  style,
  children,
  ...props
}: TextProps) {
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];

  return (
    <RNText
      style={[
        styles.base,
        textStyles[variant],
        { color: themeColors[color] },
        center && styles.center,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    // Base text styling applied to all text
  },
  center: {
    textAlign: 'center',
  },
});
