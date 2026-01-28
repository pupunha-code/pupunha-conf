import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { SessionCard } from '@/features/sessions/SessionCard';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useEventsQuery } from '@/hooks/useEventsQuery';
import { useTheme } from '@/hooks/useTheme';
import { colors, spacing } from '@/lib/theme';
import { ConferenceEvent } from '@/types/event';

/**
 * Bookmarked sessions screen.
 * Shows all saved sessions for the active event.
 */
export default function BookmarkedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];

  const { activeEvent, getBookmarkedSessions, isLoading, refetch } = useActiveEvent();
  const { data: events = [], refetch: refetchEvents } = useEventsQuery();
  const handleSessionPress = (sessionId: string) => {
    router.push(`/(modal)/session/${sessionId}`);
  };

  const handleExplore = () => {
    router.push('/(dashboard)/(event)/calendar');
  };

  const bookmarkedSessions = getBookmarkedSessions(events as ConferenceEvent[]);

  useFocusEffect(() => {
    refetchEvents();
  });

  if (!activeEvent) {
    return (
      <Screen safeArea="both" centered>
        <Text variant="body" color="textSecondary">
          Nenhum evento selecionado
        </Text>
      </Screen>
    );
  }

  return (
    <Screen safeArea="top" padded={false}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text variant="h2">Sessões Salvas</Text>
        {bookmarkedSessions.length > 0 && (
          <Text variant="bodySmall" color="textSecondary" style={styles.headerSubtitle}>
            {bookmarkedSessions.length}{' '}
            {bookmarkedSessions.length === 1 ? 'sessão salva' : 'sessões salvas'}
          </Text>
        )}
      </View>

      {bookmarkedSessions.length > 0 ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={themeColors.tint}
              colors={[themeColors.tint]}
            />
          }
        >
          {bookmarkedSessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => handleSessionPress(session.id)}
              index={index}
            />
          ))}
        </ScrollView>
      ) : (
        <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color={themeColors.iconSecondary} />
          <Text variant="h3" color="text" center style={styles.emptyTitle}>
            Nenhuma palestra salva
          </Text>
          <Text variant="body" color="textSecondary" center style={styles.emptyDescription}>
            Salve palestras para acessá-las rapidamente aqui. Toque no ícone de favorito em qualquer
            palestra para salvá-la.
          </Text>
          <Button onPress={handleExplore} style={styles.exploreButton}>
            Explorar programação
          </Button>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSubtitle: {
    marginTop: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
  },
  emptyDescription: {
    marginTop: spacing.sm,
    maxWidth: 300,
  },
  exploreButton: {
    marginTop: spacing.xl,
  },
});
