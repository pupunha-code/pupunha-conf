import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { Speaker } from '@/types';
import { getGitHubAvatarUrl } from '@/utils/getGitHubAvatar';

interface SpeakerCardProps {
  speaker: Speaker;
  index: number;
}

const SpeakerCard = memo(function SpeakerCard({ speaker, index }: SpeakerCardProps) {
  const router = useRouter();
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];

  const handlePress = () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(event)/speaker/${speaker.id}`);
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).springify()}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.speakerCard,
          { backgroundColor: themeColors.cardBackground, borderColor: themeColors.cardBorder },
        ]}
      >
        {(() => {
          const avatarUrl =
            speaker.photoUrl || getGitHubAvatarUrl(speaker.links?.github) || undefined;

          return avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.speakerPhoto} contentFit="cover" />
          ) : (
            <View style={[styles.speakerPhoto, { backgroundColor: themeColors.surfaceSecondary }]}>
              <Ionicons name="person" size={40} color={themeColors.iconSecondary} />
            </View>
          );
        })()}

        <View style={styles.speakerInfo}>
          <Text variant="h4" color="text" numberOfLines={1}>
            {speaker.name}
          </Text>

          {(speaker.role || speaker.company) && (
            <Text variant="bodySmall" color="textSecondary" numberOfLines={2}>
              {speaker.role}
              {speaker.role && speaker.company && ' @ '}
              {speaker.company}
            </Text>
          )}

          {speaker.bio && (
            <Text variant="caption" color="textTertiary" numberOfLines={2} style={styles.bio}>
              {speaker.bio}
            </Text>
          )}

          {/* Social links */}
          {(speaker.links?.twitter || speaker.links?.github || speaker.links?.linkedin) && (
            <View style={styles.socialLinks}>
              {speaker.links?.twitter && (
                <View style={styles.socialLink}>
                  <Ionicons name="logo-twitter" size={14} color={themeColors.iconSecondary} />
                  <Text variant="caption" color="textSecondary">
                    @{speaker.links.twitter.split('/').pop()}
                  </Text>
                </View>
              )}
              {speaker.links?.github && (
                <View style={styles.socialLink}>
                  <Ionicons name="logo-github" size={14} color={themeColors.iconSecondary} />
                  <Text variant="caption" color="textSecondary">
                    {speaker.links.github.split('/').pop()}
                  </Text>
                </View>
              )}
              {speaker.links?.linkedin && (
                <View style={styles.socialLink}>
                  <Ionicons name="logo-linkedin" size={14} color={themeColors.iconSecondary} />
                  <Text variant="caption" color="textSecondary">
                    LinkedIn
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={themeColors.iconSecondary} />
      </Pressable>
    </Animated.View>
  );
});

/**
 * Speakers list screen.
 * Shows all speakers for the active event.
 */
export default function SpeakersScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];

  const { activeEvent, allSpeakers, isLoading, refetch } = useActiveEvent();
  const speakers = allSpeakers;

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
        <Text variant="h2">Palestrantes</Text>
        <Text variant="bodySmall" color="textSecondary" style={styles.headerSubtitle}>
          {speakers.length} {speakers.length === 1 ? 'palestrante' : 'palestrantes'} no{' '}
          {activeEvent.name}
        </Text>
      </View>

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
        {speakers.map((speaker, index) => (
          <SpeakerCard key={speaker.id} speaker={speaker} index={index} />
        ))}

        {speakers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={themeColors.iconSecondary} />
            <Text variant="body" color="textSecondary" center style={styles.emptyText}>
              Nenhum palestrante cadastrado
            </Text>
          </View>
        )}
      </ScrollView>
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
  speakerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  speakerPhoto: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  speakerInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  bio: {
    marginTop: spacing.xs,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    marginTop: spacing.md,
  },
});
