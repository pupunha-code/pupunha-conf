import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { analytics } from './analytics.service';

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession();

class AuthService {
  async signInWithGoogle() {
    try {
      console.log('Starting Google OAuth...');

      // Get the redirect URL - use the app scheme for proper deep linking
      const redirectUrl = Linking.createURL('/auth');
      console.log('Using redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('OAuth response:', { data, error });

      if (error) {
        console.error('Supabase OAuth error:', error);
        throw error;
      }

      // Use openAuthSessionAsync which properly handles OAuth callbacks
      if (data.url) {
        console.log('Opening OAuth URL:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        console.log('WebBrowser result:', result);

        // If the result contains a URL, it means the OAuth flow completed
        // The URL will contain the tokens in the hash or query params
        if (result.type === 'success' && result.url) {
          console.log('OAuth callback received:', result.url);

          // Extract tokens from the callback URL
          // Supabase returns tokens in the URL hash: #access_token=...&refresh_token=...
          // Parse the URL manually since URL constructor may not work in React Native
          const hashIndex = result.url.indexOf('#');
          const queryIndex = result.url.indexOf('?');

          let accessToken: string | null = null;
          let refreshToken: string | null = null;

          // Try to extract from hash first (Supabase default)
          if (hashIndex !== -1) {
            const hash = result.url.substring(hashIndex + 1);
            const hashParams = new URLSearchParams(hash);
            accessToken = hashParams.get('access_token');
            refreshToken = hashParams.get('refresh_token');
          }

          // Fallback to query params if not in hash
          if (!accessToken && queryIndex !== -1) {
            const query = result.url.substring(queryIndex + 1);
            const queryParams = new URLSearchParams(query);
            accessToken = queryParams.get('access_token');
            refreshToken = queryParams.get('refresh_token');
          }

          if (accessToken) {
            console.log('Setting session from OAuth callback...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              console.error('Error setting session:', sessionError);
              throw sessionError;
            }

            console.log('✅ Session set successfully!');
            return { session: sessionData.session, user: sessionData.user };
          } else {
            console.warn('No access token found in callback URL');
            // Fallback: let Supabase handle it via the redirect
            // The auth state change listener should pick it up
          }
        } else if (result.type === 'cancel') {
          console.log('OAuth flow cancelled by user');
          throw new Error('OAuth flow cancelled');
        } else if (result.type === 'dismiss') {
          console.log('OAuth flow dismissed');
          throw new Error('OAuth flow dismissed');
        }
      }

      return data;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await supabase.auth.signOut();

      // Clear user in analytics and revert to anonymous
      await analytics.clearUser();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async upsertProfile(profile: { id: string; name?: string; avatar_url?: string; email?: string }) {
    const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });

    if (error) {
      console.error('Profile upsert error:', error);
      throw error;
    }
  }

  getCurrentUser() {
    return supabase.auth.getUser();
  }

  getSession() {
    return supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
