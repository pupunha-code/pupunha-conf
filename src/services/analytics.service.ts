import LogRocket from '@logrocket/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGROCKET_APP_ID = process.env.EXPO_PUBLIC_LOGROCKET_APP_ID || '';
const ANONYMOUS_USER_KEY = '@pupunha_anonymous_user_id';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || !LOGROCKET_APP_ID) {
      return;
    }

    try {
      LogRocket.init(LOGROCKET_APP_ID, {
        network: {
          isEnabled: true,
          requestSanitizer: (request) => {
            // Sanitize sensitive headers
            if (request.headers?.authorization) {
              request.headers.authorization = '[REDACTED]';
            }
            return request;
          },
          responseSanitizer: (response) => {
            // Sanitize sensitive response data
            return response;
          },
        },
      });

      this.isInitialized = true;

      // Identify anonymous user on initialization
      await this.identifyAnonymousUser();
    } catch (error) {
      console.warn('Failed to initialize LogRocket:', error);
    }
  }

  private async getOrCreateAnonymousUserId(): Promise<string> {
    try {
      let anonymousId = await AsyncStorage.getItem(ANONYMOUS_USER_KEY);

      if (!anonymousId) {
        anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(ANONYMOUS_USER_KEY, anonymousId);
      }

      return anonymousId;
    } catch (error) {
      console.warn('Failed to get/create anonymous user ID:', error);
      return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  async identifyAnonymousUser(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const anonymousId = await this.getOrCreateAnonymousUserId();

      LogRocket.identify(anonymousId, {
        userType: 'anonymous',
        platform: Platform.OS,
        version: Platform.Version,
        appVersion: process.env.EXPO_PUBLIC_APP_VERSION || 'unknown',
      });
    } catch (error) {
      console.warn('Failed to identify anonymous user:', error);
    }
  }

  async identifyUser(
    userId: string,
    userInfo: {
      name?: string;
      email?: string;
      [key: string]: any;
    },
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      LogRocket.identify(userId, {
        ...userInfo,
        userType: 'authenticated',
        platform: Platform.OS,
        version: Platform.Version,
        appVersion: process.env.EXPO_PUBLIC_APP_VERSION || 'unknown',
      });
    } catch (error) {
      console.warn('Failed to identify user:', error);
    }
  }

  captureMessage(message: string, extra?: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      LogRocket.captureMessage(message, extra);
    } catch (error) {
      console.warn('Failed to capture message:', error);
    }
  }

  captureException(error: Error, extra?: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      LogRocket.captureException(error, extra);
    } catch (error) {
      console.warn('Failed to capture exception:', error);
    }
  }

  getSessionURL(callback: (sessionURL: string) => void): void {
    if (!this.isInitialized) {
      callback('');
      return;
    }

    try {
      LogRocket.getSessionURL(callback);
    } catch (error) {
      console.warn('Failed to get session URL:', error);
      callback('');
    }
  }

  async clearUser(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Clear the current user and identify as anonymous again
      await this.identifyAnonymousUser();
    } catch (error) {
      console.warn('Failed to clear user:', error);
    }
  }
}

export const analytics = AnalyticsService.getInstance();
