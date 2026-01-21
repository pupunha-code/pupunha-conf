import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppStore } from '@/store/app.store';
import { type ColorScheme } from '@/lib/theme';

export interface ThemeContext {
  colorScheme: ColorScheme;
  isDark: boolean;
  hapticEnabled: boolean;
  toggleHaptic: () => void;
}

export function useTheme(): ThemeContext {
  const systemColorScheme = useRNColorScheme();
  const { themeMode, hapticEnabled, toggleHaptic } = useAppStore();

  const colorScheme: ColorScheme =
    themeMode === 'system'
      ? (systemColorScheme ?? 'light')
      : themeMode;

  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    hapticEnabled,
    toggleHaptic,
  };
}
