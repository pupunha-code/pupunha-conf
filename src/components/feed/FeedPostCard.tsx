import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ImageGrid } from '@/components/feed/ImageGrid';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { colors, spacing } from '@/lib/theme';
import { useAuthStore } from '@/store/auth.store';
import { useFeedStore } from '@/store/feed.store';
import { FeedPost } from '@/types/feed';

interface FeedPostCardProps {
  post: FeedPost;
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const router = useRouter();
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];
  const { user } = useAuthStore();
  const { deletePost } = useFeedStore();

  const isMyPost = user?.id === post.user_id;

  const handleDelete = () => {
    Alert.alert('Excluir Post', 'Tem certeza que deseja excluir este post?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.id);
            if (hapticEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir o post');
          }
        },
      },
    ]);
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {post.user_profile?.avatar_url ? (
            <Image
              source={{ uri: post.user_profile.avatar_url }}
              style={[styles.avatar, { borderColor: themeColors.border }]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                {
                  backgroundColor: themeColors.surfaceSecondary,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Ionicons name="person" size={16} color={themeColors.textSecondary} />
            </View>
          )}

          <View style={styles.authorDetails}>
            <Text variant="label" color="text">
              {post.user_profile?.name || 'Usuário'}
            </Text>
            <Text variant="caption" color="textSecondary">
              {timeAgo}
            </Text>
          </View>
        </View>

        {isMyPost && (
          <Pressable style={styles.deleteButton} onPress={handleDelete} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={16} color={themeColors.textSecondary} />
          </Pressable>
        )}
      </View>

      <Text variant="body" color="text" style={styles.content}>
        {post.content}
      </Text>

      {post.image_urls && post.image_urls.length > 0 && (
        <ImageGrid
          imageUrls={post.image_urls}
          onImagePress={(index) => {
            if (hapticEnabled) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const imagesParam = encodeURIComponent(JSON.stringify(post.image_urls));
            router.push(`/(modal)/image-viewer/${index}?images=${imagesParam}`);
          }}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorDetails: {
    flex: 1,
  },
  content: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  deleteButton: {
    padding: spacing.xs,
  },
});
