import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { colors, spacing } from '@/lib/theme';
import { supabase } from '@/lib/supabase';

/**
 * OAuth callback handler screen
 * This screen is shown briefly while processing OAuth tokens
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Auth screen loading, development build detected...');
      
      // For development builds, handle URL-based OAuth callback
      const handleURL = async (url: string) => {
        console.log('Processing auth callback URL:', url);
        
        if (url && (url.includes('#access_token=') || url.includes('?access_token='))) {
          console.log('Found OAuth tokens in URL');
          
          // Extract tokens from URL
          const [, hash] = url.split('#');
          const [, query] = url.split('?');
          
          const params = new URLSearchParams(hash || query || '');
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken) {
            console.log('Setting session from OAuth tokens...');
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            console.log('✅ Session set successfully!');
            router.replace('/(event)/feed');
            return;
          }
        }
        
        // If no tokens, fall back to session polling
        console.log('No tokens found, starting session polling...');
        startSessionPolling();
      };
      
      const startSessionPolling = async () => {
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds
        
        const checkSession = async () => {
          attempts++;
          console.log(`Session polling attempt ${attempts}/${maxAttempts}...`);
          
          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (session?.user) {
              console.log('✅ Found session! User is authenticated:', session.user.email);
              router.replace('/(event)/feed');
              return true;
            }
            
            if (attempts < maxAttempts) {
              setTimeout(checkSession, 500);
            } else {
              console.log('❌ Max attempts reached, no session found');
              router.replace('/(event)/feed');
            }
            
          } catch (error) {
            console.error('Session check error:', error);
            if (attempts < maxAttempts) {
              setTimeout(checkSession, 500);
            } else {
              router.replace('/(event)/feed');
            }
          }
        };
        
        checkSession();
      };
      
      // Check initial URL
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleURL(url);
        } else {
          startSessionPolling();
        }
      });
      
      // Listen for URL changes
      const subscription = Linking.addEventListener('url', (event) => {
        handleURL(event.url);
      });
      
      return () => subscription?.remove();
    };

    handleAuthCallback();
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ActivityIndicator size="large" color={themeColors.tint} />
      <Text style={[styles.text, { color: themeColors.text }]}>
        Finalizando login...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  text: {
    marginTop: spacing.lg,
    fontSize: 16,
    textAlign: 'center',
  },
});