import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authService } from '@/services/auth.service';
import { analytics } from '@/services/analytics.service';
import { AuthState } from '@/types/feed';

interface AuthStoreState extends AuthState {
  // Actions
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create(
  persist<AuthStoreState, [], [], Partial<AuthStoreState>>(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      signInWithGoogle: async () => {
        try {
          console.log('Auth store: Starting Google sign in...');
          set({ isLoading: true });

          // This will open the browser for OAuth flow
          await authService.signInWithGoogle();
          console.log('Auth store: OAuth completed');

          // After OAuth, the session will be handled by the auth state change listener
          // So we just need to indicate loading is complete
          set({ isLoading: false });
        } catch (error) {
          console.error('Auth store sign in error:', error);
          set({ isLoading: false });

          // Provide user-friendly error message
          const errorMessage = error instanceof Error ? error.message : '';
          if (errorMessage.includes('Provider') && errorMessage.includes('not enabled')) {
            throw new Error(
              'Google sign-in não está configurado ainda. Configure o Google OAuth no Supabase primeiro.',
            );
          }
          throw error;
        }
      },

      signOut: async () => {
        try {
          await authService.signOut();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Sign out error:', error);
          throw error;
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Only check for existing session, don't fail if Google provider isn't configured
          const {
            data: { session },
          } = await authService.getSession();

          // If there's no session or error, just set defaults without failing
          set({
            user: session?.user || null,
            isAuthenticated: !!session?.user,
            isLoading: false,
          });

          // Listen for auth changes
          authService.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user ? 'User logged in' : 'No user');

            const user = session?.user || null;
            set({
              user,
              isAuthenticated: !!user,
            });

            // Handle analytics user identification on auth state changes
            if (event === 'SIGNED_IN' && user) {
              console.log('User signed in, updating analytics...');
              try {
                await analytics.identifyUser(user.id, {
                  name: user.user_metadata?.full_name,
                  email: user.email,
                });
              } catch (analyticsError) {
                console.warn('Analytics error during sign in:', analyticsError);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out, clearing analytics...');
              try {
                await analytics.clearUser();
              } catch (analyticsError) {
                console.warn('Analytics error during sign out:', analyticsError);
              }
            }
          });
        } catch (error) {
          console.warn(
            'Auth initialization error (this is expected if Google provider is not configured):',
            error,
          );
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'pupunha-conf-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
