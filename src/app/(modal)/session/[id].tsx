import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header, Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { useAppStore } from '@/store/app.store';
import { SessionType, Speaker } from '@/types';
import { getGitHubAvatarUrl } from '@/utils/getGitHubAvatar';

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

interface SpeakerCardProps {
  speaker: Speaker;
  index: number;
  onPress: () => void;
}

function SpeakerCard({ speaker, index, onPress }: SpeakerCardProps) {
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];

  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View entering={SlideInRight.delay(index * 100).springify()}>
      <Pressable
        onPress={handlePress}
        style={[styles.speakerCard, { backgroundColor: themeColors.surfaceSecondary }]}
      >
        {(() => {
          // Get avatar URL: prefer photoUrl, then GitHub avatar, then fallback
          const avatarUrl =
            speaker.photoUrl || getGitHubAvatarUrl(speaker.links?.github) || undefined;

          return avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.speakerPhoto} contentFit="cover" />
          ) : (
            <View style={[styles.speakerPhoto, { backgroundColor: themeColors.surface }]}>
              <Ionicons name="person" size={32} color={themeColors.iconSecondary} />
            </View>
          );
        })()}

        <View style={styles.speakerInfo}>
          <Text variant="h4" color="text" numberOfLines={1}>
            {speaker.name}
          </Text>
          {speaker.role && speaker.company && (
            <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
              {speaker.role} @ {speaker.company}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={themeColors.iconSecondary} />
      </Pressable>
    </Animated.View>
  );
}

/**
 * Session detail screen.
 * Shows full session information with animated content.
 */
export default function SessionDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];

  const { getSession, isBookmarked, toggleBookmark, getSpeaker } = useActiveEvent();
  const { useLocalTimezone } = useAppStore();
  const session = getSession(id);

  // Compute bookmark status using the built-in method
  const isSessionBookmarked = isBookmarked(id);

  if (!session) {
    return (
      <Screen safeArea="both" centered>
        <Text variant="body" color="textSecondary">
          Palestra não encontrada
        </Text>
        <Button onPress={() => router.back()} style={styles.backButton}>
          Voltar
        </Button>
      </Screen>
    );
  }

  // Format times based on timezone preference
  // API times are in UTC format but represent local Brazil times
  const formatTime = (timeString: string, formatStr: string) => {
    if (useLocalTimezone) {
      // Use local device timezone - this will convert UTC to device's local time
      return format(new Date(timeString), formatStr, { locale: ptBR });
    } else {
      // Treat the UTC time as if it were a local time (ignore timezone)
      // This strips the timezone and treats 14:00Z as 14:00 local
      const utcDate = new Date(timeString);
      const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
      return format(localDate, formatStr, { locale: ptBR });
    }
  };

  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);

  const handleBookmarkPress = useCallback(() => {
    toggleBookmark(session.id);
  }, [session.id, toggleBookmark]);

  const handleSpeakerPress = (speakerId: string) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(modal)/speaker/${speakerId}`);
  };

  return (
    <Screen safeArea="bottom" padded={false}> 
      <Header title="Detalhes da Palestra" 
      left={
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color={themeColors.icon} />
        </TouchableOpacity>
      }
      right={
        <TouchableOpacity
          onPress={handleBookmarkPress}
          activeOpacity={0.6}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerButton}
        >
          <Ionicons name="bookmark-outline" size={24} color={themeColors.icon} />
        </TouchableOpacity>
      }
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxxl + spacing.xxxxl },
          { paddingTop: insets.top + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Type badge */}
        <Animated.View entering={FadeIn.delay(100)}>
          <View style={[styles.typeBadge, { backgroundColor: themeColors.tint }]}>
            <Text variant="label" color="textInverse">
              {getSessionTypeLabel(session.type)}
            </Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text variant="h1" color="text" style={styles.title}>
            {session.title}
          </Text>
        </Animated.View>

        {/* Time and location info */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={20} color={themeColors.icon} />
            <Text variant="body" color="text">
              {formatTime(session.startTime, "EEEE, d 'de' MMMM")}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={20} color={themeColors.icon} />
            <Text variant="body" color="text">
              {formatTime(session.startTime, 'HH:mm')} - {formatTime(session.endTime, 'HH:mm')}
            </Text>
          </View>

          {session.room && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={20} color={themeColors.icon} />
              <Text variant="body" color="text">
                {session.room}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Description */}
        {session.description && (
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <Text variant="h4" color="text" style={styles.sectionTitle}>
              Sobre
            </Text>
            <Text variant="body" color="textSecondary" style={styles.description}>
              {session.description}
            </Text>
          </Animated.View>
        )}

        {/* Speakers */}
        {session.speakers.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text variant="h4" color="text" style={styles.sectionTitle}>
              {session.speakers.length === 1 ? 'Palestrante' : 'Palestrantes'}
            </Text>
            <View style={styles.speakersList}>
              {session.speakers
                .map((speakerId) => getSpeaker(speakerId))
                .filter((speaker): speaker is Speaker => speaker !== undefined)
                .map((speaker, index) => (
                  <SpeakerCard
                    key={speaker.id}
                    speaker={speaker}
                    index={index}
                    onPress={() => handleSpeakerPress(speaker.id)}
                  />
                ))}
            </View>
          </Animated.View>
        )}

        {/* Tags */}
        {session.tags && session.tags.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <Text variant="h4" color="text" style={styles.sectionTitle}>
              Tags
            </Text>
            <View style={styles.tagsContainer}>
              {session.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: themeColors.surfaceSecondary }]}
                >
                  <Text variant="label" color="textSecondary">
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bookmark button fixed at bottom */}
      <Animated.View
        entering={FadeIn.delay(400)}
        style={[
          {
            position: 'absolute',
            bottom: insets.bottom,
            left: 0,
            right: 0,
            padding: spacing.lg,
            borderTopWidth: StyleSheet.hairlineWidth,
          },
          {
            backgroundColor: themeColors.background,
            borderTopColor: themeColors.border,
          },
        ]}
      >
        <Button
          variant={isSessionBookmarked ? 'secondary' : 'primary'}
          fullWidth
          leftIcon={
            <Ionicons
              name={isSessionBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSessionBookmarked ? themeColors.text : themeColors.textInverse}
            />
          }
          onPress={handleBookmarkPress}
        >
          {isSessionBookmarked ? 'Remover dos salvos' : 'Salvar'}
        </Button>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
  },
  metaContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  speakersList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  speakerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  speakerPhoto: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  speakerInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  backButton: {
    marginTop: spacing.lg,
  },
});
