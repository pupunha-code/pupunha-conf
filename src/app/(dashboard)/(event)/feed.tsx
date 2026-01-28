import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { FeedPostCard } from '@/components/feed/FeedPostCard';
import { LoginPrompt } from '@/components/feed/LoginPrompt';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/Text';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useTheme } from '@/hooks/useTheme';
import { colors, spacing } from '@/lib/theme';
import { useAuthStore } from '@/store/auth.store';
import { useFeedStore } from '@/store/feed.store';
import { FeedPost } from '@/types/feed';

export default function FeedScreen() {
  const router = useRouter();
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  const { posts, isLoading, fetchPosts, subscribeToUpdates, error, clearFeed } = useFeedStore();
  const { activeEvent } = useActiveEvent();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (activeEvent && isAuthenticated) {
      clearFeed();
      fetchPosts(activeEvent.id);

      const unsubscribe = subscribeToUpdates(activeEvent.id);
      return unsubscribe;
    }
    return undefined;
  }, [activeEvent?.id, isAuthenticated, fetchPosts, subscribeToUpdates, clearFeed]);

  const handleRefresh = async () => {
    if (!activeEvent || !isAuthenticated) return;

    setRefreshing(true);
    try {
      await fetchPosts(activeEvent.id);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreatePost = () => {
    router.push('/(modal)/create-post');
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const renderPost: ListRenderItem<FeedPost> = ({ item }) => <FeedPostCard post={item} />;

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable
        style={[styles.createButton, { borderColor: themeColors.border }]}
        onPress={handleCreatePost}
      >
        <Text variant="body" color="textSecondary">
          Compartilhe suas fotos do evento...
        </Text>
        <Ionicons name="camera" size={20} color={themeColors.textSecondary} />
      </Pressable>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles" size={64} color={themeColors.textTertiary} />
      <Text variant="h3" color="textSecondary" style={styles.emptyTitle}>
        Ainda não há posts
      </Text>
      <Text variant="body" color="textTertiary" style={styles.emptyDescription}>
        Seja o primeiro a compartilhar suas experiências do evento!
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="warning" size={48} color="#ef4444" />
      <Text variant="h3" color="text" style={styles.errorTitle}>
        Erro ao carregar feed
      </Text>
      <Text variant="body" color="textSecondary" style={styles.errorDescription}>
        {error}
      </Text>
    </View>
  );

  if (!activeEvent) {
    return (
      <Screen>
        <View style={styles.noEventState}>
          <Ionicons name="calendar" size={64} color={themeColors.textTertiary} />
          <Text variant="h3" color="textSecondary">
            Selecione um evento
          </Text>
          <Text variant="body" color="textTertiary" style={styles.noEventDescription}>
            Escolha um evento para ver o feed da comunidade
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea="top" padded={false}>
      <View style={styles.container}>
        <View style={styles.titleHeader}>
          <Text variant="h2" color="text">
            Feed
          </Text>
          <Text variant="label" color="textSecondary">
            {activeEvent.name}
          </Text>
        </View>

        {!isAuthenticated ? (
          <View style={styles.unauthenticatedContainer}>
            <LoginPrompt />
          </View>
        ) : error ? (
          renderError()
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              !isLoading ? (
                renderEmptyState
              ) : (
                <ActivityIndicator size="large" color={themeColors.tint} />
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={themeColors.tint}
                colors={[themeColors.tint]}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              posts.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    marginBottom: spacing.md,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  listContent: {
    padding: spacing.lg,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  errorTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  noEventState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  noEventDescription: {
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
