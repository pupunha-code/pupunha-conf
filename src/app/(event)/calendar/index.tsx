import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout';
import { Card, Text } from '@/components/ui';
import { SessionCard } from '@/features/sessions/SessionCard';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { useEventStore } from '@/store';
import { EventDay, Session } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DayTabProps {
  day: EventDay;
  isActive: boolean;
  onPress: () => void;
  index: number;
}

function DayTab({ day, isActive, onPress, index }: DayTabProps) {
  const { colorScheme, hapticEnabled } = useTheme();
  const themeColors = colors[colorScheme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
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

  const dayDate = new Date(day.date);
  const dayOfWeek = format(dayDate, 'EEE', { locale: ptBR });
  const dayNumber = format(dayDate, 'd');

  // Separate entering animation from scale animation to avoid Reanimated warning
  return (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.dayTab,
          animatedStyle,
          {
            backgroundColor: isActive
              ? themeColors.tint
              : themeColors.surfaceSecondary,
            borderColor: isActive ? themeColors.tint : themeColors.border,
          },
        ]}
      >
        <Text
          variant="labelSmall"
          color={isActive ? 'textInverse' : 'textSecondary'}
          style={styles.dayOfWeek}
        >
          {dayOfWeek.toUpperCase()}
        </Text>
        <Text variant="h3" color={isActive ? 'textInverse' : 'text'}>
          {dayNumber}
        </Text>
        <Text
          variant="caption"
          color={isActive ? 'textInverse' : 'textTertiary'}
        >
          {day.label}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

/**
 * Calendar screen displaying sessions organized by day.
 * Uses day tabs when multiple days exist.
 */
export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  const themeColors = colors[colorScheme];

  const {
    getActiveEvent,
    getActiveDay,
    activeEventId,
    activeDayId,
    setActiveDay,
  } = useEventStore();

  const activeEvent = getActiveEvent();
  const activeDay = getActiveDay();
  const days = activeEvent?.days || [];
  const hasMultipleDays = days.length > 1;

  // Group sessions by time slot for better display
  const groupedSessions = useMemo(() => {
    if (!activeDay) return [];

    const groups = new Map<string, Session[]>();

    activeDay.sessions.forEach((session) => {
      const timeKey = session.startTime;
      const existing = groups.get(timeKey) || [];
      groups.set(timeKey, [...existing, session]);
    });

    return Array.from(groups.entries())
      .map(([time, sessions]) => ({
        time,
        sessions: sessions.sort((a, b) => {
          // Sort breaks/networking to the end of time slot
          if (a.type === 'break' && b.type !== 'break') return 1;
          if (a.type !== 'break' && b.type === 'break') return -1;
          return 0;
        }),
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [activeDay]);

  const handleDayPress = useCallback(
    (dayId: string) => {
      if (activeEventId) {
        setActiveDay(activeEventId, dayId);
      }
    },
    [activeEventId, setActiveDay],
  );

  const handleSessionPress = useCallback(
    (sessionId: string) => {
      router.push(`/(event)/session/${sessionId}`);
    },
    [router],
  );

  const handleChangeEvent = useCallback(() => {
    router.push('/');
  }, [router]);

  if (!activeEvent || !activeDay) {
    return (
      <Screen safeArea="both" centered>
        <Text variant="body" color="textSecondary">
          Nenhum evento selecionado
        </Text>
      </Screen>
    );
  }

  const currentDayId = activeDayId[activeEventId!];

  return (
    <Screen safeArea="top" padded={false}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Text variant="h2" numberOfLines={1} style={styles.eventName}>
              {activeEvent.name}
            </Text>
            <Pressable
              onPress={handleChangeEvent}
              style={[styles.changeEventButton, { backgroundColor: themeColors.surfaceSecondary }]}
            >
              <Ionicons name="swap-horizontal" size={16} color={themeColors.icon} />
            </Pressable>
          </View>

          {/* Day tabs - only show if multiple days */}
          {hasMultipleDays && (
            <View style={styles.dayTabs}>
              {days.map((day, index) => (
                <DayTab
                  key={day.id}
                  day={day}
                  isActive={day.id === currentDayId}
                  onPress={() => handleDayPress(day.id)}
                  index={index}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Sessions list */}
      <Animated.ScrollView
        entering={FadeIn.delay(200)}
        contentContainerStyle={[
          styles.sessionsContainer,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {groupedSessions.map(({ time, sessions }, groupIndex) => {
          const startTime = new Date(time);
          const timeLabel = format(startTime, 'HH:mm', { locale: ptBR });

          return (
            <View key={time} style={styles.timeGroup}>
              <View style={styles.timeHeader}>
                <View
                  style={[
                    styles.timeBadge,
                    { backgroundColor: themeColors.surfaceSecondary },
                  ]}
                >
                  <Text variant="label" color="text">
                    {timeLabel}
                  </Text>
                </View>
                <View
                  style={[styles.timeLine, { backgroundColor: themeColors.border }]}
                />
              </View>

              <View style={styles.sessionsList}>
                {sessions.map((session, sessionIndex) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onPress={() => handleSessionPress(session.id)}
                    index={groupIndex * 10 + sessionIndex}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    gap: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventName: {
    flex: 1,
  },
  changeEventButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayTab: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minWidth: 70,
  },
  dayOfWeek: {
    marginBottom: spacing.xxs,
  },
  sessionsContainer: {
    padding: spacing.lg,
  },
  timeGroup: {
    marginBottom: spacing.xl,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  timeLine: {
    flex: 1,
    height: 1,
    marginLeft: spacing.md,
  },
  sessionsList: {
    gap: spacing.md,
  },
});
