import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/lib/theme';
import { useAuthStore } from '@/store/auth.store';

export function LoginPrompt() {
  const { signInWithGoogle } = useAuthStore();

  const handleSignIn = async () => {
    try {
      console.log('LoginPrompt: Button pressed, calling signInWithGoogle...');
      await signInWithGoogle();
      console.log('LoginPrompt: signInWithGoogle completed');
    } catch (error) {
      console.error('LoginPrompt sign in error:', error);
      Alert.alert(
        'Erro no Login',
        error.message || 'Não foi possível fazer login com o Google. Tente novamente.',
      );
    }
  };

  return (
    <Card style={styles.container} elevated>
      <View style={styles.iconContainer}>
        <Ionicons name="person-circle" size={48} color="#6366f1" />
      </View>

      <Text variant="h3" color="text" style={styles.title}>
        Faça login para ver o feed
      </Text>

      <Text variant="body" color="textSecondary" style={styles.description}>
        Entre com sua conta do Google para ver e compartilhar fotos e comentários sobre o evento.
      </Text>

      <Button
        variant="primary"
        size="md"
        fullWidth
        onPress={handleSignIn}
        leftIcon={<Ionicons name="logo-google" size={18} color="white" />}
      >
        Entrar com Google
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
});
