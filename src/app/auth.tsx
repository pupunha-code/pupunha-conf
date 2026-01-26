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
      try {
        // Get the current URL with OAuth tokens
        const url = await Linking.getInitialURL();
        console.log('Auth screen received URL:', url);
        
        if (url && (url.includes('#access_token=') || url.includes('?access_token='))) {
          console.log('Processing OAuth tokens in auth screen...');
          
          // Extract the hash/query part
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
            
            console.log('Session set successfully, navigating to feed...');
          }
        }
        
        // Navigate to feed after processing (or just a delay if no tokens)
        setTimeout(() => {
          router.replace('/(event)/feed');
        }, 1500);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        // Navigate to feed anyway after delay
        setTimeout(() => {
          router.replace('/(event)/feed');
        }, 1500);
      }
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