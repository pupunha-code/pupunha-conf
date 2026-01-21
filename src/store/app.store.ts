import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AppTheme, Bookmark, UserProfile } from '@/types';

interface AppState {
  // Theme
  themeMode: AppTheme;
  setThemeMode: (mode: AppTheme) => void;

  // Haptic feedback
  hapticEnabled: boolean;
  toggleHaptic: () => void;

  // Timezone
  useLocalTimezone: boolean;
  toggleLocalTimezone: () => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;

  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (sessionId: string, notificationId?: string) => void;
  removeBookmark: (sessionId: string) => void;
  isBookmarked: (sessionId: string) => boolean;
  toggleBookmark: (sessionId: string, notificationId?: string) => void;

  // Data refresh
  lastRefreshed: string | null;
  setLastRefreshed: (date: string) => void;
}

export const useAppStore = create(
  persist<AppState>(
    (set, get) => ({
      // Theme
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),

      // Haptic feedback
      hapticEnabled: true,
      toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),

      // Timezone
      useLocalTimezone: false,
      toggleLocalTimezone: () =>
        set((state) => ({ useLocalTimezone: !state.useLocalTimezone })),

      // Notifications
      notificationsEnabled: false,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      // User profile
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),

      // Bookmarks
      bookmarks: [],
      addBookmark: (sessionId, notificationId) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              sessionId,
              notificationId,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeBookmark: (sessionId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.sessionId !== sessionId),
        })),
      isBookmarked: (sessionId) =>
        get().bookmarks.some((b) => b.sessionId === sessionId),
      toggleBookmark: (sessionId, notificationId) => {
        const { isBookmarked, addBookmark, removeBookmark } = get();
        if (isBookmarked(sessionId)) {
          removeBookmark(sessionId);
        } else {
          addBookmark(sessionId, notificationId);
        }
      },

      // Data refresh
      lastRefreshed: null,
      setLastRefreshed: (date) => set({ lastRefreshed: date }),
    }),
    {
      name: 'pupunha-conf-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        hapticEnabled: state.hapticEnabled,
        useLocalTimezone: state.useLocalTimezone,
        notificationsEnabled: state.notificationsEnabled,
        userProfile: state.userProfile,
        bookmarks: state.bookmarks,
        lastRefreshed: state.lastRefreshed,
      }) as AppState,
    },
  ),
);
