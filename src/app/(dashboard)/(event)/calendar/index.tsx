import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { SessionCard } from '@/features/sessions/SessionCard';
import { useActiveEvent } from '@/hooks/useActiveEvent';
import { useTheme } from '@/hooks/useTheme';
import { borderRadius, colors, spacing } from '@/lib/theme';
import { useAppStore } from '@/store/app.store';
import { EventDay, Session } from '@/types';
import { AnimatedFlashList, FlashList } from '@shopify/flash-list';

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
            backgroundColor: isActive ? themeColors.tint : themeColors.surfaceSecondary,
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
        <Text variant="caption" color={isActive ? 'textInverse' : 'textTertiary'}>
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

  const { activeEvent, activeDay, activeEventId, activeDayId, setActiveDay, isLoading, refetch } =
    useActiveEvent();
  const { useLocalTimezone } = useAppStore();

  const days = activeEvent?.days || [];
  const hasMultipleDays = days.length > 1;

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

  // Flatten sessions data for single FlashList
  const flattenedSessions = useMemo(() => {
    if (!activeDay) return [];

    const groups = new Map<string, Session[]>();

    activeDay.sessions.forEach((session) => {
      const timeKey = session.startTime;
      const existing = groups.get(timeKey) || [];
      groups.set(timeKey, [...existing, session]);
    });

    const sortedGroups = Array.from(groups.entries())
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

    // Flatten into single array with time headers and sessions
    const flattened: (
      | { type: 'timeHeader'; time: string }
      | { type: 'session'; session: Session }
    )[] = [];

    sortedGroups.forEach(({ time, sessions }) => {
      flattened.push({ type: 'timeHeader', time });
      sessions.forEach((session) => {
        flattened.push({ type: 'session', session });
      });
    });

    return flattened;
  }, [activeDay]);

  const handleDayPress = (dayId: string) => {
    if (activeEventId) {
      setActiveDay(activeEventId, dayId);
    }
  };

  const handleSessionPress = (sessionId: string) => {
    router.push(`/(modal)/session/${sessionId}`);
  };

  const handleChangeEvent = () => {
    router.push('/');
  };

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
    <Screen safeArea="none" padded={false}>
      {/* Header */}
      {hasMultipleDays && (
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <View style={styles.headerContent}>
            {/* Day tabs - only show if multiple days */}
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
          </View>
        </View>
      )}

      {/* Sessions list */}
      <AnimatedFlashList
        // entering={FadeIn.delay(200)}
        data={flattenedSessions}
        contentContainerStyle={[styles.sessionsContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={themeColors.tint}
            colors={[themeColors.tint]}
          />
        }
        renderItem={({ item, index }) => {
          if (item.type === 'timeHeader') {
            const timeLabel = formatTime(item.time, 'HH:mm');

            return (
              <View style={styles.timeHeader}>
                <View style={[styles.timeBadge, { backgroundColor: themeColors.surfaceSecondary }]}>
                  <Text variant="label" color="text">
                    {timeLabel}
                  </Text>
                </View>
                <View style={[styles.timeLine, { backgroundColor: themeColors.border }]} />
              </View>
            );
          }

          // Session item
          const session = item.session;
          return (
            <SessionCard
              session={session}
              onPress={() => handleSessionPress(session.id)}
              index={index}
            />
          );
        }}
        keyExtractor={(item, index) =>
          item.type === 'timeHeader' ? `time-${item.time}-${index}` : `session-${item.session.id}`
        }
        getItemType={(item) => item.type}
      />
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
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
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
});
