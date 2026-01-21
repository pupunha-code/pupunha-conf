/**
 * App-level type definitions.
 */

export type AppTheme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: AppTheme;
  notificationsEnabled: boolean;
  useLocalTimezone: boolean;
  hapticFeedbackEnabled: boolean;
}

export interface Bookmark {
  sessionId: string;
  notificationId?: string;
  createdAt: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  pushToken?: string;
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}
