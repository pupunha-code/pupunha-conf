import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { memo } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { Session, SessionType } from '@/types';
import { getGitHubAvatarUrl } from '@/utils/getGitHubAvatar';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SessionCardProps {
  session: Session;
  onPress: () => void;
  index?: number;
}

const getSessionTypeLabel = (type: SessionType): string => {
  const labels: Record<SessionType, string> = {
    talk: 'Palestra',
    workshop: 'Workshop',
    panel: 'Painel',
    keynote: 'Keynote',
    break: 'Intervalo',
    networking: 'Networking',
  };
  return labels[type] || type;
};

const getSessionTypeIcon = (type: SessionType): keyof typeof Ionicons.glyphMap => {
  const icons: Record<SessionType, keyof typeof Ionicons.glyphMap> = {
    talk: 'mic-outline',
    workshop: 'construct-outline',
    panel: 'people-outline',
    keynote: 'star-outline',
    break: 'cafe-outline',
    networking: 'chatbubbles-outline',
  };
  return icons[type] || 'calendar-outline';
};

export const SessionCard = memo(function SessionCard({
  session,
  onPress,
  index = 0,
}: SessionCardProps) {
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];
  const scale = useSharedValue(1);

  const { isBookmarked, toggleBookmark, getSpeaker } = useActiveEvent();
  const bookmarked = isBookmarked(session.id);

  const isBreak = session.type === 'break' || session.type === 'networking';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const handleBookmarkPress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleBookmark(session.id);
  };

  const startTime = format(new Date(session.startTime), 'HH:mm', { locale: ptBR });
  const endTime = format(new Date(session.endTime), 'HH:mm', { locale: ptBR });

  // Simplified card for breaks
  if (isBreak) {
    return (
      <Animated.View
        entering={FadeInUp.delay(index * 30).springify()}
        style={[
          styles.breakCard,
          { backgroundColor: themeColors.surfaceSecondary },
        ]}
      >
        <Ionicons
          name={getSessionTypeIcon(session.type)}
          size={20}
          color={themeColors.iconSecondary}
        />
        <View style={styles.breakContent}>
          <Text variant="label" color="textSecondary">
            {session.title}
          </Text>
          <Text variant="caption" color="textTertiary">
            {startTime} - {endTime} • {session.room}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Separate entering animation from scale animation to avoid Reanimated warning
  return (
    <Animated.View entering={FadeInUp.delay(index * 30).springify()}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.card,
          animatedStyle,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: themeColors.cardBorder,
          },
        ]}
      >
        {/* Header with type badge and bookmark */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: themeColors.surfaceSecondary },
            ]}
          >
            <Ionicons
              name={getSessionTypeIcon(session.type)}
              size={12}
              color={themeColors.icon}
            />
            <Text variant="caption" color="textSecondary">
              {getSessionTypeLabel(session.type)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleBookmarkPress}
            activeOpacity={0.6}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.bookmarkButton}
          >
            <Ionicons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? themeColors.tint : themeColors.iconSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text variant="h4" color="text" numberOfLines={2} style={styles.title}>
          {session.title}
        </Text>

        {/* Description */}
        {session.description && (
          <Text
            variant="bodySmall"
            color="textSecondary"
            numberOfLines={2}
            style={styles.description}
          >
            {session.description}
          </Text>
        )}

        {/* Speakers */}
        {session.speakers.length > 0 && (
          <View style={styles.speakers}>
            {session.speakers.map((speakerId) => {
              const speaker = getSpeaker(speakerId);
              if (!speaker) return null;

              // Get avatar URL: prefer photoUrl, then GitHub avatar, then fallback
              const avatarUrl =
                speaker.photoUrl ||
                getGitHubAvatarUrl(speaker.links?.github) ||
                undefined;

              return (
                <View key={speaker.id} style={styles.speaker}>
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.speakerPhoto}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.speakerPhoto,
                        { backgroundColor: themeColors.surfaceSecondary },
                      ]}
                    >
                      <Ionicons
                        name="person"
                        size={14}
                        color={themeColors.iconSecondary}
                      />
                    </View>
                  )}
                  <Text variant="label" color="text" numberOfLines={1}>
                    {speaker.name}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Footer with time and room */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color={themeColors.iconSecondary} />
            <Text variant="caption" color="textSecondary">
              {startTime} - {endTime}
            </Text>
          </View>

          {session.room && (
            <View style={styles.footerItem}>
              <Ionicons name="location-outline" size={14} color={themeColors.iconSecondary} />
              <Text variant="caption" color="textSecondary">
                {session.room}
              </Text>
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  bookmarkButton: {
    padding: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.md,
  },
  speakers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  speaker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  speakerPhoto: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // Break card styles
  breakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  breakContent: {
    flex: 1,
    gap: spacing.xxs,
  },
});
