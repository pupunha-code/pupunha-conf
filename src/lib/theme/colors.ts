/**
 * Color tokens for the Pupunha Code app.
 * Primary colors: #e26228 (orange) and black/matte black.
 */

export const palette = {
  // Primary brand color - Pupunha Orange
  primary: {
    50: '#FEF3ED',
    100: '#FDE2D3',
    200: '#FABFA6',
    300: '#F69B79',
    400: '#EC7A4E',
    500: '#E26228', // Main Pupunha Orange
    600: '#C9511C',
    700: '#A34116',
    800: '#7D3211',
    900: '#5A240C',
  },

  // Secondary - Matte Black tones
  secondary: {
    50: '#F5F5F5',
    100: '#E8E8E8',
    200: '#D1D1D1',
    300: '#A3A3A3',
    400: '#737373',
    500: '#525252',
    600: '#404040',
    700: '#2D2D2D',
    800: '#1A1A1A', // Matte black
    900: '#0D0D0D',
  },

  // Neutral grays
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
    1000: '#000000',
  },

  // Semantic colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const colors = {
  light: {
    // Backgrounds
    background: palette.neutral[0],
    backgroundSecondary: palette.neutral[50],
    backgroundTertiary: palette.neutral[100],
    backgroundElevated: palette.neutral[0],

    // Surfaces
    surface: palette.neutral[0],
    surfaceSecondary: palette.neutral[100],
    surfacePressed: palette.neutral[200],

    // Text
    text: palette.neutral[900],
    textSecondary: palette.neutral[600],
    textTertiary: palette.neutral[500],
    textInverse: palette.neutral[0],

    // Brand
    tint: palette.primary[500],
    tintSecondary: palette.primary[400],
    accent: palette.primary[600],

    // Icons
    icon: palette.neutral[700],
    iconSecondary: palette.neutral[500],
    iconSelected: palette.primary[500],

    // Borders
    border: palette.neutral[200],
    borderSecondary: palette.neutral[100],

    // Tab bar
    tabBarBackground: palette.neutral[0],
    tabBarBorder: palette.neutral[200],
    tabBarActive: palette.primary[500],
    tabBarInactive: palette.neutral[500],

    // Cards
    cardBackground: palette.neutral[0],
    cardBorder: palette.neutral[200],

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Backgrounds - Using matte black
    background: palette.secondary[800],
    backgroundSecondary: palette.secondary[700],
    backgroundTertiary: palette.secondary[600],
    backgroundElevated: palette.secondary[700],

    // Surfaces
    surface: palette.secondary[700],
    surfaceSecondary: palette.secondary[600],
    surfacePressed: palette.secondary[500],

    // Text
    text: palette.neutral[50],
    textSecondary: palette.neutral[400],
    textTertiary: palette.neutral[500],
    textInverse: palette.secondary[800],

    // Brand
    tint: palette.primary[500],
    tintSecondary: palette.primary[400],
    accent: palette.primary[400],

    // Icons
    icon: palette.neutral[300],
    iconSecondary: palette.neutral[500],
    iconSelected: palette.primary[500],

    // Borders
    border: palette.secondary[600],
    borderSecondary: palette.secondary[500],

    // Tab bar
    tabBarBackground: palette.secondary[800],
    tabBarBorder: palette.secondary[600],
    tabBarActive: palette.primary[500],
    tabBarInactive: palette.neutral[500],

    // Cards
    cardBackground: palette.secondary[700],
    cardBorder: palette.secondary[600],

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;
