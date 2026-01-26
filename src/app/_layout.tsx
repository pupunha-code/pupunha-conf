import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { setBackgroundColorAsync } from 'expo-system-ui';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useEventsQuery } from '@/hooks/useEventsQuery';
import { useTheme } from '@/hooks/useTheme';
import { colors } from '@/lib/theme';
import { analytics } from '@/services/analytics.service';
import { useEventStore } from '@/store';
import { useAuthStore } from '@/store/auth.store';

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInitializer() {
  const router = useRouter();
  const { colorScheme, isDark } = useTheme();
  const themeColors = colors[colorScheme];

  const { data: events = [], isLoading: eventsLoading } = useEventsQuery();
  const { initializeActiveEvent, activeEventId, isInitialized, getActiveEvent, getActiveDay } =
    useEventStore();
  const { initialize: initAuth } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasNavigated = useRef(false);

  // Mark component as mounted after first render and initialize analytics and auth
  useEffect(() => {
    setIsMounted(true);
    analytics.initialize();
    initAuth();
  }, [initAuth]);


  // Wait for Zustand persist to hydrate and events to load, then initialize
  useEffect(() => {
    // Only initialize if we have events data and not loading
    if (!eventsLoading && events.length > 0) {
      // Delay to ensure Zustand persist has hydrated from AsyncStorage
      const timer = setTimeout(() => {
        initializeActiveEvent(events);
        // Mark as hydrated after a small additional delay to ensure state updates
        setTimeout(() => {
          setIsHydrated(true);
        }, 50);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [initializeActiveEvent, events, eventsLoading]);

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

  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={styles.container}>
      <ActionSheetProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(event)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
