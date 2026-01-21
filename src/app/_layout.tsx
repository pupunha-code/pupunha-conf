import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/lib/theme';
import { useEventStore } from '@/store';

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export default function RootLayout() {
  const router = useRouter();
  const { colorScheme, isDark } = useTheme();
  const themeColors = colors[colorScheme];

  const { initializeActiveEvent, activeEventId, isInitialized, getActiveEvent, getActiveDay } = useEventStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasNavigated = useRef(false);

  // Mark component as mounted after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Wait for Zustand persist to hydrate, then initialize
  useEffect(() => {
    // Delay to ensure Zustand persist has hydrated from AsyncStorage
    // This is necessary because persist middleware loads asynchronously
    const timer = setTimeout(() => {
      initializeActiveEvent();
      // Mark as hydrated after a small additional delay to ensure state updates
      setTimeout(() => {
        setIsHydrated(true);
      }, 50);
    }, 150);

    return () => clearTimeout(timer);
  }, [initializeActiveEvent]);

  // Update system UI colors based on theme
  useEffect(() => {
    setBackgroundColorAsync(themeColors.background);

    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(themeColors.background);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
    }
  }, [colorScheme, themeColors.background, isDark]);

  // Hide splash screen when initialized
  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  // Redirect based on event selection
  // Only navigate after component is mounted, hydrated, and initialized
  useEffect(() => {
    if (isMounted && isHydrated && isInitialized && !hasNavigated.current) {
      hasNavigated.current = true;
      
      // Use requestAnimationFrame to ensure Stack navigator is ready
      requestAnimationFrame(() => {
        const activeEvent = getActiveEvent();
        const activeDay = getActiveDay();
        // Only navigate to calendar if both event and day are available
        if (activeEventId && activeEvent && activeDay) {
          router.replace('/(event)/calendar');
        } else {
          router.replace('/');
        }
      });
    }
  }, [isMounted, isHydrated, isInitialized, activeEventId, getActiveEvent, getActiveDay, router]);

  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={styles.container}>
      <ActionSheetProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(event)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
