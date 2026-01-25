import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout';
import { Button, Card, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { useEventStore } from '@/store';
import { Session } from '@/types';
import { getGitHubAvatarUrl } from '@/utils/getGitHubAvatar';

/**
 * Speaker detail screen.
 * Shows full speaker information with their sessions.
 */
export default function SpeakerDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];

  const { getSpeakerById, getSessionsBySpeakerId, getActiveEvent } = useEventStore();
  const speaker = getSpeakerById(id);
  const sessions = speaker ? getSessionsBySpeakerId(id) : [];
  const activeEvent = getActiveEvent();

  if (!speaker) {
    return (
      <Screen safeArea="both" centered>
        <Text variant="body" color="textSecondary">
          Palestrante não encontrado
        </Text>
        <Button onPress={() => router.back()} style={styles.backButton}>
          Voltar
        </Button>
      </Screen>
    );
  }

  const handleOpenLink = async (url: string) => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await WebBrowser.openBrowserAsync(url);
  };

  const avatarUrl = speaker.photoUrl || getGitHubAvatarUrl(speaker.links?.github) || undefined;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: Platform.OS === 'ios',
          headerBlurEffect: colorScheme === 'dark' ? 'dark' : 'light',
          title: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.6}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color={themeColors.icon} />
            </TouchableOpacity>
          ),
        }}
      />

      <Screen safeArea="top" padded={false}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Speaker Header */}
          <Animated.View entering={FadeIn.delay(100).springify()}>
            <View style={styles.header}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatar, { backgroundColor: themeColors.surfaceSecondary }]}>
                  <Ionicons name="person" size={64} color={themeColors.iconSecondary} />
                </View>
              )}

              <View style={styles.headerInfo}>
                <Text variant="h1" color="text" style={styles.name}>
                  {speaker.name}
                </Text>

                {(speaker.title || speaker.company) && (
                  <Text variant="body" color="textSecondary" style={styles.title}>
                    {speaker.title}
                    {speaker.title && speaker.company && ' @ '}
                    {speaker.company}
                  </Text>
                )}

                {/* Social Links */}
                {(speaker.links?.github || speaker.links?.linkedin || speaker.links?.twitter) && (
                  <View style={styles.socialLinks}>
                    {speaker.links?.github && (
                      <Pressable
                        onPress={() => handleOpenLink(speaker.links!.github!)}
                        style={[
                          styles.socialButton,
                          { backgroundColor: themeColors.surfaceSecondary },
                        ]}
                      >
                        <Ionicons name="logo-github" size={20} color={themeColors.icon} />
                      </Pressable>
                    )}
                    {speaker.links?.linkedin && (
                      <Pressable
                        onPress={() => handleOpenLink(speaker.links!.linkedin!)}
                        style={[
                          styles.socialButton,
                          { backgroundColor: themeColors.surfaceSecondary },
                        ]}
                      >
                        <Ionicons name="logo-linkedin" size={20} color={themeColors.icon} />
                      </Pressable>
                    )}
                    {speaker.links?.twitter && (
                      <Pressable
                        onPress={() => handleOpenLink(speaker.links!.twitter!)}
                        style={[
                          styles.socialButton,
                          { backgroundColor: themeColors.surfaceSecondary },
                        ]}
                      >
                        <Ionicons name="logo-twitter" size={20} color={themeColors.icon} />
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Bio */}
          {speaker.bio && (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <View style={styles.section}>
                <Text variant="h4" color="text" style={styles.sectionTitle}>
                  Sobre
                </Text>
                <Text variant="body" color="textSecondary" style={styles.bio}>
                  {speaker.bio}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Sessions */}
          {sessions.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <View style={styles.section}>
                <Text variant="h4" color="text" style={styles.sectionTitle}>
                  {sessions.length === 1 ? 'Palestra' : 'Palestras'} ({sessions.length})
                </Text>
                <View style={styles.sessionsList}>
                  {sessions.map((session, index) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      index={index}
                      onPress={() => router.push(`/(event)/session/${session.id}`)}
                    />
                  ))}
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </Screen>
    </>
  );
}

interface SessionCardProps {
  session: Session;
  index: number;
  onPress: () => void;
}

function SessionCard({ session, index, onPress }: SessionCardProps) {
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];

  const startTime = format(new Date(session.startTime), 'HH:mm', { locale: ptBR });
  const endTime = format(new Date(session.endTime), 'HH:mm', { locale: ptBR });

  return (
    <Pressable onPress={onPress}>
      <Card
        elevated
        style={[
          styles.sessionCard,
          { backgroundColor: themeColors.cardBackground, borderColor: themeColors.cardBorder },
        ]}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionTime}>
            <Ionicons name="time-outline" size={16} color={themeColors.tint} />
            <Text variant="label" color="tint">
              {startTime} - {endTime}
            </Text>
          </View>
          {session.room && (
            <View style={styles.sessionRoom}>
              <Ionicons name="location-outline" size={14} color={themeColors.iconSecondary} />
              <Text variant="caption" color="textSecondary">
                {session.room}
              </Text>
            </View>
          )}
        </View>

        <Text variant="h4" color="text" style={styles.sessionTitle}>
          {session.title}
        </Text>

        {session.description && (
          <Text
            variant="bodySmall"
            color="textSecondary"
            numberOfLines={2}
            style={styles.sessionDescription}
          >
            {session.description}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  headerInfo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  bio: {
    lineHeight: 24,
  },
  sessionsList: {
    gap: spacing.md,
  },
  sessionCard: {
    padding: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionRoom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionTitle: {
    marginBottom: spacing.xs,
  },
  sessionDescription: {
    marginTop: spacing.xs,
  },
  backButton: {
    marginTop: spacing.lg,
  },
  headerButton: {
    padding: spacing.xs,
  },
});
