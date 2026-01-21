import { Platform, TextStyle } from 'react-native';

/**
 * Typography tokens for consistent text styling.
 * Uses system fonts for optimal performance and native feel.
 */

export const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'Menlo',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto',
    semibold: 'Roboto',
    bold: 'Roboto',
    mono: 'monospace',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'monospace',
  },
})!;

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

export const fontSize = {
  /** 10px */
  xxs: 10,
  /** 12px */
  xs: 12,
  /** 14px */
  sm: 14,
  /** 16px */
  md: 16,
  /** 18px */
  lg: 18,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 28px */
  xxxl: 28,
  /** 32px */
  display: 32,
  /** 40px */
  displayLg: 40,
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

/**
 * Pre-defined text styles for common use cases.
 */
export const textStyles = {
  // Display
  displayLarge: {
    fontSize: fontSize.displayLg,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.displayLg * lineHeight.tight,
  },
  displayMedium: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.display * lineHeight.tight,
  },

  // Headings
  h1: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxxl * lineHeight.tight,
  },
  h2: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxl * lineHeight.tight,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  h4: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * lineHeight.normal,
  },

  // Body
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.lg * lineHeight.relaxed,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.relaxed,
  },

  // Labels
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  labelSmall: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * lineHeight.normal,
  },

  // Caption
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal,
  },

  // Button
  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  buttonSmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
} as const;

export type FontSize = keyof typeof fontSize;
export type TextStyleName = keyof typeof textStyles;
