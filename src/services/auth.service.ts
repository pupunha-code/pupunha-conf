import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { analytics } from './analytics.service';

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession();

class AuthService {
  async signInWithGoogle() {
    try {
      console.log('Starting Google OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'pupunhaconf://auth',
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

      // For OAuth flow, data.url will contain the redirect URL
      if (data.url) {
        console.log('Opening OAuth URL:', data.url);
        await WebBrowser.openBrowserAsync(data.url);
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

  async upsertProfile(profile: {
    id: string;
    name?: string;
    avatar_url?: string;
    email?: string;
  }) {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

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