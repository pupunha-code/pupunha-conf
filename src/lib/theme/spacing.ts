/**
 * Spacing tokens based on a 4px grid system.
 * Consistent spacing creates visual rhythm and hierarchy.
 */

export const spacing = {
  /** 0px */
  none: 0,
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 32px */
  xxxl: 32,
  /** 40px */
  xxxxl: 40,
  /** 48px */
  huge: 48,
  /** 64px */
  massive: 64,
} as const;

export const borderRadius = {
  /** 0px */
  none: 0,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 9999px - fully rounded */
  full: 9999,
} as const;

export const iconSize = {
  /** 16px */
  xs: 16,
  /** 20px */
  sm: 20,
  /** 24px */
  md: 24,
  /** 28px */
  lg: 28,
  /** 32px */
  xl: 32,
  /** 40px */
  xxl: 40,
  /** 48px */
  xxxl: 48,
} as const;

export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
export type IconSize = keyof typeof iconSize;
