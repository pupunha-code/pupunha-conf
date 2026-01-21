import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/lib/theme';

export default function NotFoundScreen() {
  return (
    <Screen safeArea="both" centered>
      <View style={styles.container}>
        <Text variant="displayLarge" center>
          404
        </Text>
        <Text variant="h3" color="textSecondary" center style={styles.title}>
          Página não encontrada
        </Text>
        <Text variant="body" color="textTertiary" center style={styles.description}>
          A página que você está procurando não existe ou foi movida.
        </Text>
        <Link href="/" asChild>
          <Button style={styles.button}>Voltar ao início</Button>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginTop: spacing.md,
  },
  description: {
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
});
